export type CameraType = 'standard' | 'ptz' | 'highpower';
export type LinkType = 'wired' | 'wireless';
export type Resolution = '2mp' | '4mp' | '8mp';
export type RecordMode = 'continuous' | 'event';
export type QualityTier = 'good' | 'better' | 'best';

export interface Camera {
  id: string;
  zoneId: string;
  type: CameraType;
  x: number;
  y: number;
  angle: number;
}

export interface Zone {
  id: string;
  name: string;
  link: LinkType;
}

export interface Settings {
  resolution: Resolution;
  recordMode: RecordMode;
  retention: number;
  tier: QualityTier;
}

export interface Cluster {
  name: string;
  link: LinkType;
  standard: number;
  ptz: number;
  highpower: number;
}

export interface PlanConfig extends Settings {
  clusters: Cluster[];
}

export interface CameraClass {
  w: number;
  label: string;
  sub: string;
  price: number;
  rune: string;
}

export interface ResolutionSpec {
  label: string;
  mbps: number;
}

export interface SwitchPick {
  id: string;
  name: string;
  ports: number;
  poe: number;
  uplink: string;
  price: number;
  qty: number;
  load: number;
  cams: number;
}

export interface Detector {
  id: 'coral' | 'hailo8l' | 'hailo8';
  name: string;
  sub: string;
  max: number;
  price: number;
}

export interface NvrTier {
  max: number;
  name: string;
  sub: string;
  price: number;
}

export interface BomItem {
  group: 'Cameras' | 'Network' | 'Recorder' | 'Storage';
  name: string;
  sub: string;
  qty: number;
  unit: number;
}

export interface PlanResult {
  totalCams: number;
  totalPower: number;
  clusters: number;
  access: { cluster: Cluster; switches: SwitchPick[]; link: LinkType }[];
  topology: 'single' | 'core-access' | 'backbone';
  multiSwitch: boolean;
  needBackbone: boolean;
  lacp: boolean;
  wirelessLinks: number;
  wirelessMaxMbps: number;
  totalAccessSwitches: number;
  totalPoeBudget: number;
  headroomPct: number;
  res: ResolutionSpec;
  duty: number;
  gbPerCamDay: number;
  totalGbDay: number;
  totalTb: number;
  recTb: number;
  driveSize: number;
  driveQty: number;
  nvr: NvrTier;
  nvrNodes: number;
  detector: Detector;
  detectorQty: number;
  tier: QualityTier;
  bom: Record<BomItem['group'], BomItem[]>;
  bomFlat: BomItem[];
  total: number;
}
