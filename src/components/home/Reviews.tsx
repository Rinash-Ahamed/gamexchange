import type { CSSProperties } from "react";
import { reviews } from "@/data/reviews";
import { SectionHeading } from "@/components/ui/SectionHeading";

const columns = [
  reviews.filter((_, index) => index % 2 === 0),
  reviews.filter((_, index) => index % 2 === 1),
] as const;

const timings = [
  { duration: 28, delay: -5, reverse: false },
  { duration: 32, delay: -14, reverse: true },
] as const;

function ReviewCard({ review, hidden = false }: { review: (typeof reviews)[number]; hidden?: boolean }) {
  return (
    <li className="review-float-card" aria-hidden={hidden || undefined}>
      <div className="block h-full p-5">
        <div className="flex items-center gap-3">
          <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full border border-line-strong bg-gradient-to-br from-fill to-fill-2 font-display text-sm font-bold text-accent-ink">
            {review.name.charAt(0)}
          </span>
          <span className="min-w-0">
            <span className="flex items-center gap-1.5 font-display text-sm font-semibold uppercase tracking-wide text-ink">
              <span className="truncate">{review.name}</span>
              <span aria-label="Verified review" className="grid size-4 shrink-0 place-items-center rounded-full bg-fill text-[9px] text-accent-ink">✓</span>
            </span>
            <span className="mt-0.5 block text-xs text-muted">{review.source} review</span>
          </span>
        </div>

        <blockquote className="mt-4 min-h-16 text-sm leading-relaxed text-muted">“{review.text}”</blockquote>

        <span className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
          <span>Verified player</span>
          <span aria-label="5 out of 5 stars" className="tracking-wider text-accent-text">★★★★★</span>
        </span>
      </div>
    </li>
  );
}

export function Reviews() {
  return (
    <section data-tone="blue" aria-labelledby="reviews-h" className="relative isolate overflow-hidden py-12 sm:py-16">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_78%_45%,color-mix(in_srgb,var(--accent-2)_15%,transparent),transparent_45%)]" />

      <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 sm:px-8 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)]">
        <div className="relative z-10">
          <SectionHeading title={<span id="reviews-h">Heard from<br /><span className="text-gradient">the lobby.</span></span>}>
            Real player feedback from our public reviews.
          </SectionHeading>
          <p className="mt-6 font-display text-sm font-semibold uppercase tracking-[0.18em] text-accent-text">Player-tested. Lobby-approved.</p>
        </div>

        <div className="review-marquee-scene" aria-label="Customer reviews">
          <div className="review-marquee-stage">
            {columns.map((column, columnIndex) => {
              const timing = timings[columnIndex];
              if (!timing) return null;
              const repeated = [...column, ...column];

              return (
                <div key={columnIndex} className="review-marquee-column">
                  <ul
                    className={`review-marquee-track ${timing.reverse ? "review-marquee-reverse" : ""}`}
                    style={{
                      "--review-duration": `${timing.duration}s`,
                      "--review-delay": `${timing.delay}s`,
                    } as CSSProperties}
                  >
                    {repeated.map((review, index) => (
                      <ReviewCard
                        key={`${columnIndex}-${review.name}-${index}`}
                        review={review}
                        hidden={index >= column.length}
                      />
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
