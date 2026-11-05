import Link from "next/link";
import { adminGhostButtonClass } from "./styles";
import { recordPageHref, type AdminRecordScope, type RecordPageLocation } from "@/lib/admin/record-cursor";

export function RecordPageFields({ location }: { location: RecordPageLocation }) {
  return <><input type="hidden" name="pageAfter" value={location.after ?? ""} /><input type="hidden" name="pageBefore" value={location.before ?? ""} /></>;
}

export function RecordPagination({ scope, location, newer, older, count }: { scope: AdminRecordScope; location: RecordPageLocation; newer: string | null; older: string | null; count: number }) {
  const anchor = scope === "orders" ? "orders-list" : "service-list";
  return <nav aria-label={`${scope === "orders" ? "Order" : "Service record"} pages`} className="mt-5 flex flex-wrap items-center justify-between gap-3">
    <p className="text-xs text-muted">{count} {count === 1 ? "record" : "records"} on this page</p>
    <div className="flex flex-wrap gap-2">
      {(location.after || location.before) && <Link prefetch={false} href={`${recordPageHref(scope, {})}#${anchor}`} className={adminGhostButtonClass}>Latest records</Link>}
      {newer && <Link prefetch={false} href={`${recordPageHref(scope, { before: newer })}#${anchor}`} className={adminGhostButtonClass}>Newer records</Link>}
      {older && <Link prefetch={false} href={`${recordPageHref(scope, { after: older })}#${anchor}`} className={adminGhostButtonClass}>Older records</Link>}
    </div>
  </nav>;
}
