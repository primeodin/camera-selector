import { describe, expect, it, vi } from 'vitest';
import { cameraVisionProfile, revokeBlueprintPreview } from './site-plan';

describe('site plan presentation helpers', () => {
  it('uses distinct field-of-view profiles for each camera class', () => {
    expect(cameraVisionProfile('standard')).toEqual({ angle: 78, range: 150, label: 'General coverage' });
    expect(cameraVisionProfile('ptz')).toEqual({ angle: 132, range: 190, label: 'PTZ sweep' });
    expect(cameraVisionProfile('highpower')).toEqual({ angle: 46, range: 220, label: 'Long-range corridor' });
  });

  it('revokes local blueprint preview object URLs only when present', () => {
    const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);

    revokeBlueprintPreview(null);
    revokeBlueprintPreview({ name: 'barn.png', url: 'blob:http://localhost/barn' });

    expect(revoke).toHaveBeenCalledTimes(1);
    expect(revoke).toHaveBeenCalledWith('blob:http://localhost/barn');
    revoke.mockRestore();
  });
});
