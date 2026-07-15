import { useEffect, useRef } from "react";

/* ── Keyframes ──────────────────────────────────────────────────────── */
const WING_CSS = `
/* ── Split-wing 3D flap: left wing folds back around the body spine ── */
@keyframes wot-lw {
  0%   { transform: rotateY(0deg) scaleY(1); }
  14%  { transform: rotateY(-44deg) scaleY(0.95); }
  28%  { transform: rotateY(-72deg) scaleY(0.82); }
  42%  { transform: rotateY(-10deg) scaleY(0.97); }
  52%  { transform: rotateY(0deg)   scaleY(1); }
  /* glide hold — wings breathe gently */
  66%  { transform: rotateY(-7deg)  scaleY(0.985); }
  82%  { transform: rotateY(-3deg)  scaleY(0.995); }
  100% { transform: rotateY(0deg)   scaleY(1); }
}
@keyframes wot-rw {
  0%   { transform: rotateY(0deg)  scaleY(1); }
  14%  { transform: rotateY(44deg) scaleY(0.95); }
  28%  { transform: rotateY(72deg) scaleY(0.82); }
  42%  { transform: rotateY(10deg) scaleY(0.97); }
  52%  { transform: rotateY(0deg)  scaleY(1); }
  66%  { transform: rotateY(7deg)  scaleY(0.985); }
  82%  { transform: rotateY(3deg)  scaleY(0.995); }
  100% { transform: rotateY(0deg)  scaleY(1); }
}
/* Settling — slow, graceful after landing */
@keyframes wot-lw-settle {
  0%   { transform: rotateY(0deg)   scaleY(1); }
  30%  { transform: rotateY(-28deg) scaleY(0.94); }
  55%  { transform: rotateY(-4deg)  scaleY(0.99); }
  78%  { transform: rotateY(-14deg) scaleY(0.96); }
  100% { transform: rotateY(0deg)   scaleY(1); }
}
@keyframes wot-rw-settle {
  0%   { transform: rotateY(0deg)   scaleY(1); }
  30%  { transform: rotateY(28deg)  scaleY(0.94); }
  55%  { transform: rotateY(4deg)   scaleY(0.99); }
  78%  { transform: rotateY(14deg)  scaleY(0.96); }
  100% { transform: rotateY(0deg)   scaleY(1); }
}
/* Active butterfly: gold glow pulse while perched */
@keyframes wot-bf-glow {
  0%,100% { filter: drop-shadow(0 2px 8px rgba(30,45,92,0.18)) drop-shadow(0 0 10px rgba(197,163,71,0.4)); }
  50%      { filter: drop-shadow(0 4px 18px rgba(30,45,92,0.26)) drop-shadow(0 0 24px rgba(197,163,71,0.8)); }
}
/* Gentle vertical bob while flying */
@keyframes wot-bob {
  0%,100% { margin-top: 0px; }
  50%      { margin-top: -4px; }
}
`;

type BfMode = "wander" | "approach" | "perch";

interface Bf {
  x: number; y: number;
  vx: number; vy: number;
  wanderAngle: number; wanderTimer: number;
  size: number; opacity: number;
  flapPeriod: number;
  mode: BfMode; modeTimer: number;
  perchX: number; perchY: number;
  isActive: boolean;
  wrapEl: HTMLDivElement | null;
  innerEl: HTMLDivElement | null;
  leftEl:  HTMLDivElement | null;
  rightEl: HTMLDivElement | null;
}

/* Landing spots chosen to highlight key page elements:
   headline, CTA area, journal section, plate/logo image */
const PERCH_SPOTS = [
  { x: 9,  y: 20 },   // top-left — hero heading
  { x: 28, y: 35 },   // mid-left  — subheadline
  { x: 14, y: 55 },   // near CTA
  { x: 38, y: 72 },   // CTA buttons
  { x: 70, y: 16 },   // top-right — plate area
  { x: 80, y: 42 },   // plate center
  { x: 90, y: 25 },   // upper-right corner
  { x: 52, y: 12 },   // top-center
  { x: 44, y: 58 },   // center
];

