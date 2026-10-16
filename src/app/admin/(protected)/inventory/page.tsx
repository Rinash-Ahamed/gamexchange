import type { Metadata } from "next";
import { PackagePlus, Save, Trash2 } from "lucide-react";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { adminButtonClass, adminGhostButtonClass, adminInputClass, adminLabelClass } from "@/components/admin/styles";
import { formatINR } from "@/data/products";
import { listInventory } from "@/lib/admin/db";
import { formatAdminDate, titleCaseStatus } from "@/lib/admin/format";
import { inventoryCategories, inventoryStatuses } from "@/lib/admin/types";
import { createInventoryAction, deleteInventoryAction, updateInventoryAction } from "../../actions";

export const metadata: Metadata = { title: "Inventory management", robots: { index: false, follow: false } };

const notices: Record<string, string> = {
  created: "Inventory item created.",
  updated: "Inventory item updated.",
  deleted: "Inventory item deleted.",
};

const errors: Record<string, string> = {
  invalid: "Check the submitted values and try again.",
  duplicate: "That SKU is already in use.",
};

export default async function InventoryPage({ searchParams }: { searchParams: Promise<{ notice?: string; error?: string }> }) {
  const [items, query] = await Promise.all([listInventory(), searchParams]);

  return (
    <div className="mx-auto max-w-7xl">
      <div>
        <h1 className="font-display text-3xl font-bold uppercase sm:text-4xl">Inventory</h1>
        <p className="mt-2 text-muted">Products marked active and in stock appear automatically in their public shop category.</p>
      </div>
      <datalist id="inventory-category-options">
        {inventoryCategories.map((category) => <option key={category} value={category} />)}
      </datalist>

      {query.notice && notices[query.notice] && <p role="status" className="mt-6 rounded-xl border border-ok/30 bg-ok/10 px-4 py-3 text-sm text-ok">{notices[query.notice]}</p>}
      {query.error && errors[query.error] && <p role="alert" className="mt-6 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">{errors[query.error]}</p>}

      <details className="metal group mt-8 rounded-3xl p-5 sm:p-6">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-bold uppercase">
          <span className="flex items-center gap-3"><PackagePlus className="size-5 text-accent-text" aria-hidden />Add inventory item</span>
          <span aria-hidden className="text-2xl text-muted transition-transform group-open:rotate-45">+</span>
        </summary>
        <form action={createInventoryAction} className="mt-6 grid gap-4 border-t border-line pt-6 sm:grid-cols-2 lg:grid-cols-4">
          <label><span className={adminLabelClass}>SKU</span><input name="sku" required maxLength={160} placeholder="PS5-SLIM-001" className={adminInputClass} /></label>
          <label className="sm:col-span-1 lg:col-span-2"><span className={adminLabelClass}>Product name</span><input name="name" required maxLength={160} className={adminInputClass} /></label>
          <label><span className={adminLabelClass}>Platform</span><input name="platform" required placeholder="PlayStation 5" className={adminInputClass} /></label>
          <label><span className={adminLabelClass}>Shop category</span><input name="category" list="inventory-category-options" required defaultValue="Console" placeholder="Console" className={adminInputClass} /></label>
          <label><span className={adminLabelClass}>Condition</span><input name="condition" required defaultValue="Pre-Owned" className={adminInputClass} /></label>
          <label><span className={adminLabelClass}>Stock</span><input name="stock" type="number" min="0" required defaultValue="1" className={adminInputClass} /></label>
          <label><span className={adminLabelClass}>Selling price</span><input name="price" type="number" min="0" required className={adminInputClass} /></label>
          <label><span className={adminLabelClass}>Trade-in voucher</span><input name="tradeInVoucher" type="number" min="0" required defaultValue="0" className={adminInputClass} /></label>
          <label><span className={adminLabelClass}>Trade-in cash</span><input name="tradeInCash" type="number" min="0" required defaultValue="0" className={adminInputClass} /></label>
          <label><span className={adminLabelClass}>Status</span><select name="status" defaultValue="draft" className={adminInputClass}>{inventoryStatuses.map((status) => <option key={status} value={status}>{titleCaseStatus(status)}</option>)}</select></label>
          <label className="sm:col-span-2 lg:col-span-3"><span className={adminLabelClass}>Image URL or local path</span><input name="imageSrc" required placeholder="https://... or /images/product.png" className={adminInputClass} /></label>
          <label><span className={adminLabelClass}>Image width</span><input name="imageWidth" type="number" min="1" defaultValue="480" className={adminInputClass} /></label>
          <label><span className={adminLabelClass}>Image height</span><input name="imageHeight" type="number" min="1" defaultValue="480" className={adminInputClass} /></label>
          <label className="flex min-h-11 items-center gap-3 self-end rounded-xl border border-line-strong bg-surface px-4 text-sm font-medium"><input name="featured" type="checkbox" className="size-4 accent-[var(--fill)]" />Featured product</label>
          <div className="flex items-end sm:col-span-2 lg:col-span-1"><button type="submit" className={`${adminButtonClass} w-full`}>Create item</button></div>
        </form>
      </details>

      <section className="mt-8" aria-labelledby="inventory-list">
        <div className="flex items-center justify-between gap-4">
          <h2 id="inventory-list" className="font-display text-xl font-bold uppercase">All items</h2>
          <p className="text-sm text-muted">{items.length} {items.length === 1 ? "item" : "items"}</p>
        </div>

        {items.length ? (
          <div className="mt-4 grid gap-4 xl:grid-cols-2">
            {items.map((item) => (
              <article key={item.id} className="metal rounded-2xl p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-text">{item.sku}</p>
                    <h3 className="mt-1 font-display text-lg font-bold uppercase">{item.name}</h3>
                    <p className="mt-1 text-sm text-muted">{item.platform} · {item.condition} · Updated {formatAdminDate(item.updatedAt)}</p>
                  </div>
                  <span className="rounded-full border border-line-strong bg-surface px-3 py-1 text-xs font-semibold">{titleCaseStatus(item.status)}</span>
                </div>

                <form action={updateInventoryAction} className="mt-5 grid grid-cols-2 gap-3 border-t border-line pt-5 sm:grid-cols-4">
                  <input type="hidden" name="id" value={item.id} />
                  <label className="col-span-2"><span className={adminLabelClass}>Product name</span><input name="name" required maxLength={160} defaultValue={item.name} className={adminInputClass} /></label>
                  <label><span className={adminLabelClass}>SKU</span><input name="sku" required maxLength={160} defaultValue={item.sku} className={adminInputClass} /></label>
                  <label><span className={adminLabelClass}>Platform</span><input name="platform" required defaultValue={item.platform} className={adminInputClass} /></label>
                  <label><span className={adminLabelClass}>Shop category</span><input name="category" list="inventory-category-options" required defaultValue={item.category} className={adminInputClass} /></label>
                  <label><span className={adminLabelClass}>Condition</span><input name="condition" required defaultValue={item.condition} className={adminInputClass} /></label>
                  <label><span className={adminLabelClass}>Stock</span><input name="stock" type="number" min="0" required defaultValue={item.stock} className={adminInputClass} /></label>
                  <label><span className={adminLabelClass}>Price</span><input name="price" type="number" min="0" required defaultValue={item.price} className={adminInputClass} /></label>
                  <label><span className={adminLabelClass}>Trade-in voucher</span><input name="tradeInVoucher" type="number" min="0" required defaultValue={item.tradeInVoucher} className={adminInputClass} /></label>
                  <label><span className={adminLabelClass}>Trade-in cash</span><input name="tradeInCash" type="number" min="0" required defaultValue={item.tradeInCash} className={adminInputClass} /></label>
                  <label className="col-span-2 sm:col-span-1"><span className={adminLabelClass}>Status</span><select name="status" defaultValue={item.status} className={adminInputClass}>{inventoryStatuses.map((status) => <option key={status} value={status}>{titleCaseStatus(status)}</option>)}</select></label>
                  <label className="flex min-h-11 items-center gap-2 self-end rounded-xl border border-line-strong bg-surface px-3 text-sm"><input name="featured" type="checkbox" defaultChecked={item.featured} className="size-4 accent-[var(--fill)]" />Featured</label>
                  <label className="col-span-2 sm:col-span-4"><span className={adminLabelClass}>Image URL or local path</span><input name="imageSrc" required defaultValue={item.imageSrc} className={adminInputClass} /></label>
                  <label><span className={adminLabelClass}>Image width</span><input name="imageWidth" type="number" min="1" required defaultValue={item.imageWidth} className={adminInputClass} /></label>
                  <label><span className={adminLabelClass}>Image height</span><input name="imageHeight" type="number" min="1" required defaultValue={item.imageHeight} className={adminInputClass} /></label>
                  <div className="col-span-2 flex flex-wrap items-center justify-between gap-3 sm:col-span-4">
                    <p className="text-sm text-muted">Current price: <strong>{formatINR(item.price)}</strong></p>
                    <button type="submit" className={adminButtonClass}><Save className="mr-2 size-4" aria-hidden />Save changes</button>
                  </div>
                </form>

                <div className="mt-3 flex justify-end">
                  <ConfirmSubmit submitAction={deleteInventoryAction} message={`Delete ${item.name}? This cannot be undone.`}>
                    <input type="hidden" name="id" value={item.id} />
                    <button type="submit" className={`${adminGhostButtonClass} text-danger hover:border-danger`}><Trash2 className="mr-2 size-4" aria-hidden />Delete</button>
                  </ConfirmSubmit>
                </div>
              </article>
            ))}
          </div>
        ) : <p className="mt-4 rounded-2xl border border-dashed border-line-strong p-10 text-center text-muted">No inventory items yet.</p>}
      </section>
    </div>
  );
}
