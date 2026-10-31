export function readJsonStorage<T>(
  key: string,
  fallback: T,
  isValid: (value: unknown) => value is T,
): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed: unknown = JSON.parse(raw);
    if (isValid(parsed)) return parsed;
    window.localStorage.removeItem(key);
  } catch {
    try { window.localStorage.removeItem(key); } catch { /* Storage may be unavailable. */ }
  }
  return fallback;
}

export function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}
