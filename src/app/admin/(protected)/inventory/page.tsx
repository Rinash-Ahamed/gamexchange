import type { Metadata } from "next";
import { ChevronDown, PackagePlus, Pencil, Save, Trash2 } from "lucide-react";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { InventoryFields } from "@/components/admin/InventoryFields";
import { adminButtonClass, adminGhostButtonClass } from "@/components/admin/styles";
import { formatINR } from "@/data/products";
import { listInventory } from "@/lib/admin/db";
import { requireAdmin } from "@/lib/admin/auth";
import { formatAdminDate, titleCaseStatus } from "@/lib/admin/format";
import { inventoryCategories, type InventoryItem } from "@/lib/admin/types";
import { createInventoryAction, deleteInventoryAction, updateInventoryAction } from "../../actions";

export const metadata: Metadata = { title: "Inventory management", robots: { index: false, follow: false } };

const notices: Record<string, string> = { created: "Inventory item created.", updated: "Inventory item updated.", deleted: "Inventory item deleted." };
const errors: Record<string, string> = { invalid: "Check the submitted values and try again.", duplicate: "That SKU is already in use." };

function groupInventory(items: InventoryItem[]) {
  const groups = new Map<string, { category: string; items: InventoryItem[] }>();
  for (const item of items) {
    const name = item.category.trim() || "Uncategorized";
    const key = name.toLocaleLowerCase("en");
    const category = inventoryCategories.find((entry) => entry.toLowerCase() === key) ?? name;
    const group = groups.get(key) ?? { category, items: [] };
    group.items.push(item);
    groups.set(key, group);
  }
  const rank = (category: string) => {
    const index = inventoryCategories.findIndex((entry) => entry === category);
    return index < 0 ? inventoryCategories.length : index;
  };
  return [...groups.values()].sort((a, b) => rank(a.category) - rank(b.category) || a.category.localeCompare(b.category));
}

export default async function InventoryPage({ searchParams }: { searchParams: Promise<{ notice?: string; error?: string; saved?: string }> }) {
  await requireAdmin();
  const [items, query] = await Promise.all([listInventory(), searchParams]);
  const groups = groupInventory(items);

  return (
    <div className="mx-auto max-w-7xl">
      <h1 className="font-display text-3xl font-bold uppercase sm:text-4xl">Inventory</h1>
      <p className="mt-2 text-muted">Browse by category. Open Edit only when you need to make a change. Active products with stock appear in the public shop.</p>
      <datalist id="inventory-category-options">{inventoryCategories.map((category) => <option key={category} value={category} />)}</datalist>
      {query.notice && notices[query.notice] && <p role="status" className="mt-6 rounded-xl border border-ok/30 bg-ok/10 px-4 py-3 text-sm text-ok">{notices[query.notice]}</p>}
      {query.error && errors[query.error] && <p role="alert" className="mt-6 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">{errors[query.error]}</p>}

      <details key={query.saved ?? "new-item"} className="metal group mt-8 rounded-3xl p-5 sm:p-6">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-bold uppercase">
          <span className="flex items-center gap-3"><PackagePlus className="size-5 text-accent-text" aria-hidden />Add inventory item</span>
          <ChevronDown className="size-5 shrink-0 transition-transform group-open:rotate-180" aria-hidden />
        </summary>
        <ConfirmSubmit submitAction={createInventoryAction} title="Create inventory item?" confirmLabel="Create item" cancelLabel="Keep editing" intent="primary" message="Add this item to inventory? If its status is Active and stock is above zero, it will also appear in the public shop." className="mt-6 grid gap-4 border-t border-line pt-6 sm:grid-cols-2 xl:grid-cols-4">
          <InventoryFields />
          <div className="col-span-full flex justify-end"><button type="submit" className={adminButtonClass}>Create item</button></div>
        </ConfirmSubmit>
      </details>

      <section id="inventory-list" aria-labelledby="inventory-heading" className="mt-8 scroll-mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3"><h2 id="inventory-heading" className="font-display text-xl font-bold uppercase">Inventory by category</h2><p className="text-sm text-muted">{items.length} {items.length === 1 ? "item" : "items"} in {groups.length} {groups.length === 1 ? "category" : "categories"}</p></div>
        {groups.length > 1 && <nav aria-label="Inventory categories" className="mt-4 flex flex-wrap gap-2">{groups.map((group, index) => <a key={group.category} href={`#inventory-category-${index}`} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line-strong bg-surface px-4 text-xs font-semibold hover:border-blue">{group.category}<span className="text-muted">{group.items.length}</span></a>)}</nav>}
        <div className="mt-6 space-y-8">
          {groups.map((group, index) => (
            <section key={group.category} id={`inventory-category-${index}`} aria-labelledby={`inventory-category-heading-${index}`} className="scroll-mt-8">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h3 id={`inventory-category-heading-${index}`} className="font-display text-lg font-bold uppercase">{group.category}</h3><p className="text-xs text-muted">{group.items.length} {group.items.length === 1 ? "item" : "items"} · {group.items.reduce((total, item) => total + item.stock, 0)} units in stock</p></div>
              <ul className="metal divide-y divide-line overflow-hidden rounded-2xl">
                {group.items.map((item) => (
                  <li key={`${item.id}:${item.updatedAt}`} className="min-w-0 p-4 sm:p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0 flex-1 basis-56">
                        <p className="break-all text-xs font-semibold uppercase tracking-wider text-accent-text">{item.sku}</p>
                        <h4 className="mt-1 break-words font-display text-lg font-bold uppercase">{item.name}</h4>
                        <p className="mt-1 text-xs text-muted">{item.platform} · {item.condition} · Updated {formatAdminDate(item.updatedAt)}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                        <p className="font-display text-lg font-bold tabular-nums">{formatINR(item.price)}</p>
                        <p className="text-sm text-muted">Stock: <strong className="text-ink">{item.stock}</strong></p>
                        <span className="rounded-full border border-line-strong bg-surface px-3 py-1 text-xs font-semibold">{titleCaseStatus(item.status)}</span>
                        <ConfirmSubmit submitAction={deleteInventoryAction} title="Delete inventory item?" message={`Delete ${item.name} (${item.sku}) from inventory and the public shop? This cannot be undone.`}>
                          <input type="hidden" name="id" value={item.id} /><button type="submit" aria-label={`Delete ${item.name} (${item.sku})`} className={`${adminGhostButtonClass} text-danger hover:border-danger`}><Trash2 className="mr-2 size-4" aria-hidden />Delete</button>
                        </ConfirmSubmit>
                      </div>
                    </div>
                    <details name="inventory-edit" className="group mt-3">
                      <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-xl border border-line-strong bg-surface px-4 font-display text-xs font-semibold uppercase tracking-wider hover:border-blue"><Pencil className="size-4" aria-hidden /><span className="group-open:hidden">Edit item</span><span className="hidden group-open:inline">Close editor</span><ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden /></summary>
                      <ConfirmSubmit submitAction={updateInventoryAction} title="Save inventory changes?" confirmLabel="Save changes" cancelLabel="Keep editing" intent="primary" message={`Save changes to ${item.name} (${item.sku})? Changes to price, stock and visibility will update the public shop.`} className="mt-4 grid gap-4 rounded-2xl border border-line bg-surface/40 p-4 sm:grid-cols-2 xl:grid-cols-4">
                        <InventoryFields item={item} />
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
      </section>
    </div>
  );
}
