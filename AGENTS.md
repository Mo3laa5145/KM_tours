# KM Tours

Egypt tourism booking site in Arabic, English, French, and German. React 19, Vite 8, Tailwind 4, Supabase. Live on Vercel. Booking has no online payment. Work on a branch and open a PR.

## Where things are
- `src/pages/`: public pages; `src/components/`: shared UI
- `src/components/BookingForm.tsx`: booking request form
- `src/admin/`: dashboard at `/#/admin`
- `src/lib/translations.ts`: interface text in all languages
- `src/lib/i18n.tsx`: language, direction, number and date formatting
- `src/lib/catalog.ts`, `catalogContext.tsx`, `staticCatalog.ts`: trip data
- `src/lib/router.ts`: hash routing
- `supabase/schema.sql`: database, security rules, server-side pricing
- `SETUP-AR.md`: setup steps

## Large content
Do not read `src/data.ts`, `src/content/trips.*.json`, or `supabase/seed*.sql` whole. Use `rg -n 'term' <file>`, then read that line range.

## Commands
- `pnpm build`
- `pnpm exec tsc --noEmit`

## Rules
- Reply in Arabic when the user writes in Arabic.
- Styling uses Tailwind utilities. Prefer `ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`, `text-start`, and `text-end`.
- Inputs inside flex rows need `min-w-0`.
- No `letter-spacing` on Arabic text.
- Any new interface text must be added in all four languages.
- After layout changes, check Arabic at 360 px for horizontal scroll.
- Do not add a dependency when existing code covers the need.
- Do not guess APIs, flags, or package names; check the code or docs.
- A change is finished only after `pnpm build` passes.
