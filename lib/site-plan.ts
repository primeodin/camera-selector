import type { CameraType } from './planner.types';

export interface BlueprintPreview {
  name: string;
  url: string;
}

export interface CameraVisionProfile {
  angle: number;
  range: number;
  label: string;
}

const VISION_PROFILES: Record<CameraType, CameraVisionProfile> = {
  standard: { angle: 78, range: 150, label: 'General coverage' },
  ptz: { angle: 132, range: 190, label: 'PTZ sweep' },
  highpower: { angle: 46, range: 220, label: 'Long-range corridor' },
};

export function cameraVisionProfile(type: CameraType): CameraVisionProfile {
  return VISION_PROFILES[type];
}

export function revokeBlueprintPreview(preview: BlueprintPreview | null): void {
  if (preview?.url) {
    URL.revokeObjectURL(preview.url);
  }
}
