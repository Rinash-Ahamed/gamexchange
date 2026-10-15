# Gameexchange Session Notes

This file stores durable context between development sessions. Keep entries concise and update them when project decisions, completed work, blockers, or next steps change.

## Project

- Name: Gameexchange
- Status: New project
- Workspace: `C:\Users\rinas\Project\gamexchange`

## Current Session

- Created this session-notes file for continuity.
- Reviewed the existing application layout and framework structure.
- Applied a global clarity pass and added accessible smooth scrolling.
- Removed em dashes from all project-owned source, copy, metadata, comments, accessibility labels, and documentation.
- Removed downward and outer shadows from buttons and button-like controls.
- Allowed `unsafe-eval` in the development CSP only so React and Turbopack debugging work; production CSP remains unchanged.
- Tightened global page heroes, transition gates, section padding, content gaps, calls to action, product grids, and footer spacing.
- Removed all eyebrow labels and hero grid overlays.
- Added a four-message animated home headline with a moving gradient and removed the hero scroll guide.
- Added local-time theme scheduling (light from 6:00 AM to 5:59 PM, dark from 6:00 PM to 5:59 AM) with seamless boundary updates and persistent manual overrides.
- Allowed Next.js image qualities 75, 80, and 85 to match all current image components.
- Extended the moving gradient animation to every heading that uses gradient text.
- Replaced the old Game Zone CDN photos with four original local PNG gaming visuals.
- Added a protected single-admin login and operations dashboard.
- Added Firestore-backed inventory management and customer service record tracking through the server-only Firebase Admin SDK.
- Connected active, in-stock inventory to the public home shelf and Products page.
- Replaced the static “Heard from the lobby” review grid with a themed, accessible 3D vertical testimonial marquee based on the supplied reference.

## Existing Architecture

- Next.js 16 App Router with React 19, strict TypeScript, Tailwind CSS 4, Motion, and Zod.
- Shared root shell: theme bootstrapping, providers, fixed responsive navigation, page transitions, footer, and structured data.
- Routes: `/`, `/products`, `/exchange`, `/repair-service`, `/game-zone`, and `/contact`.
- API routes: `/api/enquiry` and `/api/enquiry/token`.
- Components are grouped by `layout`, `home`, `shop`, `zone`, `forms`, and reusable `ui` primitives.
- Business content is isolated in `src/data`; shared behavior and security utilities are in `src/lib`.
- Styling uses semantic dark/light theme tokens in `src/app/globals.css` with a blue/violet gaming aesthetic.
- Playwright covers desktop and mobile behavior, accessibility, security, calls to action, and theme behavior.

## Decisions

- Global clarity changes remain token-driven in `globals.css` so all routes inherit them consistently.
- Inertial scrolling runs only for fine pointers when reduced motion is not requested; touch and reduced-motion users retain native scrolling.
- Batch upcoming implementation changes without running lint, build, or tests after each change. Run the full validation suite only when the user explicitly asks for final checks.
- Admin credentials and the session signing secret come from environment variables. Development-only fallback credentials are shown on the login page.
- Operational data uses Cloud Firestore. Firebase Admin credentials stay server-side and are configured through environment variables.
- Inventory SKUs use a transactional Firestore index so duplicate SKUs cannot be created during concurrent requests.
- Destructive admin actions use an accessible themed in-app confirmation dialog instead of the browser confirmation popup.
- Theme changes use a single page-level View Transition instead of transitioning every DOM element, avoiding the previous repaint lag.
- Added a game-style first-session boot screen with a logo power-up, system statuses, progress sequence, accessible interaction locking, and reduced-motion handling.
- Combined theme and boot-session pre-paint logic into one bootstrap script to avoid Next.js client-rendered script warnings.

## Next Steps

- Create the Firebase project and Firestore database, then configure the values documented in `FIREBASE_SETUP.md`.
- Keep the legacy SQLite files until any records that matter have been migrated and verified in Firestore.
- Run typecheck, lint, build, and Playwright only when explicitly requested.

## Update Template

```md
### YYYY-MM-DD

- Completed:
- Decisions:
- Blockers:
- Next:
```
