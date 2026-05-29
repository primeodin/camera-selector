import { describe, expect, it } from 'vitest';
import { clusterCount, clusterPower, deriveClusters, frigateConfig, plan } from './planner';
import type { Camera, PlanConfig, Zone } from './planner.types';

const base: PlanConfig = {
  resolution: '4mp',
  recordMode: 'event',
  retention: 14,
  tier: 'better',
  clusters: [
    { name: 'House', link: 'wired', standard: 4, ptz: 1, highpower: 0 },
    { name: 'Barn', link: 'wireless', standard: 2, ptz: 0, highpower: 1 },
  ],
};

describe('planner engine', () => {
  it('counts and powers clusters from canonical camera classes', () => {
    const cluster = { name: 'Yard', link: 'wired' as const, standard: 3, ptz: 2, highpower: 1 };
    expect(clusterCount(cluster)).toBe(6);
    expect(clusterPower(cluster)).toBe(79);
  });

  it('selects switches, topology, storage, and wireless guidance from the handoff formulas', () => {
    const result = plan(base);

    expect(result.totalCams).toBe(8);
    expect(result.totalPower).toBe(88);
    expect(result.topology).toBe('core-access');
    expect(result.lacp).toBe(true);
    expect(result.wirelessLinks).toBe(1);
    expect(result.wirelessMaxMbps).toBe(24);
    expect(result.totalPoeBudget).toBe(130);
    expect(result.headroomPct).toBe(32);
    expect(result.gbPerCamDay).toBeCloseTo(15.552);
    expect(result.recTb).toBe(3);
    expect(result.driveSize).toBe(4);
    expect(result.nvr.name).toContain('Intel N100');
    expect(result.detector.id).toBe('coral');
    expect(result.total).toBe(1734);
  });

  it('groups cameras by zone as the single source of truth', () => {
    const zones: Zone[] = [
      { id: 'front', name: 'Front', link: 'wired' },
      { id: 'barn', name: 'Barn', link: 'wireless' },
    ];
    const cameras: Camera[] = [
      { id: 'a', zoneId: 'front', type: 'standard', x: 0.2, y: 0.2, angle: 90 },
      { id: 'b', zoneId: 'front', type: 'ptz', x: 0.5, y: 0.5, angle: 120 },
      { id: 'c', zoneId: 'barn', type: 'highpower', x: 0.8, y: 0.6, angle: 180 },
    ];

    expect(deriveClusters(zones, cameras)).toEqual([
      { name: 'Front', link: 'wired', standard: 1, ptz: 1, highpower: 0 },
      { name: 'Barn', link: 'wireless', standard: 0, ptz: 0, highpower: 1 },
    ]);
  });

  it('emits starter Frigate yaml with detector, retention, and per-camera RTSP entries', () => {
    const result = plan(base);
    const yaml = frigateConfig(base, result);

    expect(yaml).toContain('mqtt:\n  enabled: false');
    expect(yaml).toContain('type: edgetpu');
    expect(yaml).toContain('mode: motion');
    expect(yaml).toContain('house_1:');
    expect(yaml).toContain('barn_3:');
    expect(yaml.match(/roles: \[record\]/g)).toHaveLength(8);
  });
});
