import { useEffect, useRef, useState } from "react";

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * Animates a number from its previous displayed value to `target` (ease-out, ~500ms).
 * Runs on mount and whenever `target` changes. With prefers-reduced-motion it shows the final value at once.
 */
export default function useCountUp(target, duration = 500) {
  const reduce = prefersReducedMotion();
  const [value, setValue] = useState(reduce ? target : 0);
  const fromRef = useRef(reduce ? target : 0);

  useEffect(() => {
    if (reduce) {
      fromRef.current = target;
      setValue(target);
      return;
    }
    const from = fromRef.current;
    const t0 = performance.now();
    let raf;
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = Math.round(from + (target - from) * eased);
      fromRef.current = v;
      setValue(v);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, reduce]);

  return value;
}
