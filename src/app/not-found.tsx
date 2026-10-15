import { ControllerButton } from "@/components/ui/ControllerButton";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-5 text-center">
      <div>
        <p className="font-display text-sm font-semibold uppercase tracking-[0.3em] text-accent-text">Error 404</p>
        <h1 className="mt-3 font-display text-6xl font-bold uppercase leading-none sm:text-8xl">Game over?<br /><span className="text-gradient">Not yet.</span></h1>
        <p className="mx-auto mt-5 max-w-md text-muted">That page doesn’t exist. Head back to the main menu.</p>
        <div className="mt-8 flex justify-center">
          <ControllerButton href="/" glyph="o">Go back</ControllerButton>
        </div>
      </div>
    </main>
  );
}
