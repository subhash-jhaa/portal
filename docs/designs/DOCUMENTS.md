# My Documents — AI design and review

User: signed-in employee. Main action: review their own fictional HR files. Data: name, category, file type, size, updated date. No real file contents, upload or download.

Tool: v0 Mini in the existing Growmer chat, https://v0.app/subhash-jhaa/chat/growmer-portal-design-c6OjS4xHxc3. A new prompt was submitted at 4:27 PM on 13 October 2026. v0 added the fifth screen with two actual options, preserving the original four. The implementation below was authored from the reviewed design and shared component interfaces, without copying the old screen implementations.

## Prompt submitted

Design a NEW screen called My Documents for Growmer employee self-service, without copying the existing screen code. User: a signed-in employee. Main action: review their own fictional HR files. Data: file name, category, type, size, updated date; examples Employment confirmation.pdf (Employment, PDF, 184 KB, 3 October 2026), Benefits handbook.pdf (Policies, PDF, 1.2 MB, 8 October 2026), Training certificate.pdf (Learning, PDF, 420 KB, 10 October 2026). Use emerald semantic tokens, shadcn/ui Button/Card/Table/Badge/Skeleton, Lucide icons, system sans, 4px spacing, desktop and 390px mobile, light/dark. Generate TWO genuinely distinct options: A a compact semantic table; B grouped file cards. Show normal, loading skeleton, empty with helpful next step, and error with Try again. Keep preview option/state controls outside employee content. Files are fictional metadata only: no upload, real download, backend or authentication implementation. Do not imply a download works; say preview only. Recommend one option with a reason and review spacing, hierarchy, contrast, labels, keyboard focus, mobile overflow and all four states. Preserve the current four screen prototypes and add a documents navigation item.

## Selection and corrections

Selected compact table: faster metadata comparison across files. Alternative file cards remain in /designs. The selected live screen switches to cards on narrow screens so field text stays readable.

| Review        | Correction / evidence                                                                                                                            |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Ordering      | v0 said recently updated but listed oldest first. Mock API now sorts newest first.                                                               |
| States        | v0 used generic empty/error wording and hid the heading during loading. Added document-specific messages and retained the heading in all states. |
| Skeleton      | Route loading boundary plus file-row skeletons show immediately; request loading uses the same layout.                                           |
| Consistency   | Project-owned Table/Card/Button/Badge/Skeleton and semantic theme tokens; Lucide icons only.                                                     |
| Accessibility | Named preview buttons, descriptive labels, table headers/caption, status and alert roles; disabled previews explain why they are unavailable.    |
| Mobile        | Selected view uses stacked metadata cards below md; check overflow at 390 px.                                                                    |
| Privacy       | API derives owner from verified session; caller cannot choose another employee's documents.                                                      |

Visual verification results are recorded in ../PHASE_1_REVIEW.md. The original v0 artifact remains accessible in the linked chat. The local gallery is a reviewed adaptation, not a second independent generation.

Final review passed: visually inspected normal table, alternative cards, loading, empty, error and mobile dark screenshots. Browser tests verify all states, retry, owner isolation and no mobile page overflow. See [Phase 1 review](../PHASE_1_REVIEW.md) for completed results. Inspect both layouts and all four states in `/designs`; optional screenshots are generated locally by the browser tests.
