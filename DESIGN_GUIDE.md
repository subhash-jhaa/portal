# Growmer design guide

Task 2 · Reviewed v0 direction · 13 October 2026

## Purpose and selected layouts

Employee self-service should make payroll and personal information easy to understand. Use the same emerald identity in both modes. Light mode uses pale neutral surfaces; dark mode uses neutral charcoal surfaces with emerald accents. Selected directions: split welcome for login, salary-first dashboard, identity sidebar for profile, and a readable payslip statement. The alternate layouts remain in /designs for comparison. The main routes render the selected screens with typed API/MSW data; /designs retains fixture-driven design comparisons. Task 3 provides live login and registration using the selected login frame.

## Colors and themes

Use semantic classes; never scatter emerald/gray literals through screens. Canonical palette: src/lib/design/palette.json; generated CSS: src/app/tokens.css; typed export: src/lib/design/tokens.ts. Run npm run sync:tokens after palette changes, then npm run check:tokens. next-themes supplies persistent light/dark/system appearance. Dark surfaces, cards, borders and secondary areas are neutral charcoal; emerald is reserved for primary actions, links, focus and selected navigation text.

| Role                   | Light             | Dark              |
| ---------------------- | ----------------- | ----------------- |
| Background / text      | #f6f9f8 / #172c25 | #101114 / #f1f3f5 |
| Card / text            | #ffffff / #172c25 | #191b20 / #f1f3f5 |
| Primary / on-primary   | #047857 / #ffffff | #34d399 / #062b21 |
| Muted / secondary text | #edf3f0 / #52655c | #202228 / #adb3be |
| Accent / text          | #e4f3eb / #065f46 | #252831 / #6ee7b7 |
| Border                 | #dbe6e0           | #33363f           |
| Input outline          | #b6c8bd           | #515762           |
| Error text             | #b91c1c           | #fca5a5           |

Core text/surface pairs are checked against 4.5:1 contrast. A red/green color must also have text or an icon explaining its meaning. Focus uses the primary ring with a visible outline. This is a design review, not a claim of a full accessibility audit.

## Typography, spacing, and shape

Use Arial, Helvetica, sans-serif without remote font dependencies. Body 14px/1.5, field text 16px on mobile, secondary text 12px/1.5; page headings 30px, section headings 18–20px. Weights 400, 500, 600. Use tabular numerals for money. Format INR consistently with en-IN; retain complete amounts on mobile.

Tailwind's base spacing token is 4px. Approved scale: 4, 8, 12, 16, 20, 24, 32, 40, 48px (1, 2, 3, 4, 5, 6, 8, 10, 12). Use 24px horizontal and 16–24px vertical card padding, 16–24px grids, and 32px section separation. Base radius 12px; cards 16px; small controls 8px. Avoid decorative shadows; rely on surface and border hierarchy. Stack columns below their content's usable width; earnings/deductions split at md.

## Components and interaction

- Buttons: project-owned shadcn Button; one main action per section, secondary outline, low-emphasis ghost. Default height 40px; icon controls need accessible names. Disabled actions explain why they are unavailable. Pending submit disables repeat submission.
- Forms: project-owned Input, persistent labels, appropriate email/password/tel types, visible focus. Keep entered values on errors. Password visibility is an actual labeled button. Login's empty state is a blank form, and loading keeps fields visible with a pending action.
- Cards: use the shared Panel/Card rather than one-off border styles. Separate headings from data. Avoid unsupported claims about security or who can view data.
- Tables: semantic table headers and rows; amount column right-aligned, tabular, with totals. Gross minus deductions must equal net. Banking data stays masked. Preserve content with responsive table overflow when necessary.
- Empty states: explain the specific missing record and the next step. Missing payroll is never displayed as zero pay. Missing optional profile fields keep known employment identity visible.
- Errors/loading: screen-specific alert and retry; layout-preserving skeletons or pending login button. Expose status with role=status and errors with role=alert. Retry in the gallery resets only the fixture state.
- Icons: Lucide only, 16–20px for actions, decorative icons aria-hidden; pair meaning with labels. Use initials for fictional identity; no real employee photos or records.

## Prototype boundaries

Preview screen/direction/state controls belong to the design gallery, not a production employee workflow. Gallery profile edits are local; main /profile edits PATCH the mock API; PDF download is disabled with an explanation; gallery login is a presentation preview; live /login authenticates and /register creates employee accounts. Fixture data and original-v0 provenance are documented in docs/designs. The main employee routes already use these tokens and lib/api. Replace MSW with the Python backend after reconciling the contract.

## My Documents

Use a compact semantic table for file metadata on desktop and labeled file cards on mobile. Sort updated dates newest first. Keep the heading and explanatory copy visible in normal/loading/empty/error states. Use file-row skeletons, a document-specific empty message with an HR next step, and an alert with retry for failures. File previews remain disabled and explicitly explained while only fake metadata exists. Both reviewed v0 options are preserved in /designs; see docs/designs/DOCUMENTS.md.
