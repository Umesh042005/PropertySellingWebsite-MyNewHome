// ₹45,00,000
export function formatPrice(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return "Price on request";
  return `₹${n.toLocaleString("en-IN")}`;
}

// ₹45 L / ₹1.2 Cr — compact Indian notation for cards
export function formatPriceShort(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return "On request";
  if (n >= 1e7) return `₹${trim(n / 1e7)} Cr`;
  if (n >= 1e5) return `₹${trim(n / 1e5)} L`;
  if (n >= 1e3) return `₹${trim(n / 1e3)}K`;
  return `₹${n}`;
}

function trim(x) {
  return Number(x.toFixed(2)).toString();
}

export function timeAgo(iso) {
  if (!iso) return null;
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const units = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [unit, size] of units) {
    const v = Math.floor(seconds / size);
    if (v >= 1) return `${v} ${unit}${v > 1 ? "s" : ""} ago`;
  }
  return null;
}
