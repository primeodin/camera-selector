import type { BomItem, Camera, CameraClass, CameraType, Cluster, Detector, NvrTier, PlanConfig, PlanResult, QualityTier, ResolutionSpec, SwitchPick, Zone } from './planner.types';

export const CAM: Record<CameraType, CameraClass> = {
  standard: { w: 8, label: 'Standard', sub: 'Dome / bullet, fixed lens', price: 58, rune: 'Raven' },
  ptz: { w: 15, label: 'PTZ', sub: 'Pan-tilt-zoom, motorised', price: 185, rune: 'Hawk' },
  highpower: { w: 25, label: 'PoE++', sub: 'Multi-sensor / heated', price: 265, rune: 'Eagle' },
};

export const RES: Record<PlanConfig['resolution'], ResolutionSpec> = {
  '2mp': { label: '2 MP · 1080p', mbps: 4 },
  '4mp': { label: '4 MP · 1440p', mbps: 8 },
  '8mp': { label: '8 MP · 4K', mbps: 16 },
};

export const GB_PER_MBPS_DAY = 10.8;
export const EVENT_DUTY = 0.18;

export const SWITCHES = [
  { id: 'sw8', name: '8-port PoE+ switch', ports: 8, poe: 65, uplink: '1G', price: 120 },
  { id: 'sw16', name: '16-port PoE+ switch', ports: 16, poe: 150, uplink: '1G / SFP', price: 210 },
  { id: 'sw24', name: '24-port PoE+ switch', ports: 24, poe: 195, uplink: 'SFP+ 10G', price: 340 },
  { id: 'sw48', name: '48-port PoE++ switch', ports: 48, poe: 600, uplink: 'SFP+ 10G', price: 720 },
] as const;
export const AGG = { id: 'agg', name: '8-port 10GbE aggregation switch', ports: 8, poe: 0, uplink: 'SFP+ 10G', price: 360 } as const;

export const DETECTORS: Detector[] = [
  { id: 'coral', name: 'Google Coral USB', sub: 'Edge TPU · up to ~12 streams', max: 12, price: 60 },
  { id: 'hailo8l', name: 'Hailo-8L M.2', sub: '13 TOPS · up to ~30 streams', max: 30, price: 70 },
  { id: 'hailo8', name: 'Hailo-8 M.2', sub: '26 TOPS · up to ~64 streams', max: 64, price: 120 },
];

export const NVR_TIERS: NvrTier[] = [
  { max: 8, name: 'Mini PC · Intel N100', sub: '16 GB RAM · fanless · ~10W idle', price: 180 },
  { max: 20, name: 'NUC-class · Core i5 / Ryzen 5', sub: '32 GB RAM · NVMe boot', price: 420 },
  { max: 40, name: 'Custom build · Core i7 / Ryzen 7', sub: '64 GB RAM · 2× HDD bays', price: 780 },
  { max: 64, name: 'Tower server · Xeon / Ryzen 9', sub: '128 GB ECC · 4× HDD bays', price: 1450 },
];

export function clamp(n: number, a: number, b: number): number {
  return Math.max(a, Math.min(b, n));
}

export function clusterCount(c: Pick<Cluster, 'standard' | 'ptz' | 'highpower'>): number {
  return (c.standard || 0) + (c.ptz || 0) + (c.highpower || 0);
}

export function clusterPower(c: Pick<Cluster, 'standard' | 'ptz' | 'highpower'>): number {
  return c.standard * CAM.standard.w + c.ptz * CAM.ptz.w + c.highpower * CAM.highpower.w;
}

export function deriveClusters(zones: Zone[], cameras: Camera[]): Cluster[] {
  return zones.map((zone) => {
    const counts = { standard: 0, ptz: 0, highpower: 0 } satisfies Record<CameraType, number>;
    for (const camera of cameras) {
      if (camera.zoneId === zone.id) counts[camera.type] += 1;
    }
    return { name: zone.name, link: zone.link, ...counts };
  });
}

