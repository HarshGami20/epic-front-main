/** Key/value rows for the PDP "Specifications" / additional info block. */
export function buildProductSpecRows(product: Record<string, any> | null | undefined) {
  if (!product) return [] as { label: string; value: string }[];

  const seen = new Set<string>();
  const rows: { label: string; value: string }[] = [];

  const add = (label: string, value: unknown) => {
    if (value == null || value === "") return;
    const str = String(value).trim();
    if (!str) return;
    const key = label.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    rows.push({ label, value: str });
  };

  const specs = product?.metadata?.specifications;
  if (Array.isArray(specs)) {
    for (const s of specs) {
      if (!s || typeof s !== "object") continue;
      const label = s.label != null ? String(s.label) : "";
      const value = s.value != null ? String(s.value) : "";
      if (label) add(label, value);
    }
  }

  add("SKU", product.sku);
  add("Brand", product.brand);
  add("Category", product.category);
  if (Array.isArray(product.categories) && product.categories.length > 0) {
    add("Categories", product.categories.join(", "));
  }
  if (Array.isArray(product.subCategories) && product.subCategories.length > 0) {
    add("Subcategories", product.subCategories.join(", "));
  }
  add("Type", product.type);

  return rows;
}
