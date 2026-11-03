"use client";

import { useState } from "react";
import Image from "next/image";
import type { Product } from "@/data/products";
import { ProductImage } from "./ProductImage";
import { imageLoading } from "@/lib/image-loading";

export function ProductGallery({ product }: { product: Product }) {
  const images = product.images?.length ? product.images.slice(0, 5) : [product.image];
  const [active, setActive] = useState(0);
  const index = active < images.length ? active : 0;
  return <div className="min-w-0 lg:sticky lg:top-28">
    <div className="mx-auto flex aspect-square w-full max-w-[30rem] items-center justify-center rounded-3xl border border-line-strong bg-surface p-6 sm:p-10">
      <ProductImage key={images[index]!.src} product={{ ...product, image: images[index]! }} priority={index === 0} eager presentation="catalog" sizes="(min-width: 1024px) 480px, (min-width: 640px) 448px, calc(100vw - 88px)" />
    </div>
    {images.length > 1 && <div role="group" aria-label="Product photos" className="mx-auto mt-3 grid w-full max-w-[30rem] grid-cols-5 gap-2">
      {images.map((image, i) => <button key={`${image.src}:${i}`} type="button" onClick={() => setActive(i)} aria-label={`Show product photo ${i + 1}${i === 0 ? " (cover)" : ""}`} aria-pressed={i === index} className={`flex aspect-square min-w-0 items-center justify-center overflow-hidden rounded-xl border bg-surface p-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue ${i === index ? "border-blue" : "border-line-strong"}`}>
        <Image src={image.src} alt="" width={image.width} height={image.height} sizes="96px" {...imageLoading("visible")} className="size-full object-contain" />
      </button>)}
    </div>}
    {images.length > 1 && <p role="status" className="mt-2 text-center text-xs text-muted">Photo {index + 1} of {images.length}</p>}
  </div>;
}
