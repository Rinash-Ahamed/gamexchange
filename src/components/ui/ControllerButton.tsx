"use client";

import Link from "next/link";
import { m, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import type { ReactNode, PointerEvent } from "react";
import { Glyph, glyphTint, type GlyphName } from "./Glyph";
import { useFinePointer } from "@/lib/use-media";

const MotionLink = m.create(Link);

type Common = {
  glyph: GlyphName;
  children: ReactNode;
  variant?: "primary" | "ghost";
  size?: "sm" | "md" | "lg";
  /** Desktop-only magnetic pull toward the pointer. */
  magnetic?: boolean;
  className?: string;
};
type AsLink = Common & { href: string; external?: boolean; onClick?: never; type?: never; disabled?: never };
type AsButton = Common & { href?: never; external?: never; onClick?: () => void; type?: "button" | "submit"; disabled?: boolean };

const sizes = {
  sm: "min-h-11 gap-2 pl-1.5 pr-4 text-xs",
  md: "min-h-12 gap-3 pl-2 pr-5 text-sm",
  lg: "min-h-14 gap-3 pl-2.5 pr-6 text-sm sm:text-base",
};
const keySizes = { sm: "size-8", md: "size-9", lg: "size-10" };

export function ControllerButton(props: AsLink | AsButton) {
  const { glyph, children, variant = "primary", size = "md", magnetic = false, className = "" } = props;
  const reduce = useReducedMotion();
  const fine = useFinePointer();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 300, damping: 18, mass: 0.4 });
  const y = useSpring(my, { stiffness: 300, damping: 18, mass: 0.4 });
  const canMagnet = magnetic && fine && !reduce;

  const onMove = (e: PointerEvent<HTMLElement>) => {
    if (!canMagnet) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - (r.left + r.width / 2)) * 0.22);
    my.set((e.clientY - (r.top + r.height / 2)) * 0.3);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };
  const onDown = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType === "touch") navigator.vibrate?.(10);
  };

  const base =
    "group relative inline-flex select-none items-center justify-center overflow-hidden rounded-full font-display font-semibold uppercase tracking-[0.14em] outline-offset-4 transition-[filter,background-color] duration-200 disabled:pointer-events-none disabled:opacity-50 touch-manipulation";
  const look =
    variant === "primary"
      ? "bg-gradient-to-b from-fill to-[color-mix(in_srgb,var(--fill)_78%,black)] text-accent-ink hover:brightness-110"
      : "glass text-ink hover:bg-surface-2";

  const content = (
    <>
      {/* light sweep on hover */}
      <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 group-hover:animate-[sweep_0.9s_ease-out] group-hover:opacity-100" />
      <span
        aria-hidden
        style={{ color: glyphTint[glyph] }}
        className={`relative grid shrink-0 place-items-center rounded-full bg-surface text-[color:var(--key)] shadow-[inset_0_2px_0_rgb(255_255_255/0.16),inset_0_-3px_0_rgb(0_0_0/0.25)] ${keySizes[size]}`}
      >
        <Glyph name={glyph} className="size-4" />
      </span>
      <span className="relative">{children}</span>
    </>
  );

  const motionProps = {
    style: canMagnet ? { x, y } : undefined,
    whileTap: reduce ? undefined : { scale: 0.96, y: 3 },
    transition: { type: "spring" as const, stiffness: 500, damping: 20 },
    onPointerMove: onMove,
    onPointerLeave: onLeave,
    onPointerDown: onDown,
    className: `${base} ${sizes[size]} ${look} ${className}`,
  };

  if ("href" in props && props.href !== undefined) {
    if (props.external) {
      return (
        <m.a href={props.href} target="_blank" rel="noopener noreferrer" {...motionProps}>
          {content}
        </m.a>
      );
    }
    return (
      <MotionLink href={props.href} {...motionProps}>
        {content}
      </MotionLink>
    );
  }

  const b = props as AsButton;
  return (
    <m.button type={b.type ?? "button"} onClick={b.onClick} disabled={b.disabled} {...motionProps}>
      {content}
    </m.button>
  );
}
