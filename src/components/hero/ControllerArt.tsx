import { useId, type CSSProperties } from "react";

/**
 * Original gamepad illustration, drawn as three depth layers that share one coordinate system
 * so the hero can parallax and "explode" them independently. Colours come from --ctl-* tokens,
 * so each theme is separately lit (obsidian + rim light / pearl ceramic + studio light).
 * It is deliberately not modelled on any specific console maker's hardware.
 */
export const ART_VIEWBOX = "-20 40 840 500";

const BODY =
  "M400 150C330 150 270 160 215 178C150 200 105 250 82 330C62 395 48 450 78 480C108 505 150 495 178 450C205 405 240 372 290 366C330 362 365 372 400 372C435 372 470 362 510 366C560 372 595 405 622 450C650 495 692 505 722 480C752 450 738 395 718 330C695 250 650 200 585 178C530 160 470 150 400 150Z";

const stop = (token: string, opacity?: number): CSSProperties => ({ stopColor: `var(${token})`, ...(opacity === undefined ? {} : { stopOpacity: opacity }) });

function Layer({ children, defs }: { children: React.ReactNode; defs?: React.ReactNode }) {
  return (
    <svg viewBox={ART_VIEWBOX} className="absolute inset-0 size-full overflow-visible" aria-hidden focusable="false">
      {defs && <defs>{defs}</defs>}
      {children}
    </svg>
  );
}

