/**
 * Normalize public product payloads so UI can rely on `shortDescription` (camelCase).
 * Admin uses `shortDescription`; some GET handlers may omit it or use `short_description`.
 */
export function normalizePublicProductRecord(raw: unknown): any {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {} as any;
  }

  const r = raw as Record<string, unknown>;
  const meta =
    r.metadata != null && typeof r.metadata === "object" && !Array.isArray(r.metadata)
      ? (r.metadata as Record<string, unknown>)
      : null;

  let shortDescription = "";
  for (const v of [
    r.shortDescription,
    r.short_description,
    meta?.shortDescription,
    meta?.short_description,
  ]) {
    if (typeof v === "string" && v.trim() !== "") {
      shortDescription = v;
      break;
    }
  }

  const out: Record<string, unknown> = { ...r, shortDescription };

  if (r.slug != null && r.slug !== "") {
    out.slug = String(r.slug).trim();
  }

  if (out.basePrice == null && r.price != null) {
    const n = typeof r.price === "number" ? r.price : parseFloat(String(r.price));
    if (Number.isFinite(n)) out.basePrice = n;
  }

  return out as any;
}
