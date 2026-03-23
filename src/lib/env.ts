const DEFAULT_API_URL = "http://localhost:5001/api";
const DEFAULT_ASSET_ORIGIN = "http://localhost:5001";

function stripTrailingSlash(s: string): string {
  return s.replace(/\/+$/, "");
}

/** Backend REST base URL (must be public — used in the browser). See `.env.example`. */
export function getPublicApiUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!raw) return DEFAULT_API_URL;
  return stripTrailingSlash(raw);
}

/**
 * Origin used to resolve `/uploads/...` paths. Optional; otherwise derived from
 * `NEXT_PUBLIC_API_URL` by dropping a trailing `/api`.
 */
export function getPublicAssetOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_ASSET_ORIGIN?.trim();
  if (raw) return stripTrailingSlash(raw);
  const api = getPublicApiUrl();
  const withoutApi = stripTrailingSlash(api.replace(/\/api\/?$/, ""));
  return withoutApi || DEFAULT_ASSET_ORIGIN;
}
