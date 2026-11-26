import { Globe, Smartphone, Monitor, FlaskConical } from "lucide-react";

/**
 * Visual identity per category. Every surface that represents a category
 * (sidebar, badge, card left border, report dot, counts) reads from here.
 * Class strings are written out statically so Tailwind can detect them.
 * Signature: accent at ~25% as a fill, full-strength accent as text/border.
 */
export const CATEGORY_META = {
  "Web Application": {
    icon: Globe,
    cat: "cat-indigo",
    text: "text-accent-indigo",
    badge: "bg-accent-indigo/[0.24] text-accent-indigo border-accent-indigo/40",
    tile: "bg-accent-indigo/[0.25] text-accent-indigo",
    dot: "bg-accent-indigo",
    bar: "bg-accent-indigo",
    card: "border-l-[3px] border-l-accent-indigo hover:border-l-accent-indigo",
    hex: "#818cf8",
  },
  Android: {
    icon: Smartphone,
    cat: "cat-emerald",
    text: "text-accent-emerald",
    badge: "bg-accent-emerald/[0.24] text-accent-emerald border-accent-emerald/40",
    tile: "bg-accent-emerald/[0.25] text-accent-emerald",
    dot: "bg-accent-emerald",
    bar: "bg-accent-emerald",
    card: "border-l-[3px] border-l-accent-emerald hover:border-l-accent-emerald",
    hex: "#34d399",
  },
  "Thick Client": {
    icon: Monitor,
    cat: "cat-violet",
    text: "text-accent-violet",
    badge: "bg-accent-violet/[0.24] text-accent-violet border-accent-violet/40",
    tile: "bg-accent-violet/[0.25] text-accent-violet",
    dot: "bg-accent-violet",
    bar: "bg-accent-violet",
    card: "border-l-[3px] border-l-accent-violet hover:border-l-accent-violet",
    hex: "#c084fc",
  },
  Payloads: {
    icon: FlaskConical,
    cat: "cat-rose",
    text: "text-accent-rose",
    badge: "bg-accent-rose/[0.24] text-accent-rose border-accent-rose/40",
    tile: "bg-accent-rose/[0.25] text-accent-rose",
    dot: "bg-accent-rose",
    bar: "bg-accent-rose",
    card: "border-l-[3px] border-l-accent-rose hover:border-l-accent-rose",
    hex: "#fb7185",
  },
};

export const DEFAULT_META = CATEGORY_META["Web Application"];