export function switchesForCluster(c: Cluster): SwitchPick[] {
  const cams = clusterCount(c);
  const power = clusterPower(c);
  if (cams === 0) return [];
  const needHeadroom = power * 1.25;
  for (const sw of SWITCHES) {
    if (sw.ports - 1 >= cams && sw.poe >= needHeadroom) return [{ ...sw, qty: 1, load: power, cams }];
  }
  const big = SWITCHES[SWITCHES.length - 1];
  const byPort = Math.ceil(cams / (big.ports - 1));
  const byPower = Math.ceil(needHeadroom / big.poe);
  const qty = Math.max(byPort, byPower);
  return [{ ...big, qty, load: power, cams }];
}

function pick<T extends { max: number }>(arr: T[], n: number): T {
  return arr.find((x) => n <= x.max) ?? arr[arr.length - 1];
}

function tierMultiplier(tier: QualityTier): number {
  if (tier === 'good') return 0.82;
  if (tier === 'best') return 1.35;
  return 1;
}

export function plan(config: PlanConfig): PlanResult {
  const clusters = config.clusters.filter((c) => clusterCount(c) > 0);
  const totalCams = clusters.reduce((s, c) => s + clusterCount(c), 0);
  const totalPower = clusters.reduce((s, c) => s + clusterPower(c), 0);
  const access = clusters.map((c) => ({ cluster: c, switches: switchesForCluster(c), link: c.link || 'wired' }));
  const totalAccessSwitches = access.reduce((s, a) => s + a.switches.reduce((q, sw) => q + sw.qty, 0), 0);
  const multiSwitch = totalAccessSwitches > 1 || clusters.length > 1;
  const needBackbone = totalCams >= 48;
  const lacp = multiSwitch;
  const topology = !multiSwitch ? 'single' : needBackbone ? 'backbone' : 'core-access';
  const wirelessLinks = multiSwitch ? access.filter((a) => a.link === 'wireless').length : 0;

  const totalPoeBudget = access.reduce((s, a) => s + a.switches.reduce((q, sw) => q + sw.poe * sw.qty, 0), 0);
  const headroomPct = totalPoeBudget > 0 ? Math.round(((totalPoeBudget - totalPower) / totalPoeBudget) * 100) : 0;
  const res = RES[config.resolution] || RES['4mp'];
  const duty = config.recordMode === 'event' ? EVENT_DUTY : 1;
  const wirelessMaxMbps = multiSwitch ? access.filter((a) => a.link === 'wireless').reduce((m, a) => Math.max(m, clusterCount(a.cluster) * res.mbps), 0) : 0;
  const gbPerCamDay = res.mbps * GB_PER_MBPS_DAY * duty;
  const totalGbDay = gbPerCamDay * totalCams;
  const totalTb = (totalGbDay * config.retention) / 1000;
  const recTb = Math.max(2, Math.ceil(totalTb * 1.2));
  const driveSizes = [4, 6, 8, 12, 16, 20];
  const drive = driveSizes.find((d) => d >= recTb) || Math.ceil(recTb / 20) * 20;
  const driveQty = drive > 20 ? Math.ceil(recTb / 20) : 1;
  const driveSize = drive > 20 ? 20 : drive;

  const tier = config.tier || 'better';
  const nvr = pick(NVR_TIERS, totalCams);
  const nvrNodes = totalCams > 64 ? Math.ceil(totalCams / 64) : 1;
  const detector = pick(DETECTORS, Math.ceil(totalCams / nvrNodes));
  const detectorQty = nvrNodes;
  const tierMul = tierMultiplier(tier);
  const bom: BomItem[] = [];

  (Object.keys(CAM) as CameraType[]).forEach((k) => {
    const qty = clusters.reduce((s, c) => s + (c[k] || 0), 0);
    if (qty) bom.push({ group: 'Cameras', name: `${CAM[k].label} camera`, sub: CAM[k].sub, qty, unit: Math.round(CAM[k].price * tierMul) });
  });

  const swSummary = new Map<string, { name: string; price: number; qty: number; poe: number }>();
  access.forEach((a) =>
    a.switches.forEach((sw) => {
      const row = swSummary.get(sw.id) ?? { name: sw.name, price: sw.price, qty: 0, poe: sw.poe };
      row.qty += sw.qty;
      swSummary.set(sw.id, row);
    }),
  );
  swSummary.forEach((sw) => bom.push({ group: 'Network', name: sw.name, sub: `${sw.poe}W PoE budget`, qty: sw.qty, unit: sw.price }));
  if (needBackbone) bom.push({ group: 'Network', name: AGG.name, sub: '10G core / LACP', qty: 1, unit: AGG.price });
  else if (multiSwitch) bom.push({ group: 'Network', name: '8-port gigabit core switch', sub: 'aggregates access uplinks + NVR', qty: 1, unit: 70 });
  if (wirelessLinks > 0) bom.push({ group: 'Network', name: 'Wireless bridge kit (PtP)', sub: '5 GHz point-to-point · per remote site', qty: wirelessLinks, unit: 190 });
  bom.push({ group: 'Network', name: 'Cat6 drops + keystones', sub: 'bulk cable, ends, faceplates', qty: totalCams, unit: 14 });
  bom.push({ group: 'Recorder', name: nvr.name, sub: nvr.sub, qty: nvrNodes, unit: Math.round(nvr.price * tierMul) });
  bom.push({ group: 'Recorder', name: detector.name, sub: detector.sub, qty: detectorQty, unit: detector.price });
  bom.push({ group: 'Storage', name: `${driveSize} TB surveillance HDD`, sub: 'CMR, 24/7 rated', qty: driveQty, unit: Math.round(driveSize * 21) });

  const grouped = { Cameras: [], Network: [], Recorder: [], Storage: [] } as Record<BomItem['group'], BomItem[]>;
  bom.forEach((b) => grouped[b.group].push(b));
  const total = bom.reduce((s, b) => s + b.qty * b.unit, 0);

  return {
    totalCams,
    totalPower,
    clusters: clusters.length,
    access,
    topology,
    multiSwitch,
    needBackbone,
    lacp,
    wirelessLinks,
    wirelessMaxMbps,
    totalAccessSwitches,
    totalPoeBudget,
    headroomPct,
    res,
    duty,
    gbPerCamDay,
    totalGbDay,
    totalTb,
    recTb,
    driveSize,
    driveQty,
    nvr,
    nvrNodes,
    detector,
    detectorQty,
    tier,
    bom: grouped,
    bomFlat: bom,
    total,
  };
}

