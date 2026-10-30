"use client";

import { useId, useState } from "react";
import { ageRatingSuggestions, brandSuggestions, gameFormats, genreSuggestions, normalizePlatform, platformSuggestions, playModeChoices, productConditions, productSection, shopSections } from "@/data/catalog";
import type { InventoryItem } from "@/lib/admin/types";
import { adminInputClass, adminLabelClass } from "./styles";

export function InventoryCatalogFields({ item }: { item?: InventoryItem }) {
  const [section, setSection] = useState(productSection(item ?? { category: "Console" }));
  const id = useId();
  const condition = item?.condition ?? "Pre-Owned";
  return <>
    <label><span className={adminLabelClass}>Shop section</span><select name="shopSection" value={section} onChange={(event) => setSection(event.target.value as typeof section)} className={adminInputClass}>{shopSections.map((entry) => <option key={entry.id} value={entry.id}>{entry.label}</option>)}</select></label>
    <label><span className={adminLabelClass}>Platform</span><input name="platform" required maxLength={160} list={`${id}-platforms`} defaultValue={item ? normalizePlatform(item.platform) : ""} placeholder="e.g. PlayStation 5" className={adminInputClass} /><datalist id={`${id}-platforms`}>{platformSuggestions.map((platform) => <option key={platform} value={platform} />)}</datalist></label>
    <label><span className={adminLabelClass}>Condition</span><select name="condition" defaultValue={condition} className={adminInputClass}>{!productConditions.some((entry) => entry === condition) && <option value={condition}>{condition}</option>}{productConditions.map((entry) => <option key={entry} value={entry}>{entry}</option>)}</select></label>
    <label><span className={adminLabelClass}>Brand / publisher (optional)</span><input name="brand" maxLength={80} list={`${id}-brands`} defaultValue={item?.brand} placeholder="e.g. Sony, Nintendo, Ubisoft" className={adminInputClass} /><datalist id={`${id}-brands`}>{brandSuggestions.map((brand) => <option key={brand} value={brand} />)}</datalist></label>
    {section === "games" ? <>
      <label><span className={adminLabelClass}>Game genre (optional)</span><input name="genre" maxLength={80} list={`${id}-genres`} defaultValue={item?.genre} placeholder="e.g. Adventure" className={adminInputClass} /><datalist id={`${id}-genres`}>{genreSuggestions.map((genre) => <option key={genre} value={genre} />)}</datalist></label>
      <label><span className={adminLabelClass}>Game format (optional)</span><select name="format" defaultValue={item?.format ?? ""} className={adminInputClass}><option value="">Not specified</option>{gameFormats.map((format) => <option key={format} value={format}>{format}</option>)}</select></label>
      <label><span className={adminLabelClass}>Age rating (optional)</span><input name="ageRating" maxLength={40} list={`${id}-ratings`} defaultValue={item?.ageRating} placeholder="Copy the rating on the cover" className={adminInputClass} /><datalist id={`${id}-ratings`}>{ageRatingSuggestions.map((rating) => <option key={rating} value={rating} />)}</datalist></label>
      <label><span className={adminLabelClass}>Release year (optional)</span><input name="releaseYear" type="number" min="1970" max="2100" step="1" defaultValue={item?.releaseYear || ""} placeholder="e.g. 2026" className={adminInputClass} /></label>
      <fieldset className="sm:col-span-2"><legend className={adminLabelClass}>Player modes (optional, choose all supported)</legend><div className="flex flex-wrap gap-x-4 gap-y-1">{playModeChoices.map((mode) => <label key={mode} className="flex min-h-10 items-center gap-2 text-xs"><input type="checkbox" name="playModes" value={mode} defaultChecked={item?.playModes?.includes(mode)} className="size-4 accent-[var(--fill)]" />{mode}</label>)}</div></fieldset>
    </> : <><input type="hidden" name="genre" value="" /><input type="hidden" name="format" value="" /><input type="hidden" name="ageRating" value="" /><input type="hidden" name="releaseYear" value="" /></>}
    <label><span className={adminLabelClass}>Edition / model (optional)</span><input name="edition" maxLength={80} defaultValue={item?.edition} placeholder="e.g. Standard Edition, Slim" className={adminInputClass} /></label>
    <label className="sm:col-span-2 xl:col-span-4"><span className={adminLabelClass}>Product details (optional)</span><textarea name="description" rows={2} maxLength={1000} defaultValue={item?.description} placeholder="Included accessories, edition details or condition notes" className={`${adminInputClass} py-2`} /><span className="mt-1 block text-xs text-muted">Shown on this product's detail page. Include accurate condition and package contents.</span></label>
  </>;
}
