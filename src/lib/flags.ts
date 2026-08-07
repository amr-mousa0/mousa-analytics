import { getEnv } from '../config/env.js';

export interface FeatureFlags {
  USE_PERSISTENT_STORAGE: boolean;
  ENABLE_IDEMPOTENCY: boolean;
  ENABLE_TRANSLATION_FALLBACK: boolean;
}

export class FeatureFlagManager {
  private static overrides: Partial<FeatureFlags> = {};

  public static isEnabled(flag: keyof FeatureFlags): boolean {
    if (this.overrides[flag] !== undefined) {
      return this.overrides[flag]!;
    }
    const env = getEnv();
    return Boolean(env[flag]);
  }

  public static setOverride(flag: keyof FeatureFlags, enabled: boolean): void {
    this.overrides[flag] = enabled;
  }

  public static clearOverrides(): void {
    this.overrides = {};
  }
}
