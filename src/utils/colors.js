export const PRESET_BASES = [
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#facc15", // yellow
  "#10b981", // green
  "#3b82f6", // blue
  "#7c3aed", // purple
];

export function shadeHex(hex, percent) {
  const h = String(hex).replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return hex;
  const num = parseInt(h, 16);
  const clamp = (v) => Math.max(0, Math.min(255, v));
  const r = clamp((num >> 16) + Math.round(255 * percent));
  const g = clamp(((num >> 8) & 0xff) + Math.round(255 * percent));
  const b = clamp((num & 0xff) + Math.round(255 * percent));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export const PRESETS = PRESET_BASES.map((base) => ({
  base,
  light: shadeHex(base, 0.22),
  dark: shadeHex(base, -0.18),
}));