import { useEffect, useRef, useState } from "react";
import { BG, FRAME_COUNT, FRAME_W, FRAME_H, FACE, SMOOTHING, DEADZONE_IN, DEADZONE_OUT } from "./config.js";

const BASE = import.meta.env.BASE_URL;
const TAU = Math.PI * 2;

// shortest-path circular lerp
const lerpAngle = (a, b, t) => {
  let d = (b - a) % TAU;
  if (d > Math.PI) d -= TAU;
  if (d < -Math.PI) d += TAU;
  return a + d * t;
};

// decode once and keep the pixels in memory, so drawing never re-decodes
const load = async (src) => {
  try {
    const blob = await (await fetch(src)).blob();
    return await createImageBitmap(blob);
  } catch {
    return new Promise((res) => {
      const img = new Image();
      img.onload = () => res(img);
      img.src = src;
    });
  }
};

export default function CharacterCanvas() {
  const ref = useRef(null);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true, raf = 0, visible = true;
    const canvas = ref.current;
    const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
    const frames = new Array(FRAME_COUNT);
    let center = null;
    const isReady = { current: false };

    let angle = 0, lastKey = -2, inDead = true, last = performance.now();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const L = { vw: 0, vh: 0, dpr: 1, scale: 1, ox: 0, oy: 0, fx: 0, fy: 0, covers: false };
    const layout = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5); // frames are 1280px wide, more adds no detail
      const vw = window.innerWidth, vh = window.innerHeight;
      canvas.width = Math.round(vw * dpr);
      canvas.height = Math.round(vh * dpr);
      const scale = Math.max(vw / FRAME_W, vh / FRAME_H); // cover
      const wide = vw / vh > 1.1;
      const tx = wide ? vw * 0.64 : vw * 0.5;
      const ty = wide ? vh * 0.4 : vh * 0.36;
      let ox = tx - FACE.x * FRAME_W * scale;
      let oy = ty - FACE.y * FRAME_H * scale;
      if (!wide) ox = Math.min(0, Math.max(vw - FRAME_W * scale, ox));
      oy = Math.min(0, Math.max(vh - FRAME_H * scale, oy));
      const covers = ox <= 0 && oy <= 0 && ox + FRAME_W * scale >= vw && oy + FRAME_H * scale >= vh;
      Object.assign(L, { vw, vh, dpr, scale, ox, oy, covers,
        fx: ox + FACE.x * FRAME_W * scale, fy: oy + FACE.y * FRAME_H * scale });
      lastKey = -2; // force a redraw
    };

    const mouse = { x: 0, y: 0, moved: false };
    const onMove = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.moved = true; };

    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min((now - last) / 16.667, 3); last = now;
      if (!isReady.current || !visible) return;
      const k = reduce ? 1 : 1 - Math.pow(1 - SMOOTHING, dt); // frame-rate independent

      const dx = mouse.x - L.fx;
      const dy = mouse.y - (L.fy - window.scrollY); // face moves up when the page scrolls
      const dist = Math.hypot(dx, dy);
      if (!mouse.moved) inDead = true;
      else inDead = dist < L.vw * (inDead ? DEADZONE_OUT : DEADZONE_IN);

      if (dist > 1) angle = lerpAngle(angle, Math.atan2(dx, -dy), k); // 0 = up, clockwise
      const idx = Math.round((((angle % TAU) + TAU) % TAU) / TAU * FRAME_COUNT) % FRAME_COUNT;
      const key = inDead ? -1 : idx;
      if (key === lastKey) return; // same frame: draw nothing
      lastKey = key;

      ctx.setTransform(L.dpr, 0, 0, L.dpr, 0, 0);
      ctx.globalAlpha = 1; // exactly one opaque frame, never blended
      if (!L.covers) { ctx.fillStyle = BG; ctx.fillRect(0, 0, L.vw, L.vh); }
      ctx.drawImage(inDead ? center : frames[idx], L.ox, L.oy, FRAME_W * L.scale, FRAME_H * L.scale);
    };

    layout();
    ctx.fillStyle = BG; ctx.fillRect(0, 0, canvas.width, canvas.height);
    window.addEventListener("resize", layout);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onMove, { passive: true });
    const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) lastKey = -2; });
    io.observe(canvas);

    (async () => {
      let done = 0;
      const bump = () => alive && setProgress(Math.round((++done / (FRAME_COUNT + 1)) * 100));
      center = await load(`${BASE}frames/center.webp`); bump();
      await Promise.all(
        Array.from({ length: FRAME_COUNT }, async (_, i) => {
          frames[i] = await load(`${BASE}frames/${String(i).padStart(2, "0")}.webp`);
          bump();
        })
      );
      if (!alive) return;
      isReady.current = true;
      setReady(true);
    })();

    raf = requestAnimationFrame(tick);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", layout);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onMove);
    };
  }, []);

  return (
    <>
      <canvas ref={ref} className="stage" role="img" aria-label="Portrait of the developer whose head follows your cursor" />
      <div className={"loader" + (ready ? " done" : "")} aria-hidden={ready}>
        <span>{progress}%</span>
      </div>
    </>
  );
}