import type { Metadata } from "next";
import { ChevronDown, PackagePlus, Pencil, Save, Trash2 } from "lucide-react";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { InventoryFields } from "@/components/admin/InventoryFields";
import { InventoryFilters } from "@/components/admin/InventoryFilters";
import { adminButtonClass, adminGhostButtonClass } from "@/components/admin/styles";
import { listInventory, listInventoryCategories } from "@/lib/admin/db";
import { requireAdmin } from "@/lib/admin/auth";
import { formatAdminDate, titleCaseStatus } from "@/lib/admin/format";
import { inventoryStatuses } from "@/lib/admin/types";
import { ProductPrice } from "@/components/shop/ProductPrice";
import { ConditionBadge } from "@/components/shop/ConditionBadge";
import { filterInventory, groupInventory, queryValue, stockFilters, type InventoryFilters as Filters, type InventorySearchParams } from "@/lib/admin/inventory-filters";
import { createInventoryAction, deleteInventoryAction, updateInventoryAction } from "../../actions";

export const metadata: Metadata = { title: "Inventory management", robots: { index: false, follow: false } };

const notices: Record<string, string> = { created: "Inventory item created.", updated: "Inventory item updated.", deleted: "Inventory item deleted." };
const errors: Record<string, string> = {
  invalid: "Check the submitted values. Enter a whole-rupee price and a discount from 0 to 100%. A discount must reduce the final price by at least one rupee.", duplicate: "That SKU is already in use.",
  category: "That category has changed or been deleted. Reopen the form and select an available category.",
  image: "Choose a static JPG, PNG or WebP under 5 MB, between 300 and 4096 pixels on each side.",
  storage: "Image upload failed. Check the Firebase Storage bucket and server permissions, then try again.",
};

