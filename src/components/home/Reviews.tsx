import { reviews } from "@/data/reviews";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

export function Reviews() {
  return (
    <section data-tone="blue" aria-labelledby="reviews-h" className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
      <SectionHeading title={<span id="reviews-h">Heard from<br /><span className="text-gradient">the lobby.</span></span>}>
        Reviews as shown on our current site. Tap one to read it on Google.
      </SectionHeading>
      <ul className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reviews.map((r, i) => (
          <Reveal as="li" key={r.name} delay={(i % 3) * 0.07}>
            <a href={r.href} target="_blank" rel="noopener noreferrer" className="metal group block h-full rounded-3xl p-6 transition-transform duration-300 hover:-translate-y-1">
              <blockquote className="text-lg leading-relaxed">“{r.text}”</blockquote>
              <p className="mt-5 font-display text-sm font-semibold uppercase tracking-[0.2em] text-accent-text">{r.name}</p>
            </a>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
