import type { InventoryItem } from "@/lib/admin/types";
import { inventoryStatuses } from "@/lib/admin/types";
import { titleCaseStatus } from "@/lib/admin/format";
import { adminInputClass, adminLabelClass } from "./styles";

export function InventoryFields({ item }: { item?: InventoryItem }) {
  return (
    <>
      {item && <input type="hidden" name="id" value={item.id} />}
      <label><span className={adminLabelClass}>SKU</span><input name="sku" required maxLength={160} defaultValue={item?.sku} placeholder="PS5-SLIM-001" className={adminInputClass} /></label>
      <label className="sm:col-span-2"><span className={adminLabelClass}>Product name</span><input name="name" required maxLength={160} defaultValue={item?.name} className={adminInputClass} /></label>
      <label><span className={adminLabelClass}>Platform</span><input name="platform" required maxLength={160} defaultValue={item?.platform} placeholder="PlayStation 5" className={adminInputClass} /></label>
      <label><span className={adminLabelClass}>Shop category</span><input name="category" list="inventory-category-options" required maxLength={160} defaultValue={item?.category ?? "Console"} className={adminInputClass} /></label>
      <label><span className={adminLabelClass}>Condition</span><input name="condition" required maxLength={160} defaultValue={item?.condition ?? "Pre-Owned"} className={adminInputClass} /></label>
      <label><span className={adminLabelClass}>Stock</span><input name="stock" type="number" min="0" max="100000" required defaultValue={item?.stock ?? 1} className={adminInputClass} /></label>
      <label><span className={adminLabelClass}>Selling price</span><input name="price" type="number" min="0" max="10000000" required defaultValue={item?.price} className={adminInputClass} /></label>
      <label><span className={adminLabelClass}>Trade-in voucher</span><input name="tradeInVoucher" type="number" min="0" max="10000000" required defaultValue={item?.tradeInVoucher ?? 0} className={adminInputClass} /></label>
      <label><span className={adminLabelClass}>Trade-in cash</span><input name="tradeInCash" type="number" min="0" max="10000000" required defaultValue={item?.tradeInCash ?? 0} className={adminInputClass} /></label>
      <label><span className={adminLabelClass}>Status</span><select name="status" defaultValue={item?.status ?? "draft"} className={adminInputClass}>{inventoryStatuses.map((status) => <option key={status} value={status}>{titleCaseStatus(status)}</option>)}</select></label>
      <label className="flex min-h-11 items-center gap-3 self-end rounded-xl border border-line-strong bg-surface px-4 text-sm"><input name="featured" type="checkbox" defaultChecked={item?.featured} className="size-4 accent-[var(--fill)]" />Featured product</label>
      <label className="sm:col-span-2"><span className={adminLabelClass}>Image URL or local path</span><input name="imageSrc" required maxLength={2000} defaultValue={item?.imageSrc} placeholder="https://... or /images/product.png" className={adminInputClass} /></label>
      <label><span className={adminLabelClass}>Image width</span><input name="imageWidth" type="number" min="1" max="8000" required defaultValue={item?.imageWidth ?? 480} className={adminInputClass} /></label>
      <label><span className={adminLabelClass}>Image height</span><input name="imageHeight" type="number" min="1" max="8000" required defaultValue={item?.imageHeight ?? 480} className={adminInputClass} /></label>
    </>
  );
}