export default async function InventoryPage({ searchParams }: { searchParams: Promise<InventorySearchParams> }) {
  await requireAdmin();
  const [items, categories, query] = await Promise.all([listInventory(), listInventoryCategories(), searchParams]);
  const platforms = [...new Set(items.map((item) => item.platform))].sort((a, b) => a.localeCompare(b));
  const filters: Filters = {
    q: queryValue(query.q).slice(0, 160),
    category: categories.find((category) => category.id === queryValue(query.category))?.id ?? "",
    platform: platforms.find((platform) => platform === queryValue(query.platform)) ?? "",
    status: inventoryStatuses.find((status) => status === queryValue(query.status)) ?? "",
    stock: stockFilters.find((stock) => stock.value === queryValue(query.stock))?.value ?? "",
  };
  const visible = filterInventory(items, filters);
  const groups = groupInventory(visible);
  const notice = queryValue(query.notice);
  const error = queryValue(query.error);

  return (
    <div className="mx-auto max-w-7xl">
      <h1 className="font-display text-2xl font-bold uppercase sm:text-3xl">Inventory</h1>
      <p className="mt-2 text-muted">Browse by category. Open Edit only when you need to make a change. Active products with stock appear in the public shop.</p>
      {notice && notices[notice] && <p role="status" className="mt-6 rounded-xl border border-ok/30 bg-ok/10 px-4 py-3 text-sm text-ok">{notices[notice]}</p>}
      {error && errors[error] && <p role="alert" className="mt-6 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">{errors[error]}</p>}

      <details key={queryValue(query.saved) || "new-item"} className="metal group mt-6 rounded-2xl p-4 sm:p-5">
        <summary className="admin-control flex cursor-pointer list-none items-center justify-between gap-3 font-display text-base font-bold uppercase">
          <span className="flex items-center gap-3"><PackagePlus className="size-5 text-accent-text" aria-hidden />Add inventory item</span>
          <ChevronDown className="size-5 shrink-0 transition-transform group-open:rotate-180" aria-hidden />
        </summary>
        <ConfirmSubmit submitAction={createInventoryAction} title="Create inventory item?" confirmLabel="Create item" cancelLabel="Keep editing" intent="primary" message="Add this item to inventory? If its status is Active and stock is above zero, it will also appear in the public shop." className="mt-4 grid gap-3 border-t border-line pt-4 sm:grid-cols-2 xl:grid-cols-4">
          <InventoryFields categories={categories} />
          <div className="col-span-full flex justify-end"><button type="submit" className={adminButtonClass}>Create item</button></div>
        </ConfirmSubmit>
      </details>

      <section id="inventory-list" aria-labelledby="inventory-heading" className="mt-8 scroll-mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3"><h2 id="inventory-heading" className="font-display text-xl font-bold uppercase">Inventory by category</h2><p role="status" className="text-sm text-muted">Showing {visible.length} of {items.length} {items.length === 1 ? "item" : "items"}</p></div>
        <InventoryFilters key={JSON.stringify(filters)} filters={filters} categories={categories} platforms={platforms} />
        {groups.length > 1 && <nav aria-label="Inventory categories" className="mt-3 flex flex-wrap gap-2">{groups.map((group, index) => <a key={group.category} href={`#inventory-category-${index}`} className="admin-control inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface px-3 text-xs font-semibold hover:border-blue">{group.category}<span className="text-muted">{group.items.length}</span></a>)}</nav>}
        <div className="mt-6 space-y-8">
          {groups.map((group, index) => (
            <section key={group.category} id={`inventory-category-${index}`} aria-labelledby={`inventory-category-heading-${index}`} className="scroll-mt-8">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h3 id={`inventory-category-heading-${index}`} className="font-display text-lg font-bold uppercase">{group.category}</h3><p className="text-xs text-muted">{group.items.length} {group.items.length === 1 ? "item" : "items"} · {group.items.reduce((total, item) => total + item.stock, 0)} units in stock</p></div>
              <ul className="metal divide-y divide-line overflow-hidden rounded-2xl">
                {group.items.map((item) => (
                  <li key={`${item.id}:${item.updatedAt}`} className="min-w-0 p-3 sm:p-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0 flex-1 basis-56">
                        <p className="break-all text-xs font-semibold uppercase tracking-wider text-accent-text">{item.sku}</p>
                        <h4 className="mt-1 break-words font-display text-lg font-bold uppercase">{item.name}</h4>
                        <p className="mt-1 text-xs text-muted">{item.platform} · {item.condition} · Updated {formatAdminDate(item.updatedAt)}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                        <ProductPrice product={item} className="text-lg" />
                        <ConditionBadge condition={item.condition} />
                        <p className="text-sm text-muted">Stock: <strong className="text-ink">{item.stock}</strong></p>
                        <span className="rounded-full border border-line-strong bg-surface px-3 py-1 text-xs font-semibold">{titleCaseStatus(item.status)}</span>
                        <ConfirmSubmit submitAction={deleteInventoryAction} title="Delete inventory item?" message={`Delete ${item.name} (${item.sku}) from inventory and the public shop? This cannot be undone.`}>
                          <input type="hidden" name="id" value={item.id} /><button type="submit" aria-label={`Delete ${item.name} (${item.sku})`} className={`${adminGhostButtonClass} text-danger hover:border-danger`}><Trash2 className="mr-2 size-4" aria-hidden />Delete</button>
                        </ConfirmSubmit>
                      </div>
                    </div>
                    <details name="inventory-edit" className="group mt-3">
                      <summary className={`${adminGhostButtonClass} cursor-pointer list-none gap-2`}><Pencil className="size-4" aria-hidden /><span className="group-open:hidden">Edit item</span><span className="hidden group-open:inline">Close editor</span><ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden /></summary>
                      <ConfirmSubmit submitAction={updateInventoryAction} title="Save inventory changes?" confirmLabel="Save changes" cancelLabel="Keep editing" intent="primary" message={`Save changes to ${item.name} (${item.sku})? Changes to price, stock and visibility will update the public shop.`} className="mt-3 grid gap-3 rounded-xl border border-line bg-surface/40 p-3 sm:grid-cols-2 xl:grid-cols-4">
                        <InventoryFields item={item} categories={categories} />
                        <div className="col-span-full flex justify-end"><button type="submit" className={adminButtonClass}><Save className="mr-2 size-4" aria-hidden />Save changes</button></div>
                      </ConfirmSubmit>
                    </details>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        {!items.length && <p className="mt-4 rounded-2xl border border-dashed border-line-strong p-10 text-center text-muted">No inventory items yet. Add an item above.</p>}
        {items.length > 0 && !visible.length && <p className="mt-4 rounded-2xl border border-dashed border-line-strong p-6 text-center text-sm text-muted">No items match your search and filters. Try a different search or clear the filters.</p>}
      </section>
    </div>
  );
}
