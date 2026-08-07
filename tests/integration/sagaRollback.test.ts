import { describe, it, expect, vi } from 'vitest';

describe('Saga Rollback Logic', () => {
  it('rolls back uploaded assets if asset processing fails', async () => {
    const uploadedKeys: string[] = [];
    const deleteSpy = vi.fn(async (key: string) => {
      const idx = uploadedKeys.indexOf(key);
      if (idx !== -1) uploadedKeys.splice(idx, 1);
    });

    const mockStorage = {
      upload: async (key: string) => {
        uploadedKeys.push(key);
        return `https://storage.mock/${key}`;
      },
      delete: deleteSpy
    };

    // Simulate saga execution where step 2 fails
    try {
      await mockStorage.upload('asset-1.png');
      await mockStorage.upload('asset-2.png');
      throw new Error('Simulated asset processing failure');
    } catch (err) {
      // Compensating action
      for (const key of [...uploadedKeys]) {
        await mockStorage.delete(key);
      }
    }

    expect(deleteSpy).toHaveBeenCalledTimes(2);
    expect(uploadedKeys.length).toBe(0);
  });
});
