import { SectionHeading } from "@/components/ui/SectionHeading";
import { Glyph, glyphTint, type GlyphName } from "@/components/ui/Glyph";
import { ControllerButton } from "@/components/ui/ControllerButton";
import { Reveal } from "@/components/ui/Reveal";

const steps: { glyph: GlyphName; title: string; body: string }[] = [
  { glyph: "x", title: "Choose your console", body: "Tell us what you’re trading in." },
  { glyph: "o", title: "Select its condition", body: "Be honest. The shop checks it in person." },
  { glyph: "tri", title: "Add the extras", body: "Controllers, cables, box, games." },
  { glyph: "play", title: "Sell or upgrade", body: "Sell for cash, or choose a console or accessory to upgrade to." },
];

export function TradeTeaser() {
  return (
    <section data-tone="violet" aria-labelledby="trade-h" className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
      <div className="grid items-center gap-8 lg:grid-cols-2">
        <div>
          <SectionHeading title={<span id="trade-h">Level up<br /><span className="text-gradient">your setup.</span></span>}>
            Sell your console for cash or trade it toward your next one. The shop confirms the offer after checking your device.
          </SectionHeading>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <ControllerButton href="/exchange" glyph="play" size="lg">Sell or exchange</ControllerButton>
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
