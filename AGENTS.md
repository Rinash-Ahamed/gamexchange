# GamexChange agent entry point

Project documentation and durable session context are stored in `.agent/`.

## Read before working

1. Read [.agent/SESSION.md](.agent/SESSION.md) for current state, decisions, pending work and verification limits.
2. Read [.agent/README.md](.agent/README.md) for the project overview and source map.
3. Read [.agent/FIREBASE_SETUP.md](.agent/FIREBASE_SETUP.md) for Firebase, authentication, inventory images or banner uploads.
4. Read [.agent/PERFORMANCE_AUDIT.md](.agent/PERFORMANCE_AUDIT.md) for performance work.

## Working conventions

- Keep project Markdown documentation under `.agent/`; keep this root entry point so agents can discover it. Do not move third-party or generated dependency documentation.
- Update `.agent/SESSION.md` after meaningful changes. Distinguish implemented behavior, recommendations, user-reported configuration and verified results.
- Preserve unrelated worktree changes. Never expose `.env.local`, private keys or customer records in output or documentation.
- Batch changes. Run build, lint and tests only when the user explicitly requests them, and report checks actually performed. Do not claim live Firebase or browser verification without doing it.
- Keep both themes, mobile layouts, reduced-motion behavior and application smoothness intact. Use consistent shared admin controls and confirmation dialogs for mutating admin actions.
- Every Next Image must use the shared `imageLoading` helper from `src/lib/image-loading.ts`: critical for the primary LCP image, visible for other above-fold or newly mounted visible images, deferred for below-fold images. Do not combine it with manual loading/priority/preload overrides. See `.agent/README.md` for the banner mounting policy and regression checks.
- Avoid em dashes in project copy and documentation.
- Commands and source paths in `.agent/` documentation refer to the repository root unless stated otherwise.