const INIT_POS = [
  { x: 8,  y: 16 }, { x: 76, y: 11 }, { x: 50, y: 22 },
  { x: 22, y: 68 }, { x: 87, y: 50 }, { x: 38, y: 84 },
  { x: 64, y: 74 }, { x: 15, y: 44 }, { x: 58, y: 44 },
];

const FLEE_R  = 140;
const DAMP    = 0.905;
const WDR_F   = 0.007;

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

function makeBf(idx: number): Bf {
  const pos   = INIT_POS[idx % INIT_POS.length];
  const perch = PERCH_SPOTS[idx % PERCH_SPOTS.length];
  return {
    x: pos.x, y: pos.y,
    vx: (Math.random() - 0.5) * 0.13,
    vy: (Math.random() - 0.5) * 0.13,
    wanderAngle: Math.random() * Math.PI * 2,
    wanderTimer: Math.random() * 3000,
    size: 50 + Math.floor(Math.random() * 28),
    opacity: 0.10 + Math.random() * 0.10,
    flapPeriod: 660 + Math.floor(Math.random() * 340),
    mode: "wander",
    modeTimer: 2800 + Math.random() * 5000,
    perchX: perch.x, perchY: perch.y,
    isActive: idx === 0,
    wrapEl: null, innerEl: null, leftEl: null, rightEl: null,
  };
}