export function slugifyName(name: string): string {
  return (name || 'cluster').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || 'cluster';
}

export function frigateConfig(config: PlanConfig, p: PlanResult): string {
  const det = p.detector.id === 'coral' ? 'edgetpu' : 'hailo8l';
  let cams = '';
  let idx = 1;
  config.clusters.filter((c) => clusterCount(c) > 0).forEach((cl) => {
    const n = clusterCount(cl);
    const slug = slugifyName(cl.name);
    for (let i = 0; i < n; i += 1) {
      cams += `  ${slug}_${i + 1}:\n` +
        `    ffmpeg:\n      inputs:\n` +
        `        - path: rtsp://USER:PASS@10.10.20.${idx}:554/sub\n` +
        `          roles: [detect]\n` +
        `        - path: rtsp://USER:PASS@10.10.20.${idx}:554/main\n` +
        `          roles: [record]\n` +
        `    detect:\n      width: 640\n      height: 360\n      fps: 5\n`;
      idx += 1;
    }
  });
  return `mqtt:\n  enabled: false\n\n` +
    `detectors:\n  ${det === 'edgetpu' ? 'coral' : 'hailo'}:\n    type: ${det}\n` +
    (det === 'edgetpu' ? `    device: usb\n` : `    device: PCIe\n`) + `\n` +
    `record:\n  enabled: true\n  retain:\n    days: ${config.recordMode === 'event' ? 3 : config.retention}\n    mode: ${config.recordMode === 'event' ? 'motion' : 'all'}\n` +
    `  alerts:\n    retain:\n      days: ${config.retention}\n  detections:\n    retain:\n      days: ${config.retention}\n\n` +
    `objects:\n  track: [person, car, dog]\n\n` +
    `cameras:\n${cams}`;
}

export function money(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}
