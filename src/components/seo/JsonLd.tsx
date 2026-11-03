import "server-only";

import { serializeJsonLd } from "@/lib/structured-data";

/** JSON-LD is an inert data block, not an executable next/script bootstrap. */
export function JsonLd({ id, data }: { id: string; data: unknown }) {
  return <script id={id} type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}
