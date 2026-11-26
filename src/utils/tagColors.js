/**
 * Deterministic tag colours: each tag hashes to one of five hues so the same
 * tag always looks the same everywhere. Soft fill + coloured text, consistent style.
 * Class strings are written out in full so Tailwind can detect them.
 */
const PALETTE = [
  {
    hex: "#22d3ee",
    chip: "border-accent-cyan/30 bg-accent-cyan/[0.12] text-accent-cyan hover:bg-accent-cyan/20",
    active: "border-accent-cyan bg-accent-cyan/25 text-accent-cyan ring-1 ring-accent-cyan/60",
  },
  {
    hex: "#c084fc",
    chip: "border-accent-violet/30 bg-accent-violet/[0.12] text-accent-violet hover:bg-accent-violet/20",
    active: "border-accent-violet bg-accent-violet/25 text-accent-violet ring-1 ring-accent-violet/60",
  },
  {
    hex: "#34d399",
    chip: "border-accent-emerald/30 bg-accent-emerald/[0.12] text-accent-emerald hover:bg-accent-emerald/20",
    active: "border-accent-emerald bg-accent-emerald/25 text-accent-emerald ring-1 ring-accent-emerald/60",
  },
  {
    hex: "#fbbf24",
    chip: "border-accent-amber/30 bg-accent-amber/[0.12] text-accent-amber hover:bg-accent-amber/20",
    active: "border-accent-amber bg-accent-amber/25 text-accent-amber ring-1 ring-accent-amber/60",
  },
  {
    hex: "#fb7185",
    chip: "border-accent-rose/30 bg-accent-rose/[0.12] text-accent-rose hover:bg-accent-rose/20",
    active: "border-accent-rose bg-accent-rose/25 text-accent-rose ring-1 ring-accent-rose/60",
  },
];

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

export const tagStyle = (tag) => PALETTE[hash(tag) % PALETTE.length];
