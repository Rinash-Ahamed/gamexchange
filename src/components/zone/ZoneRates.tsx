import type { ZoneStation } from "@/data/gamezone";

/** Shared hourly package rows for station cards. */
export function ZoneRates({ station }: { station: ZoneStation }) {
  return (
    <ul className="mt-6 space-y-3" aria-label={`${station.name} hourly packages`}>
      {station.sessions.map((session) => (
        <li key={session.players} className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-3">
          <span><span className="font-semibold">{session.label}</span><span className="mt-0.5 block text-xs text-muted">{session.players} {session.players === 1 ? "player" : "players"}</span></span>
          <span className="font-display text-2xl font-bold tabular-nums">₹{session.price}<span className="ml-1 text-sm font-normal text-muted">/hr</span></span>
        </li>
      ))}
    </ul>
  );
}
