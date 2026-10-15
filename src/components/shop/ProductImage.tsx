"use client";

import Image from "next/image";
import { useState } from "react";
import { Gamepad2 } from "lucide-react";
import type { Product } from "@/data/products";

/** Product photo from the client's own CDN, with an on-brand fallback if it can't load. */
export function ProductImage({ product, priority = false, sizes }: { product: Product; priority?: boolean; sizes: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div role="img" aria-label={`${product.name} — photo unavailable`} className="grid size-full place-items-center text-muted">
        <span className="grid place-items-center gap-2 text-center">
          <Gamepad2 className="size-10" aria-hidden />
          <span className="font-display text-xs font-semibold uppercase tracking-[0.2em]">{product.platform}</span>
        </span>
      </div>
    );
  }

  return (
    <Image
      src={product.image.src}
      alt={product.name}
      width={product.image.width}
      height={product.image.height}
      sizes={sizes}
      priority={priority}
      onError={() => setFailed(true)}
      quality={85}
      className="themed-img size-full object-contain [filter:drop-shadow(0_26px_26px_var(--prod-shadow))] transition-transform duration-500 ease-out group-hover:-translate-y-2 group-hover:scale-[1.04]"
    />
  );
}
