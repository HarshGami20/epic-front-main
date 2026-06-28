const DEFAULT_REDIRECT = "/account-orders";

/**
 * Returns a same-origin relative path safe for post-login navigation.
 * Rejects open redirects (//evil.com, https://..., encoded tricks).
 */
export function getSafeRedirectUrl(
  candidate: string | null | undefined,
  fallback = DEFAULT_REDIRECT
): string {
  if (!candidate) return fallback;

  const trimmed = candidate.trim();
  if (!trimmed || !trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return fallback;
  }

  if (trimmed.includes("://") || trimmed.includes("\\")) {
    return fallback;
  }

  try {
    const parsed = new URL(trimmed, "http://localhost");
    if (parsed.origin !== "http://localhost") return fallback;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}
