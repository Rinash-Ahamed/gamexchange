import type { Metadata } from "next";
import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { adminButtonClass, adminGhostButtonClass, adminInputClass, adminLabelClass } from "@/components/admin/styles";
import { requireAdmin } from "@/lib/admin/auth";
import { listInventory, listInventoryCategories } from "@/lib/admin/db";
import { deleteCategoryAction, saveCategoryAction } from "../../category-actions";

export const metadata: Metadata = { title: "Categories", robots: { index: false, follow: false } };

const notices: Record<string, string> = {
  created: "Category added. You can now select it in inventory.", renamed: "Category renamed across inventory and the shop.", deleted: "Category deleted.",
};
const errors: Record<string, string> = {
  invalid: "Enter a category name between 1 and 160 characters.",
  "category-missing": "This category is no longer available. Refresh and try again.",
  "category-duplicate": "That name is already used by another category or its existing products. Choose a different name.",
  "category-used": "Move all products to another category before deleting this one, including draft and out-of-stock items.",
  "category-limit": "You can save up to 100 categories. Remove an unused category before adding another.",
};

export default async function CategoriesPage({ searchParams }: { searchParams: Promise<{ notice?: string; error?: string; saved?: string }> }) {
  await requireAdmin();
  const [categories, inventory, query] = await Promise.all([listInventoryCategories(), listInventory(), searchParams]);
  const counts = new Map<string, number>();
  for (const item of inventory) if (item.categoryId) counts.set(item.categoryId, (counts.get(item.categoryId) ?? 0) + 1);
  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="font-display text-2xl font-bold uppercase sm:text-3xl">Categories</h1><p className="mt-2 text-sm text-muted">Keep your shop organised. Categories appear in the shop when they have available stock.</p></div>
        <Link href="/admin/inventory" className={adminGhostButtonClass}>Back to inventory</Link>
      </div>
      {query.notice && notices[query.notice] && <p role="status" className="mt-5 rounded-xl border border-ok/30 bg-ok/10 p-3 text-sm text-ok">{notices[query.notice]}</p>}
      {query.error && errors[query.error] && <p role="alert" className="mt-5 rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger">{errors[query.error]}</p>}
      <section className="metal mt-6 rounded-xl p-4" aria-labelledby="add-category-heading">
        <h2 id="add-category-heading" className="font-display text-base font-bold uppercase">Add category</h2>
        <ConfirmSubmit key={query.saved ?? "new"} submitAction={saveCategoryAction} title="Add category?" message="Make this category available in the inventory dropdown?" confirmLabel="Add category" cancelLabel="Keep editing" intent="primary" className="mt-3 flex flex-wrap items-end gap-3">
          <label className="min-w-0 flex-1 basis-56"><span className={adminLabelClass}>Category name</span><input name="name" required maxLength={160} placeholder="e.g. Handheld consoles" className={adminInputClass} /></label>
          <button type="submit" disabled={categories.length >= 100} className={`${adminButtonClass} gap-2 disabled:cursor-not-allowed disabled:opacity-50`}><Plus className="size-4" aria-hidden />Add category</button>
        </ConfirmSubmit>
      </section>
      <div className="mt-7 flex items-center justify-between gap-3"><h2 className="font-display text-lg font-bold uppercase">Shop categories</h2><span className="text-xs text-muted">{categories.length} categories</span></div>
      <ul className="metal mt-3 divide-y divide-line overflow-hidden rounded-xl">
        {categories.map((category) => {
          const count = counts.get(category.id) ?? 0;
          return <li key={`${category.id}:${category.name}`} className="p-3 sm:p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0"><h3 className="break-words text-sm font-semibold">{category.name}</h3><p className="mt-1 text-xs text-muted">{count} {count === 1 ? "product" : "products"}</p></div>
              <ConfirmSubmit submitAction={deleteCategoryAction} title="Delete category?" message={`Delete ${category.name}? Products are never deleted with a category.`}>
                <input type="hidden" name="id" value={category.id} />
                <button type="submit" disabled={count > 0} title={count > 0 ? "Move this category's products first" : undefined} aria-label={`Delete ${category.name}`} className={`${adminGhostButtonClass} gap-2 text-danger disabled:cursor-not-allowed disabled:opacity-40`}><Trash2 className="size-4" aria-hidden />Delete</button>
              </ConfirmSubmit>
            </div>
            <details name="category-edit" className="group mt-3">
              <summary className={`${adminGhostButtonClass} w-fit cursor-pointer list-none gap-2`}><Pencil className="size-4" aria-hidden />Rename</summary>
              <ConfirmSubmit submitAction={saveCategoryAction} title="Rename category?" message={`Update the category name for all products in ${category.name}?`} confirmLabel="Save name" cancelLabel="Keep editing" intent="primary" className="mt-3 flex flex-wrap items-end gap-3">
                <input type="hidden" name="id" value={category.id} />
                <label className="min-w-0 flex-1 basis-56"><span className={adminLabelClass}>Category name</span><input name="name" required maxLength={160} defaultValue={category.name} className={adminInputClass} /></label>
                <button type="submit" className={adminButtonClass}>Save name</button>
              </ConfirmSubmit>
            </details>
          </li>;
        })}
      </ul>
      {!categories.length && <p className="mt-4 text-sm text-muted">No categories yet. Add one above before adding stock.</p>}
      <p className="mt-3 text-xs text-muted">To delete a category with products, change their category in Inventory first.</p>
    </div>
  );
}
