export function generateShopSlug(value: string) {
  return (value || 'shop')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'shop';
}