export default function FloatingButterflies({ count = 7 }: { count?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef     = useRef<{ x: number; y: number } | null>(null);
  const bfsRef       = useRef<Bf[]>(
    Array.from({ length: Math.min(count, INIT_POS.length) }, (_, i) => makeBf(i))
  );
  const rafRef      = useRef<number | null>(null);
  const prevTimeRef = useRef<number>(0);
  const activeRef   = useRef<number>(0);

  useEffect(() => {
    const onMove  = (e: MouseEvent) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    const onLeave = () => { mouseRef.current = null; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);

    /* Spotlight: cycle which butterfly is "active" every 7 s */
    const spotlight = setInterval(() => {
      const bfs  = bfsRef.current;
      const next = (activeRef.current + 1) % bfs.length;
      activeRef.current = next;
      bfs.forEach((bf, i) => {
        bf.isActive = i === next;
        if (bf.isActive) {
          /* Direct the active butterfly toward a fresh focal spot */
          const pick = PERCH_SPOTS[
            (next * 2 + Math.floor(Date.now() / 8000)) % PERCH_SPOTS.length
          ];
          bf.perchX   = pick.x;
          bf.perchY   = pick.y;
          bf.mode     = "approach";
          bf.modeTimer = 6000;
        }
      });
    }, 7000);

    const tick = (time: number) => {
      const dt = prevTimeRef.current ? Math.min(time - prevTimeRef.current, 50) : 16;
      prevTimeRef.current = time;

      const container = containerRef.current;
      if (!container) { rafRef.current = requestAnimationFrame(tick); return; }

      const rect  = container.getBoundingClientRect();
      const mouse = mouseRef.current;

      for (const bf of bfsRef.current) {
        /* ── Mode state machine ── */
        bf.modeTimer -= dt;
        if (bf.modeTimer <= 0) {
          if (bf.mode === "wander") {
            bf.mode = "approach";
            bf.modeTimer = 4500 + Math.random() * 5000;
          } else if (bf.mode === "approach") {
            const near = Math.abs(bf.x - bf.perchX) < 5 && Math.abs(bf.y - bf.perchY) < 5;
            if (near) { bf.mode = "perch"; bf.modeTimer = 3500 + Math.random() * 8000; }
            else        { bf.modeTimer = 1600; }
          } else {
            bf.mode      = "wander";
            bf.modeTimer = 4000 + Math.random() * 7000;
            bf.wanderAngle = Math.random() * Math.PI * 2;
            if (!bf.isActive) {
              const np = PERCH_SPOTS[Math.floor(Math.random() * PERCH_SPOTS.length)];
              bf.perchX = np.x; bf.perchY = np.y;
            }
          }
        }

        /* ── Forces ── */
        let isFleeing = false;
        let fx = 0, fy = 0;

        /* Mouse flee */
        if (mouse) {
          const mx = ((mouse.x - rect.left) / rect.width)  * 100;
          const my = ((mouse.y - rect.top)  / rect.height) * 100;
          const dx = (bf.x - mx) * (rect.width  / 100);
          const dy = (bf.y - my) * (rect.height / 100);
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < FLEE_R && dist > 0.1) {
            isFleeing = true;
            const strength = (1 - dist / FLEE_R) * (bf.isActive ? 0.30 : 0.48);
            fx += (dx / dist) * strength * (100 / rect.width);
            fy += (dy / dist) * strength * (100 / rect.height);
            if (bf.mode === "perch") {
              bf.mode = "wander";
              bf.modeTimer = 2000 + Math.random() * 3000;
            }
          }
        }

        if (!isFleeing) {
          if (bf.mode === "wander") {
            bf.wanderTimer -= dt;
            if (bf.wanderTimer <= 0) {
              bf.wanderAngle += (Math.random() - 0.5) * Math.PI * 1.2;
              bf.wanderTimer = 1000 + Math.random() * 3000;
            }
            fx += Math.cos(bf.wanderAngle) * WDR_F;
            fy += Math.sin(bf.wanderAngle) * WDR_F;
          } else if (bf.mode === "approach") {
            const spd = bf.isActive ? 0.016 : 0.009;
            fx += (bf.perchX - bf.x) * spd;
            fy += (bf.perchY - bf.y) * spd;
          } else {
            /* perched */
            bf.vx += (bf.perchX - bf.x) * 0.022;
            bf.vy += (bf.perchY - bf.y) * 0.022;
            bf.vx += (Math.random() - 0.5) * 0.003;
            bf.vy += (Math.random() - 0.5) * 0.003;
          }
        }

        bf.vx = (bf.vx + fx) * DAMP;
        bf.vy = (bf.vy + fy) * DAMP;

        const maxSpd = isFleeing ? 0.28
          : bf.mode === "approach" ? (bf.isActive ? 0.10 : 0.06)
          : bf.mode === "perch"    ? 0.020
          : 0.12;

        const spd = Math.sqrt(bf.vx * bf.vx + bf.vy * bf.vy);
        if (spd > maxSpd) { bf.vx = (bf.vx / spd) * maxSpd; bf.vy = (bf.vy / spd) * maxSpd; }

        const sc = dt / 16;
        bf.x = Math.max(2, Math.min(97, bf.x + bf.vx * sc));
        bf.y = Math.max(2, Math.min(97, bf.y + bf.vy * sc));

        /* Boundary bounce */
        if (bf.x <= 2 || bf.x >= 97) bf.wanderAngle = Math.PI - bf.wanderAngle;
        if (bf.y <= 2 || bf.y >= 97) bf.wanderAngle = -bf.wanderAngle;

        /* ── DOM updates ── */
        if (!bf.wrapEl) continue;

        bf.wrapEl.style.left = `${bf.x}%`;
        bf.wrapEl.style.top  = `${bf.y}%`;

        /* Tilt toward velocity when flying */
        const tilt = bf.mode === "perch" ? 0 : Math.max(-20, Math.min(20, bf.vx * 75));
        bf.wrapEl.style.transform = `translate(-50%,-50%) rotate(${tilt.toFixed(1)}deg)`;

        /* Opacity: active=bright, others=dim */
        const targetOp = bf.isActive ? 0.88 : 0.13;
        const curOp    = parseFloat(bf.wrapEl.style.opacity) || bf.opacity;
        bf.wrapEl.style.opacity = String(lerp(curOp, targetOp, 0.022).toFixed(3));

        /* Scale: active butterfly slightly larger when approaching/perched */
        if (bf.innerEl) {
          const targetScale = (bf.isActive && bf.mode !== "wander") ? 1.22 : 1.0;
          const curScale    = parseFloat(bf.innerEl.dataset.scale ?? "1");
          const ns          = lerp(curScale, targetScale, 0.04);
          bf.innerEl.dataset.scale   = String(ns);
          bf.innerEl.style.transform = `scale(${ns.toFixed(3)})`;
        }

        /* Wing animation: settle when active+perched, else normal */
        const settling   = bf.isActive && bf.mode === "perch";
        const fleeFlap   = isFleeing;
        const lwDur = fleeFlap ? bf.flapPeriod * 0.38
                    : settling ? bf.flapPeriod * 1.9
                    :             bf.flapPeriod;
        const rwDur = lwDur;

        if (bf.leftEl) {
          const animName = settling ? "wot-lw-settle" : "wot-lw";
          bf.leftEl.style.animationName     = animName;
          bf.leftEl.style.animationDuration = `${lwDur}ms`;
        }
        if (bf.rightEl) {
          const animName = settling ? "wot-rw-settle" : "wot-rw";
          bf.rightEl.style.animationName     = animName;
          bf.rightEl.style.animationDuration = `${rwDur}ms`;
        }

        /* Filter / glow */
        if (bf.innerEl) {
          if (bf.isActive && bf.mode === "perch") {
            bf.innerEl.style.animation = `wot-bf-glow 2.2s ease-in-out infinite`;
          } else if (bf.isActive) {
            bf.innerEl.style.animation = "none";
            bf.innerEl.style.filter    = "drop-shadow(0 2px 12px rgba(197,163,71,0.6))";
          } else {
            bf.innerEl.style.animation = "none";
            bf.innerEl.style.filter    = "drop-shadow(0 2px 6px rgba(30,45,92,0.14))";
          }
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      clearInterval(spotlight);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      <style>{WING_CSS}</style>
      <div
        ref={containerRef}
        style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}
        aria-hidden="true"
      >
        {bfsRef.current.map((bf, i) => {
          const delay = `-${(i * 0.38).toFixed(2)}s`;
          return (
            <div
              key={i}
              ref={el => { if (el) bf.wrapEl = el; }}
              style={{
                position: "absolute",
                left: `${bf.x}%`,
                top: `${bf.y}%`,
                transform: "translate(-50%,-50%)",
                opacity: bf.opacity,
                willChange: "left, top, opacity, transform",
                zIndex: bf.isActive ? 5 : 2,
              }}
            >
              {/* Inner — handles scale & filter/glow */}
              <div
                ref={el => { if (el) bf.innerEl = el; }}
                data-scale="1"
                style={{
                  width: bf.size,
                  height: bf.size,
                  position: "relative",
                  /* perspective on this container drives the 3D wing rotation */
                  perspective: `${bf.size * 2.4}px`,
                  filter: "drop-shadow(0 2px 6px rgba(30,45,92,0.14))",
                  transformOrigin: "center center",
                }}
              >
                {/* LEFT wing — shows left half of image, rotates around spine (right edge = center) */}
                <div
                  ref={el => { if (el) bf.leftEl = el; }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    transformOrigin: "50% 50%",   /* spine = center of element */
                    animationName: "wot-lw",
                    animationDuration: `${bf.flapPeriod}ms`,
                    animationTimingFunction: "ease-in-out",
                    animationIterationCount: "infinite",
                    animationDelay: delay,
                    animationFillMode: "none",
                  }}
                >
                  <img
                    src="/butterfly-art.png"
                    alt=""
                    style={{
                      width: "100%", height: "100%",
                      objectFit: "contain",
                      clipPath: "inset(0 50% 0 0)",   /* left wing only */
                      display: "block",
                      userSelect: "none",
                    }}
                  />
                </div>

                {/* RIGHT wing — shows right half, rotates mirror of left */}
                <div
                  ref={el => { if (el) bf.rightEl = el; }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    transformOrigin: "50% 50%",
                    animationName: "wot-rw",
                    animationDuration: `${bf.flapPeriod}ms`,
                    animationTimingFunction: "ease-in-out",
                    animationIterationCount: "infinite",
                    animationDelay: delay,
                    animationFillMode: "none",
                  }}
                >
                  <img
                    src="/butterfly-art.png"
                    alt=""
                    style={{
                      width: "100%", height: "100%",
                      objectFit: "contain",
                      clipPath: "inset(0 0 0 50%)",   /* right wing only */
                      display: "block",
                      userSelect: "none",
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