/** Back layer: contact shadow and the two shoulder triggers. */
export function ControllerBack() {
  const id = useId().replace(/:/g, "");
  return (
    <Layer
      defs={
        <linearGradient id={`${id}-trg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={stop("--ctl-trigger-a")} />
          <stop offset="1" style={stop("--ctl-trigger-b")} />
        </linearGradient>
      }
    >
      <ellipse cx="400" cy="512" rx="300" ry="20" style={{ fill: "var(--ctl-shadow)", filter: "blur(16px)" }} />
      <path d="M188 172C205 128 262 110 322 118L326 152C270 150 224 162 206 194Z" fill={`url(#${id}-trg)`} stroke="var(--ctl-rim-a)" strokeOpacity=".45" />
      <path d="M612 172C595 128 538 110 478 118L474 152C530 150 576 162 594 194Z" fill={`url(#${id}-trg)`} stroke="var(--ctl-rim-a)" strokeOpacity=".45" />
    </Layer>
  );
}

/** A brand-neutral premium console silhouette that gives the hero a full gaming-rig composition. */
export function ControllerConsole() {
  const id = useId().replace(/:/g, "");
  return (
    <Layer
      defs={
        <>
          <linearGradient id={`${id}-console-shell`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" style={stop("--ctl-body-a")} />
            <stop offset="1" style={stop("--ctl-trigger-b")} />
          </linearGradient>
          <linearGradient id={`${id}-console-face`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style={stop("--ctl-plate-a")} />
            <stop offset="1" style={stop("--ctl-plate-b")} />
          </linearGradient>
        </>
      }
    >
      <g className="console-float" transform="translate(560 82) rotate(6 84 190)">
        <ellipse cx="84" cy="410" rx="92" ry="14" style={{ fill: "var(--ctl-shadow)", filter: "blur(12px)" }} />
        <path d="M12 24Q12 0 36 0H145Q168 0 168 24V368Q168 392 145 392H36Q12 392 12 368Z" fill={`url(#${id}-console-shell)`} stroke="var(--ctl-rim-a)" strokeOpacity=".55" strokeWidth="2" />
        <path d="M42 17H137Q148 17 148 29V362Q148 374 137 374H42Q31 374 31 362V29Q31 17 42 17Z" fill={`url(#${id}-console-face)`} />
        <path d="M43 52H137" stroke="var(--ctl-rim-a)" strokeOpacity=".36" strokeWidth="2" />
        <path d="M43 76H137" stroke="var(--ctl-rim-a)" strokeOpacity=".18" strokeWidth="2" />
        <rect x="53" y="108" width="74" height="6" rx="3" fill="var(--ctl-lightbar)" opacity=".82" />
        <rect x="53" y="124" width="74" height="2" rx="1" fill="var(--ctl-rim-a)" opacity=".32" />
        <circle cx="126" cy="344" r="5" fill="var(--ctl-lightbar)" />
      </g>
    </Layer>
  );
}

/** Middle layer: shell, face plate, rim light, and the travelling blue sheen. */
export function ControllerBody() {
  const id = useId().replace(/:/g, "");
  return (
    <Layer
      defs={
        <>
          <linearGradient id={`${id}-shell`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style={stop("--ctl-body-a")} />
            <stop offset="1" style={stop("--ctl-body-b")} />
          </linearGradient>
          <radialGradient id={`${id}-plate`} cx=".5" cy=".28" r=".75">
            <stop offset="0" style={stop("--ctl-plate-a")} />
            <stop offset="1" style={stop("--ctl-plate-b")} />
          </radialGradient>
          <linearGradient id={`${id}-rim`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" style={stop("--ctl-rim-a")} />
            <stop offset=".55" style={stop("--ctl-rim-b")} />
            <stop offset="1" style={stop("--ctl-rim-a", 0.35)} />
          </linearGradient>
          <linearGradient id={`${id}-sheen`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" style={stop("--ctl-sheen", 0)} />
            <stop offset=".5" style={{ stopColor: "var(--ctl-sheen)", stopOpacity: "var(--ctl-sheen-o)" }} />
            <stop offset="1" style={stop("--ctl-sheen", 0)} />
          </linearGradient>
          <radialGradient id={`${id}-vig`} cx=".5" cy=".45" r=".6">
            <stop offset=".6" stopColor="#000" stopOpacity="0" />
            <stop offset="1" style={stop("--ctl-vignette", 1)} />
          </radialGradient>
          <clipPath id={`${id}-clip`}>
            <path d={BODY} />
          </clipPath>
        </>
      }
    >
      <path d={BODY} fill={`url(#${id}-shell)`} />
      <g clipPath={`url(#${id}-clip)`}>
        <ellipse cx="400" cy="246" rx="318" ry="152" fill={`url(#${id}-plate)`} />
        <ellipse cx="400" cy="262" rx="360" ry="210" fill={`url(#${id}-vig)`} />
        {/* soft top-edge light */}
        <path d="M215 178C270 160 330 150 400 150C470 150 530 160 585 178" fill="none" stroke="var(--ctl-edge-light)" strokeWidth="5" strokeLinecap="round" opacity=".7" style={{ filter: "blur(2px)" }} />
        <path d={BODY} fill="none" stroke="var(--ctl-edge-light)" strokeWidth="8" opacity=".16" />
        <ellipse cx="128" cy="392" rx="30" ry="78" transform="rotate(14 128 392)" fill="var(--ctl-edge-light)" opacity=".16" style={{ filter: "blur(10px)" }} />
        <ellipse cx="672" cy="392" rx="30" ry="78" transform="rotate(-14 672 392)" fill="var(--ctl-edge-light)" opacity=".16" style={{ filter: "blur(10px)" }} />
        <rect className="ctl-sheen" x="-260" y="90" width="150" height="460" fill={`url(#${id}-sheen)`} />
      </g>
      <path d={BODY} fill="none" stroke={`url(#${id}-rim)`} strokeWidth="2.5" />
    </Layer>
  );
}

const CROSS = "M-14-42H14V-14H42V14H14V42H-14V14H-42V-14H-14Z";

/** Front layer: touch pad, light bar, d-pad, face buttons, sticks. */
export function ControllerControls() {
  const id = useId().replace(/:/g, "");
  return (
    <Layer
      defs={
        <>
          <radialGradient id={`${id}-cap`} cx=".35" cy=".3" r=".85">
            <stop offset="0" style={stop("--ctl-cap-a")} />
            <stop offset="1" style={stop("--ctl-cap-b")} />
          </radialGradient>
          <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" style={stop("--ctl-glass-a")} />
            <stop offset="1" style={stop("--ctl-glass-b")} />
          </linearGradient>
        </>
      }
    >
      {/* touch pad + light bar */}
      <rect x="336" y="188" width="128" height="68" rx="18" fill={`url(#${id}-glass)`} stroke="var(--ctl-rim-a)" strokeOpacity=".5" />
      <path d="M352 200L392 244" stroke="var(--ctl-glint)" strokeWidth="1.5" strokeLinecap="round" opacity=".5" />
      <path className="ctl-bar" d="M348 176H452" stroke="var(--ctl-lightbar)" strokeWidth="4" strokeLinecap="round" />

      {/* d-pad */}
      <g transform="translate(228 250)">
        <circle r="56" fill="var(--ctl-recess)" opacity=".55" />
        <path d={CROSS} fill={`url(#${id}-cap)`} stroke="var(--ctl-rim-a)" strokeOpacity=".45" strokeLinejoin="round" />
        <path d="M0-30L6-22H-6ZM0 30L6 22H-6ZM-30 0L-22 6V-6ZM30 0L22 6V-6Z" fill="var(--ctl-glyph-dim)" />
      </g>

      {/* face buttons */}
      <g transform="translate(572 250)">
        <circle r="64" fill="var(--ctl-recess)" opacity=".55" />
        {[
          { x: 0, y: -39, g: "tri", c: "--ctl-sym-tri", d: "0s" },
          { x: 39, y: 0, g: "o", c: "--ctl-sym-o", d: "1.5s" },
          { x: 0, y: 39, g: "x", c: "--ctl-sym-x", d: "3s" },
          { x: -39, y: 0, g: "sq", c: "--ctl-sym-sq", d: "4.5s" },
        ].map((b) => (
          <g key={b.g} transform={`translate(${b.x} ${b.y})`}>
            <circle r="20" fill={`url(#${id}-cap)`} stroke="var(--ctl-rim-a)" strokeOpacity=".5" />
            <g className="ctl-sym" style={{ animationDelay: b.d, color: `var(${b.c})` }} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              {b.g === "tri" && <path d="M0-8L8 6H-8Z" />}
              {b.g === "o" && <circle r="8" />}
              {b.g === "x" && <path d="M-7-7L7 7M7-7L-7 7" />}
              {b.g === "sq" && <rect x="-7" y="-7" width="14" height="14" rx="1.5" />}
            </g>
          </g>
        ))}
      </g>

      {/* analogue sticks */}
      {[318, 482].map((cx) => (
        <g key={cx} transform={`translate(${cx} 338)`}>
          <circle r="47" fill="var(--ctl-recess)" opacity=".7" />
          <circle r="41" fill="none" stroke="var(--ctl-rim-a)" strokeOpacity=".3" />
          <circle r="31" fill={`url(#${id}-cap)`} stroke="var(--ctl-rim-a)" strokeOpacity=".5" />
          <circle r="21" fill="none" stroke="var(--ctl-glyph-dim)" strokeOpacity=".55" />
          <circle r="11" fill="none" stroke="var(--ctl-glyph-dim)" strokeOpacity=".35" />
          <path d="M-22-14A26 26 0 0 1 4-24" fill="none" stroke="var(--ctl-glint)" strokeWidth="2" strokeLinecap="round" opacity=".6" />
        </g>
      ))}

      {/* centre mark */}
      <rect x="388" y="298" width="24" height="24" rx="6" fill="var(--ctl-mark-bg)" stroke="var(--ctl-rim-a)" strokeOpacity=".5" />
      <path d="M395 305L405 315M405 305L395 315" stroke="var(--ctl-mark)" strokeWidth="2.6" strokeLinecap="round" />
    </Layer>
  );
}

/** Callouts that tie each controller zone to a real GamexChange service. Decorative: the same words are in the page copy. */
export function ControllerCallouts() {
  const labels = [
    { text: "SELL", anchor: "end", lx: 108, ly: 100, path: "M338 204L268 118H118", dot: [338, 204] },
    { text: "PLAY", anchor: "middle", lx: 400, ly: 70, path: "M400 174V82", dot: [400, 174] },
    { text: "BUY", anchor: "start", lx: 696, ly: 100, path: "M606 218L664 118H686", dot: [606, 218] },
    { text: "EXCHANGE", anchor: "end", lx: 70, ly: 236, path: "M184 276L142 236H78", dot: [184, 276] },
    { text: "REPAIR", anchor: "start", lx: 758, ly: 448, path: "M505 365L594 442H748", dot: [505, 365] },
  ] as const;

  return (
    <svg viewBox={ART_VIEWBOX} className="ctl-callouts pointer-events-none absolute inset-0 hidden size-full overflow-visible lg:block" aria-hidden focusable="false">
      {labels.map((l, i) => (
        <g key={l.text} className="ctl-callout" style={{ animationDelay: `${2 + i * 0.12}s` }}>
          <path d={l.path} fill="none" stroke="var(--accent)" strokeOpacity=".7" strokeWidth="1.2" />
          <circle cx={l.dot[0]} cy={l.dot[1]} r="4" fill="var(--accent)" />
          <circle cx={l.dot[0]} cy={l.dot[1]} r="9" fill="none" stroke="var(--accent)" strokeOpacity=".4" />
          <text x={l.lx} y={l.ly} textAnchor={l.anchor} fill="var(--ink)" fontSize="15" fontWeight="600" letterSpacing="4" style={{ fontFamily: "var(--font-display)" }}>
            {l.text}
          </text>
        </g>
      ))}
    </svg>
  );
}
