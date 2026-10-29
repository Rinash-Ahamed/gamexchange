import Link from "next/link";
import { Search } from "lucide-react";
import { stockFilters, type InventoryFilters as Filters } from "@/lib/admin/inventory-filters";
import { inventoryStatuses, type InventoryCategory } from "@/lib/admin/types";
import { titleCaseStatus } from "@/lib/admin/format";
import { adminButtonClass, adminGhostButtonClass, adminInputClass, adminLabelClass } from "./styles";

export function InventoryFilters({ filters, categories, platforms }: { filters: Filters; categories: InventoryCategory[]; platforms: string[] }) {
  return (
    <form action="/admin/inventory#inventory-list" method="get" role="search" aria-label="Search inventory" className="metal mt-4 rounded-xl p-3 sm:p-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <label className="min-w-0 sm:col-span-2"><span className={adminLabelClass}>Search inventory</span><input type="search" name="q" maxLength={160} defaultValue={filters.q} placeholder="Product name, SKU, platform..." className={adminInputClass} /></label>
        <label className="min-w-0"><span className={adminLabelClass}>Category</span><select name="category" defaultValue={filters.category} className={adminInputClass}>
          <option value="">All categories</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select></label>
        <label className="min-w-0"><span className={adminLabelClass}>Platform</span><select name="platform" defaultValue={filters.platform} className={adminInputClass}>
          <option value="">All platforms</option>{platforms.map((platform) => <option key={platform} value={platform}>{platform}</option>)}
        </select></label>
        <label className="min-w-0"><span className={adminLabelClass}>Status</span><select name="status" defaultValue={filters.status} className={adminInputClass}>
          <option value="">All statuses</option>{inventoryStatuses.map((status) => <option key={status} value={status}>{titleCaseStatus(status)}</option>)}
        </select></label>
        <label className="min-w-0"><span className={adminLabelClass}>Stock</span><select name="stock" defaultValue={filters.stock} className={adminInputClass}>
          <option value="">Any stock level</option>{stockFilters.map((stock) => <option key={stock.value} value={stock.value}>{stock.label}</option>)}
        </select></label>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="submit" className={`${adminButtonClass} gap-2`}><Search className="size-4" aria-hidden />Apply filters</button>
        {Object.values(filters).some(Boolean) && <Link href="/admin/inventory#inventory-list" className={adminGhostButtonClass}>Clear filters</Link>}
      </div>
    </form>
  );
}
