import { useId, type CSSProperties } from "react";

export const ART_VIEWBOX = "-20 40 840 500";

const body = "M400 150C330 150 270 160 215 178C150 200 105 250 82 330C62 395 48 450 78 480C108 505 150 495 178 450C205 405 240 372 290 366C330 362 365 372 400 372C435 372 470 362 510 366C560 372 595 405 622 450C650 495 692 505 722 480C752 450 738 395 718 330C695 250 650 200 585 178C530 160 470 150 400 150Z";
const stop = (token: string, opacity?: number): CSSProperties => ({ stopColor: `var(${token})`, ...(opacity === undefined ? {} : { stopOpacity: opacity }) });

function Layer({ children, defs }: { children: React.ReactNode; defs?: React.ReactNode }) {
  return <svg viewBox={ART_VIEWBOX} className="absolute inset-0 size-full overflow-visible" aria-hidden focusable="false">{defs && <defs>{defs}</defs>}{children}</svg>;
}

export function ControllerBack() {
  return <Layer>
    <ellipse cx="400" cy="512" rx="300" ry="20" style={{ fill: "var(--ctl-shadow)", filter: "blur(16px)" }} />
    <path className="ctl-depth-edge" d="M82 330C62 395 48 450 78 480C108 505 150 495 178 450L178 463C150 508 108 518 78 493C48 463 62 408 82 344Z" />
    <path className="ctl-depth-edge" d="M718 330C738 395 752 450 722 480C692 505 650 495 622 450L622 463C650 508 692 518 722 493C752 463 738 408 718 344Z" />
    <path className="ctl-depth-edge" d="M178 450C205 405 240 372 290 366C330 362 365 372 400 372C435 372 470 362 510 366C560 372 595 405 622 450L622 463C594 420 558 387 509 381C469 377 435 387 400 387C365 387 331 377 291 381C242 387 206 420 178 463Z" />
    <path d="M188 172C205 128 262 110 322 118L326 152C270 150 224 162 206 194Z" fill="var(--ctl-trigger-a)" stroke="var(--ctl-rim-a)" strokeOpacity=".45" />
    <path d="M612 172C595 128 538 110 478 118L474 152C530 150 576 162 594 194Z" fill="var(--ctl-trigger-a)" stroke="var(--ctl-rim-a)" strokeOpacity=".45" />
  </Layer>;
}

