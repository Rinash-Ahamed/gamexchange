import { SectionHeading } from "@/components/ui/SectionHeading";
import { Glyph, glyphTint, type GlyphName } from "@/components/ui/Glyph";
import { ControllerButton } from "@/components/ui/ControllerButton";
import { Reveal } from "@/components/ui/Reveal";
import { site } from "@/data/site";

const steps: { glyph: GlyphName; title: string; body: string }[] = [
  { glyph: "x", title: "Choose your console", body: "Tell us what you’re trading in." },
  { glyph: "o", title: "Select its condition", body: "Be honest — the shop checks it in person." },
  { glyph: "tri", title: "Add the extras", body: "Controllers, cables, box, games." },
  { glyph: "sq", title: "Pick your upgrade", body: "PS5, PS4, PS3 or an accessory." },
];

export function TradeTeaser() {
  return (
    <section data-tone="violet" aria-labelledby="trade-h" className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <SectionHeading eyebrow="Trade-in & exchange" title={<span id="trade-h">Level up<br /><span className="text-gradient">your setup.</span></span>}>
            Swap your old console toward your next one. Send an enquiry in a minute — the shop confirms the offer after checking your device.
          </SectionHeading>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <ControllerButton href="/exchange" glyph="x" size="lg">Start trade-in</ControllerButton>
            <a href={site.sellFormUrl} target="_blank" rel="noopener noreferrer" className="py-3 text-sm text-muted underline-offset-4 hover:text-ink hover:underline">Prefer selling outright? Use the sell form</a>
          </div>
        </div>

        <ol className="grid gap-4 sm:grid-cols-2">
          {steps.map((s, i) => (
            <Reveal as="li" key={s.title} delay={i * 0.08} className="metal rounded-3xl p-6">
              <span className="grid size-11 place-items-center rounded-full border border-line-strong bg-surface" style={{ color: glyphTint[s.glyph] }}><Glyph name={s.glyph} className="size-5" /></span>
              <p className="mt-4 font-display text-xs font-semibold uppercase tracking-[0.25em] text-muted">Step {i + 1}</p>
              <h3 className="mt-1 font-display text-lg font-bold uppercase">{s.title}</h3>
              <p className="mt-1 text-sm text-muted">{s.body}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
