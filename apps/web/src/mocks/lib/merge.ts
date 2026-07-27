/**
 * Merge only defined keys into the target. Prevents optional-partial spreads
 * from widening required fields to `T | undefined` under exactOptionalPropertyTypes.
 */
export function mergeDefined<T extends object>(target: T, patch: { [K in keyof T]?: T[K] | undefined }): T {
  const out: T = { ...target };
  for (const key of Object.keys(patch) as (keyof T)[]) {
    const v = patch[key];
    if (v !== undefined) {
      out[key] = v as T[typeof key];
    }
  }
  return out;
}
