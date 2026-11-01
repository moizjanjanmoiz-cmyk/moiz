export function formatPakistaniWhatsAppNumber(raw: string) {
  const cleaned = (raw || '').replace(/[^\d+]/g, '').trim();
  if (!cleaned) return { isValid: false, formatted: '' };
  const normalized = cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
  return { isValid: normalized.length >= 10, formatted: normalized };
}
