import { useEffect, useRef } from "react";

export default function Cursor() {
  const dotRef = useRef(null), ringRef = useRef(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    document.documentElement.classList.add("has-cursor");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dot = dotRef.current, ring = ringRef.current;

    const m = { x: -100, y: -100 };         // real pointer
    const r = { x: -100, y: -100, s: 1 };   // smoothed ring
    let first = true, hovered = null, last = performance.now(), raf = 0;
    const mags = new Map();                 // magnetic buttons: el -> state

    const engage = (el) => {
      const st = mags.get(el) || { ox: 0, oy: 0, cx: 0, cy: 0, active: true };
      const b = el.getBoundingClientRect();
      st.cx = b.left + b.width / 2 - st.ox;  // centre without the current offset
      st.cy = b.top + b.height / 2 - st.oy;
      st.active = true;
      mags.set(el, st);
    };
    const release = (el) => { const st = mags.get(el); if (st) st.active = false; };

    const onMove = (e) => {
      m.x = e.clientX; m.y = e.clientY;
      if (first) { r.x = m.x; r.y = m.y; first = false; }
      const h = e.target.closest?.("[data-hover]") || null;
      if (h !== hovered) {
        if (hovered?.hasAttribute("data-magnetic")) release(hovered);
        hovered = h;
        if (h?.hasAttribute("data-magnetic")) engage(h);
        ring.classList.toggle("hover", !!h);
      }
    };
    const onScroll = () => mags.forEach((st, el) => {
      if (st.active) engage(el);
    });

    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min((now - last) / 16.667, 3); last = now;
      const kr = reduce ? 1 : 1 - Math.pow(1 - 0.2, dt);   // ring follow
      const ks = reduce ? 1 : 1 - Math.pow(1 - 0.18, dt);  // ring size + magnet

      dot.style.transform = `translate3d(${m.x}px,${m.y}px,0) translate(-50%,-50%)`;
      r.x += (m.x - r.x) * kr;
      r.y += (m.y - r.y) * kr;
      r.s += ((hovered ? 1.7 : 1) - r.s) * ks;
      ring.style.transform = `translate3d(${r.x}px,${r.y}px,0) translate(-50%,-50%) scale(${r.s})`;

      mags.forEach((st, el) => {
        const tx = st.active ? (m.x - st.cx) * 0.25 : 0;
        const ty = st.active ? (m.y - st.cy) * 0.3 : 0;
        st.ox += (tx - st.ox) * ks;
        st.oy += (ty - st.oy) * ks;
        if (!st.active && Math.abs(st.ox) < 0.05 && Math.abs(st.oy) < 0.05) {
          el.style.transform = "";
          mags.delete(el);
        } else {
          el.style.transform = `translate3d(${st.ox}px,${st.oy}px,0)`;
        }
      });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("has-cursor");
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
    </>
  );
}