import { useEffect, useRef, useState } from "react";

export const REDUCED =
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const drifters = new Set();
let driftFrame = null;

const flushDrift = () => {
  driftFrame = null;
  const vh = window.innerHeight || 1;
  const jobs = [];

  // read — every measurement, before a single style is touched
  for (const el of drifters) {
    const r = el.getBoundingClientRect();
    jobs.push([el, (r.top + r.height / 2 - vh / 2) / vh]);
  }
  // write
  for (const [el, p] of jobs) el.style.setProperty("--p", p.toFixed(4));
};

const scheduleDrift = () => {
  if (driftFrame === null) driftFrame = requestAnimationFrame(flushDrift);
};

const registerDrift = (el) => {
  drifters.add(el);
  if (drifters.size === 1) {
    window.addEventListener("scroll", scheduleDrift, { passive: true });
    window.addEventListener("resize", scheduleDrift);
  }
  scheduleDrift();
  return () => {
    drifters.delete(el);
    if (drifters.size === 0) {
      window.removeEventListener("scroll", scheduleDrift);
      window.removeEventListener("resize", scheduleDrift);
      if (driftFrame !== null) {
        cancelAnimationFrame(driftFrame);
        driftFrame = null;
      }
    }
  };
};

/* One ornament's worth of behaviour: a ref to hang on the element, and
   whether it is currently in view.

   The reveal is reversible on purpose. An ornament that only ever reveals
   leaves the upper half of the page inert once the guest scrolls back
   into it, and a page you can only walk forwards through reads as spent.
   So the observer stays connected and each ornament retires the way it
   arrived, which is what makes scrolling up and down again feel like a
   loop rather than a one-way trip.

   The two thresholds are what stop that from strobing on a trackpad: it
   takes a sixth of the ornament to arrive, and almost nothing to leave,
   so an ornament hovering at the fold cannot flip back and forth. */
export function useFoil(drift) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (REDUCED) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        const r = entry.intersectionRatio;
        setShown((was) => (was ? r > 0.02 : r > 0.16));
      },
      { rootMargin: "0px 0px -8% 0px", threshold: [0, 0.02, 0.16, 0.4] }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || !drift || REDUCED) return;
    el.style.setProperty("--drift", `${drift}px`);
    return registerDrift(el);
  }, [drift]);

  return [ref, shown];
}

/* Every ornament draws its entrance from this list at random, once, when
   it mounts. One reveal applied everywhere stops reading as an event and
   starts reading as a mechanism. Repeats here are deliberate weights, not
   accidents: the draw is the page's signature and stays the likeliest,
   and no ornament takes the same one as the ornament beside it. */
export const REVEALS = [
  "line", "line", "line", "line-r",
  "rise", "rise", "settle", "slide", "slide-r",
  "bloom", "unfurl", "sway",
  "wipe", "wipe-r", "wipe-d", "wipe-u",
];

/* Four easings, so even two ornaments that drew the same reveal do not
   move identically. */
export const EASES = [
  "cubic-bezier(.42,0,.2,1)",
  "cubic-bezier(.22,1,.36,1)",
  "cubic-bezier(.16,1,.3,1)",
  "cubic-bezier(.5,0,.15,1)",
];

export const pickReveal = () => ({
  k: REVEALS[Math.floor(Math.random() * REVEALS.length)],
  dur: (1.15 + Math.random() * 1.05).toFixed(2),
  delay: (Math.random() * 0.3).toFixed(2),
  step: (0.05 + Math.random() * 0.13).toFixed(3),
  ease: EASES[Math.floor(Math.random() * EASES.length)],
});
