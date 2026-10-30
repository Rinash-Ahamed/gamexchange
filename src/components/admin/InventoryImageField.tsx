"use client";

import { useEffect, useId, useState } from "react";
import { adminFileInputClass, adminLabelClass } from "./styles";

export function InventoryImageField({ src }: { src?: string }) {
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const hintId = useId();
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  return (
    <div className="sm:col-span-2 lg:col-span-4">
      <label><span className={adminLabelClass}>Product image</span>
        <input name="image" type="file" accept="image/jpeg,image/png,image/webp" required={!src}
          aria-describedby={hintId} className={adminFileInputClass} onChange={(event) => {
            const file = event.target.files?.[0];
            const invalid = !!file && (file.size > 5 * 1024 * 1024 || !["image/jpeg", "image/png", "image/webp"].includes(file.type));
            event.target.setCustomValidity(invalid ? "Choose a JPG, PNG or WebP under 5 MB." : "");
            setError(invalid ? "Choose a JPG, PNG or WebP under 5 MB." : "");
            setPreview(file && !invalid ? URL.createObjectURL(file) : "");
          }} />
      </label>
      <p id={hintId} className="mt-2 text-xs text-muted">JPG, PNG or WebP, max 5 MB. Use a portrait cover for games or a square product photo for hardware. Images are shown uncropped.{src ? " Leave unchanged to keep the current image." : ""}</p>
      {error && <p role="alert" className="mt-2 text-xs text-danger">{error}</p>}
      {(preview || src) && <div className="mt-3 flex h-32 w-40 items-center justify-center overflow-hidden rounded-lg border border-line-strong bg-surface p-2">
        {/* Native image supports local file previews and authenticated draft artwork. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={preview || src} alt="Product image preview" className="max-h-full max-w-full object-contain" />
      </div>}
    </div>
  );
}
