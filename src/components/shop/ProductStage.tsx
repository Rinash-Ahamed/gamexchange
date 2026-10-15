import type { Product } from "@/data/products";
import { ProductImage } from "./ProductImage";

/**
 * Lit pedestal for a product photo. Theme-aware: dark gets a spotlight cone and floor bloom;
 * light gets a soft studio pool and a contact shadow. Decorative layers are aria-hidden.
 */
export function ProductStage({ product, priority = false, sizes, className = "" }: { product: Product; priority?: boolean; sizes: string; className?: string }) {
  return (
    <div className={`relative isolate ${className}`}>
      <span aria-hidden className="product-stage absolute inset-0 -z-10" />
      <span aria-hidden className="spot absolute inset-x-[16%] -top-[10%] bottom-[18%] -z-10 opacity-70" />
      <span aria-hidden className="stage-floor absolute inset-x-[8%] bottom-[2%] h-[22%] -z-10" />
      <span aria-hidden className="stage-ring absolute inset-x-[14%] bottom-[7%] h-[18%] -z-10 opacity-60" />
      <div className="relative size-full p-[8%] pb-[14%]">
        <ProductImage product={product} priority={priority} sizes={sizes} />
      </div>
    </div>
  );
}
