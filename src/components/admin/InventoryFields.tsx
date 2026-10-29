import Link from "next/link";
import type { InventoryCategory, InventoryItem } from "@/lib/admin/types";
import { inventoryStatuses } from "@/lib/admin/types";
import { titleCaseStatus } from "@/lib/admin/format";
import { adminInputClass, adminLabelClass } from "./styles";
import { InventoryImageField } from "./InventoryImageField";

export function InventoryFields({ item, categories }: { item?: InventoryItem; categories: InventoryCategory[] }) {
  return (
    <>
      {item && <input type="hidden" name="id" value={item.id} />}
      <label><span className={adminLabelClass}>SKU</span><input name="sku" required maxLength={160} defaultValue={item?.sku} placeholder="PS5-SLIM-001" className={adminInputClass} /></label>
      <label className="sm:col-span-2"><span className={adminLabelClass}>Product name</span><input name="name" required maxLength={160} defaultValue={item?.name} className={adminInputClass} /></label>
      <label><span className={adminLabelClass}>Platform</span><input name="platform" required maxLength={160} defaultValue={item?.platform} placeholder="PlayStation 5" className={adminInputClass} /></label>
      <div><label><span className={adminLabelClass}>Shop category</span><select name="categoryId" required defaultValue={item?.categoryId ?? ""} className={adminInputClass}>
        <option value="" disabled>Select category</option>
        {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
      </select></label><Link href="/admin/categories" className="mt-1 inline-block text-xs text-accent-text hover:underline">Manage categories</Link></div>
      <label><span className={adminLabelClass}>Condition</span><input name="condition" required maxLength={160} defaultValue={item?.condition ?? "Pre-Owned"} className={adminInputClass} /></label>
      <label><span className={adminLabelClass}>Stock</span><input name="stock" type="number" min="0" max="100000" required defaultValue={item?.stock ?? 1} className={adminInputClass} /></label>
      <label><span className={adminLabelClass}>Selling price</span><input name="price" type="number" min="0" max="10000000" required defaultValue={item?.price} className={adminInputClass} /></label>
      <label><span className={adminLabelClass}>Status</span><select name="status" defaultValue={item?.status ?? "draft"} className={adminInputClass}>{inventoryStatuses.map((status) => <option key={status} value={status}>{titleCaseStatus(status)}</option>)}</select></label>
      <label className="admin-control flex items-center gap-2 self-end rounded-lg border border-line-strong bg-surface px-3 text-sm"><input name="featured" type="checkbox" defaultChecked={item?.featured} className="size-4 accent-[var(--fill)]" />Featured product</label>
      <InventoryImageField src={item?.imageSrc} />
    </>
  );
}