/** Brand-neutral console silhouette that supports the hero without competing with the controller. */
export function ControllerConsole() {
  const id = useId().replace(/:/g, "");
  return (
    <Layer defs={<><linearGradient id={`${id}-shell`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" style={stop("--ctl-body-a")} /><stop offset="1" style={stop("--ctl-trigger-b")} /></linearGradient><linearGradient id={`${id}-face`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" style={stop("--ctl-plate-a")} /><stop offset="1" style={stop("--ctl-plate-b")} /></linearGradient></>}>
      <g className="console-float" transform="translate(560 82) rotate(6 84 190)">
        <ellipse cx="84" cy="410" rx="92" ry="14" style={{ fill: "var(--ctl-shadow)", filter: "blur(12px)" }} />
        <path d="M12 24Q12 0 36 0H145Q168 0 168 24V368Q168 392 145 392H36Q12 392 12 368Z" fill={`url(#${id}-shell)`} stroke="var(--ctl-rim-a)" strokeOpacity=".55" strokeWidth="2" />
        <path d="M42 17H137Q148 17 148 29V362Q148 374 137 374H42Q31 374 31 362V29Q31 17 42 17Z" fill={`url(#${id}-face)`} />
        <path d="M43 52H137M43 76H137" stroke="var(--ctl-rim-a)" strokeOpacity=".32" strokeWidth="2" />
        <rect x="53" y="108" width="74" height="6" rx="3" fill="var(--ctl-lightbar)" opacity=".82" />
        <circle cx="126" cy="344" r="5" fill="var(--ctl-lightbar)" />
      </g>
    </Layer>
  );
}

export function ControllerBody() {
  const id = useId().replace(/:/g, "");
  return <Layer defs={<><linearGradient id={`${id}-shell`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" style={stop("--ctl-body-a")} /><stop offset="1" style={stop("--ctl-body-b")} /></linearGradient><linearGradient id={`${id}-rim`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" style={stop("--ctl-rim-a")} /><stop offset=".55" style={stop("--ctl-rim-b")} /><stop offset="1" style={stop("--ctl-rim-a", .35)} /></linearGradient><clipPath id={`${id}-clip`}><path d={body} /></clipPath></>}>
    <path d={body} fill={`url(#${id}-shell)`} />
    <g clipPath={`url(#${id}-clip)`}><ellipse cx="400" cy="246" rx="318" ry="152" fill="var(--ctl-plate-a)" opacity=".46" /><path d="M215 178C270 160 330 150 400 150C470 150 530 160 585 178" fill="none" stroke="var(--ctl-edge-light)" strokeWidth="5" strokeLinecap="round" opacity=".7" /><rect className="ctl-sheen" x="-260" y="90" width="150" height="460" fill="var(--ctl-sheen)" opacity=".35" /></g>
    <path d={body} fill="none" stroke={`url(#${id}-rim)`} strokeWidth="2.5" />
  </Layer>;
}

export function ControllerControls() {
  const id = useId().replace(/:/g, "");
  return <Layer defs={<radialGradient id={`${id}-cap`} cx=".35" cy=".3" r=".85"><stop offset="0" style={stop("--ctl-cap-a")} /><stop offset="1" style={stop("--ctl-cap-b")} /></radialGradient>}>
    <rect x="336" y="188" width="128" height="68" rx="18" fill="var(--ctl-glass-a)" stroke="var(--ctl-rim-a)" strokeOpacity=".5" />
    <circle className="ctl-brand-halo" cx="400" cy="222" r="26" fill="var(--ctl-mark-bg)" opacity=".58" />
    <image className="ctl-brand-mark" href="/brand/gamexchange-mark.png" x="378" y="200" width="44" height="44" preserveAspectRatio="xMidYMid meet" />
    <path className="ctl-bar" d="M348 176H452" stroke="var(--ctl-lightbar)" strokeWidth="4" strokeLinecap="round" />
    <g transform="translate(228 250)"><circle r="56" fill="var(--ctl-recess)" opacity=".55" /><path d="M-14-42H14V-14H42V14H14V42H-14V14H-42V-14H-14Z" fill={`url(#${id}-cap)`} stroke="var(--ctl-rim-a)" /></g>
    <g transform="translate(572 250)"><circle r="64" fill="var(--ctl-recess)" opacity=".55" />{[[-39, 0], [39, 0], [0, -39], [0, 39]].map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="20" fill={`url(#${id}-cap)`} stroke="var(--ctl-rim-a)" />)}</g>
    {[318, 482].map((cx) => <g key={cx} transform={`translate(${cx} 338)`}><circle r="47" fill="var(--ctl-recess)" opacity=".7" /><circle r="31" fill={`url(#${id}-cap)`} stroke="var(--ctl-rim-a)" /></g>)}
  </Layer>;
}

export function ControllerCallouts() {
  const labels = [{ text: "SELL", x: 108, y: 100 }, { text: "PLAY", x: 400, y: 70 }, { text: "BUY", x: 696, y: 100 }, { text: "EXCHANGE", x: 70, y: 236 }, { text: "TRADE", x: 68, y: 448 }, { text: "REPAIR", x: 758, y: 448 }] as const;
  return <svg viewBox={ART_VIEWBOX} className="ctl-callouts pointer-events-none absolute inset-0 hidden size-full overflow-visible lg:block" aria-hidden focusable="false">{labels.map((label) => <text key={label.text} x={label.x} y={label.y} textAnchor="middle" fill="var(--ink)" fontSize="15" fontWeight="600" letterSpacing="4" style={{ fontFamily: "var(--font-display)" }}>{label.text}</text>)}</svg>;
}
