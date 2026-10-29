import type { AdminFaq } from "@/lib/admin/faqs";
import { adminInputClass, adminLabelClass } from "./styles";

export function FaqFields({ faq, nextPosition = 1 }: { faq?: AdminFaq; nextPosition?: number }) {
  return (
    <>
      {faq && <input type="hidden" name="id" value={faq.id} />}
      <label className="sm:col-span-2"><span className={adminLabelClass}>Question</span><input name="q" required minLength={3} maxLength={200} defaultValue={faq?.q} className={adminInputClass} /></label>
      <label className="sm:col-span-2"><span className={adminLabelClass}>Answer</span><textarea name="a" required minLength={3} maxLength={6000} rows={7} defaultValue={faq?.a} className={`${adminInputClass} py-2`} /></label>
      <label><span className={adminLabelClass}>Display order</span><input name="position" type="number" required min={1} max={999} defaultValue={faq?.position ?? nextPosition} className={adminInputClass} /></label>
      <label><span className={adminLabelClass}>Visibility</span><select name="status" defaultValue={faq?.status ?? "draft"} className={adminInputClass}><option value="draft">Draft</option><option value="published">Published</option></select></label>
    </>
  );
}
