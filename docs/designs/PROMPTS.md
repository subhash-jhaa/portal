# Task 2 — Design brief and generation prompts

Tool selected: v0. These per-screen prompts are the reproducible refinement prompts. The user supplied an exported v0 generation; its original prompt was absent from the ZIP and has now been recovered from the live v0 chat in ORIGINAL_PROMPT.md.

## Shared direction

Design Growmer as an employee self-service portal. Employees should be able to access their account, understand their work/payroll summary, review their profile, and inspect payslips. Preserve Task 1's emerald brand, project-owned shadcn/ui components, Lucide icons, light/dark themes, and responsive shell.

Use semantic tokens, restrained borders, clear hierarchy, visible keyboard focus, persistent labels, and readable contrast. Target desktop and 390px mobile. Four explicit states per screen: normal/success, loading, empty, and error. Distinguish missing data from a failed request. Avoid real employee or payroll data. These are design prototypes; authentication, profile persistence, and payroll downloads are future implementation work.

## Screen briefs

| Screen    | User                                  | Primary action                   | Displayed data                                                                                 |
| --------- | ------------------------------------- | -------------------------------- | ---------------------------------------------------------------------------------------------- |
| Login     | Employee accessing self-service       | Sign in                          | Company identity, work-email field, password field, recovery/help links                        |
| Dashboard | Signed-in employee                    | Review the latest payslip        | Employee name, role, current pay period, salary summary, pending profile action, announcements |
| Profile   | Employee maintaining personal details | Review/edit profile              | Name, employee ID, department, role, manager, work email, phone, joining date, completeness    |
| Payslip   | Employee checking monthly pay         | Review/download selected payslip | Period, employee identity, earnings, deductions, net pay, payment date, masked bank account    |

## Fake-data fixture

Aarav Mehta, employee GR-1042; Product Designer; Product & Design department; manager Neha Kapoor; aarav.mehta@example.com; phone +91 90000 01234 (fictional example); joining date 15 January 2024. September 2026 earnings: basic ₹45,000, HRA ₹18,000, special allowance ₹12,000; gross ₹75,000. Deductions: provident fund ₹5,400, professional tax ₹200, income tax ₹4,400; total ₹10,000. Net ₹65,000; paid 30 September 2026; account ending 4821. Amounts are illustrative fixtures, not tax advice or a calculated payroll entitlement.

## One generation prompt per screen

### Login prompt

Create two visually distinct options for Growmer employee login, using shadcn/ui and Lucide icons. Preserve emerald semantic brand tokens and a system sans-serif font. Option A: a split brand/story panel with a focused form. Option B: a centered card with minimal brand decoration. Include desktop and mobile layouts plus light/dark treatment. Show normal form, submitting/loading, empty initial form, and invalid-credentials/service-error states. Use a labeled work-email input and password input, a clearly dominant sign-in action, password visibility control, and recovery/help links. Explain why one option better supports employee access. Keep sample credentials fictional. Do not implement or imply secure authentication.

### Dashboard prompt

Create two options for Growmer employee dashboard using the existing shadcn/ui shell, emerald tokens, and Lucide icons. Option A: a salary-led summary with a latest-payslip card and secondary employee/profile information. Option B: an action-led layout with a compact summary rail and announcements. Use Aarav Mehta's fictional fixture and September 2026 net pay ₹65,000, gross ₹75,000, deductions ₹10,000. Generate normal, skeleton loading, no payroll/announcement data, and request-error states; errors must not appear as zero salary. Make View payslip the primary action. Show responsive layouts and explain the chosen hierarchy.

### Profile prompt

Create two Growmer employee-profile options with shadcn/ui and the shared theme. Option A: identity/completeness sidebar plus grouped personal and employment details. Option B: stacked section cards with a compact identity header. Use fictional Aarav Mehta/GR-1042 data. Generate normal, loading skeletons, missing optional details, and load/save-error states. Keep immutable employee fields visually distinct from editable contact fields. Use persistent field labels, explain errors beside fields, and provide clear edit/save/cancel affordances. Avoid fabricated saves or persistence. Include mobile and light/dark versions and justify a choice.

### Payslip prompt

Create two Growmer payslip options using shadcn/ui, Lucide icons, and emerald semantic tokens. Option A: a clean statement with an employee header, period selector, separate earnings/deductions tables, and prominent net pay. Option B: a month/history sidebar with a compact document preview. Use the exact fictional fixture totals: gross ₹75,000 minus ₹10,000 deductions equals ₹65,000 net. Generate normal, loading, no payslip for the selected month, and failed retrieval states. Include a clearly labeled download action but identify it as a prototype until real export exists. Mask banking details. Show desktop/mobile and light/dark variants; justify a choice.

## Planned review and handoff

For every screen: preserve both generated options; record selected option and reason; review hierarchy, component consistency, spacing, contrast, keyboard focus, labels, mobile layout, normal/loading/empty/error behavior, and data accuracy. Record concrete corrections and rerender the corrected pick. Do not mark reviews complete before examining the rendered output.

Deliver a screen/state/option gallery, the four corrected picks, a completed review matrix, realistic typed fixtures, DESIGN_GUIDE.md (roughly 1–2 pages), and one canonical theme-token source consumed by Tailwind. Maintain Task 1 API boundaries and the separate growmer-assignment Docker project. The designs will use explicit fixture-driven state controls; real login/security belongs to Task 3.
