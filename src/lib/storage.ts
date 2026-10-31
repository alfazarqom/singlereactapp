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

export function isCartArray(value: unknown): value is any[] {
  return Array.isArray(value) && value.every((item) =>
    item !== null && typeof item === "object" &&
    (item as Record<string, unknown>).product !== null && typeof (item as Record<string, unknown>).product === "object" &&
    typeof ((item as { product: Record<string, unknown> }).product).id === "string" &&
    Number.isInteger((item as Record<string, unknown>).quantity) && Number((item as Record<string, unknown>).quantity) > 0 &&
    typeof (item as Record<string, unknown>).selectedColor === "string" &&
    typeof (item as Record<string, unknown>).selectedSize === "string"
  );
}
