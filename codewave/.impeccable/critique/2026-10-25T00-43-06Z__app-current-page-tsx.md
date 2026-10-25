---
target: CODEWAVE 2026 landing
total_score: 22
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 2
target_identity: "file:C:\\Users\\baris\\Desktop\\ktucec\\codewave\\app\\(current)\\page.tsx"
target_fingerprint: "sha256:ea7206fc7947ceef9db21f644f583274bfce668dd8524e37725d176b78d13e07"
target_path: "C:\\Users\\baris\\Desktop\\ktucec\\codewave\\app\\(current)\\page.tsx"
timestamp: 2026-10-25T00-43-06Z
slug: app-current-page-tsx
---
# Critique: CODEWAVE 2026 landing (/)
Method: dual-agent (A: design review · B: detector + browser overlay)

## Design Health Score
| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 2 | Closed-sales state only signalled by a disabled, unfocusable button |
| 2 | Match System / Real World | 3 | Unlabelled sponsorship phone in venue rows |
| 3 | User Control and Freedom | 3 | No section nav on phones |
| 4 | Consistency and Standards | 3 | "Bilet al" promised a purchase the page could not complete |
| 5 | Error Prevention | 2 | Users could fill the whole form before hitting the dead end |
| 6 | Recognition Rather Than Recall | 3 | Closed note ~800px above its button on mobile |
| 7 | Flexibility and Efficiency | n/a | Single-purpose Persuade page |
| 8 | Aesthetic and Minimalist Design | 3 | Date repeated 5×; hazy 635px photo |
| 9 | Error Recovery | 3 | Strong field recovery; invalid-link page only offers email |
| 10 | Help and Documentation | n/a | Landing page |
| **Total** | | **22/32** | Acceptable |

## Design Specificity Verdict
Authored for the subject: waterline title through "2026", two-ink discipline, passenger-manifest speakers with an empty sixth seat, tear-off stub. Weaker: About block, Destination photo, monogram tiles.
Deterministic scan: markup 0 findings; URL scans 2 (hero low-contrast = false positive, clipped white copy only over band; /bilet/sonuc unstyled = true positive, since fixed).

## Priority Issues
1. [P1] Closed-sales dead end (CTAs promise purchase, form editable, disabled submit unfocusable, note mismatch).
2. [P1] Speakers ~2.7 screens down on phones.
3. [P2] Destination photo hazy vs alt text; too tall on phones.
4. [P2] Unlabelled sponsorship phone presented as general contact; date row repeat.
5. [P2] Touch targets in footer; placeholder portraits and footer h2 add screen-reader noise.

## Persona Red Flags
Student on phone: dead-end form. Sponsor: no early sponsor path. Screen reader: disabled button unfocusable; 5 redundant "photo coming soon" announcements.

## Minor
Price hedge vs firm price; speaker roles wrap unevenly on mobile; title overran gutter ~5px at 390; desktop hero labels small; invalid-link page needs a "nothing to do if you didn't pay" line.
