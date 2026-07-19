# Color Guide — One Palette Across the Product

**Status: proposal doc only — nothing has been changed yet.** This maps Sun's
Growth Signal palette (`sun/color-palette.md`) onto Martin's Lovable/nexus app
(`Martin/nexus-vetting-suite/src/styles.css`) so the swap is mechanical when we
decide to apply it. Written from an Apple-HIG mindset: semantic tokens, one
accent that means something, tone before decoration.

## 1. The decision to make

The nexus app currently runs an **"Aubergine & Gold"** theme: muted purple
`#4A3A63` as primary, gold `#9B7C3C` accents, and plum-tinted grey text
(`#6F6678`). That is exactly the AI-startup-purple + sneaky-grey look
(Aleph-Alpha-style) we said we don't want:

- Purple-as-structure reads "generic AI product," not "capital allocation."
- Plum-grey body text is a contrast trap — grey that *looks* stylish and
  quietly fails readability on warm ivory surfaces.
- Two decorative accents (aubergine + gold) compete; neither carries meaning.

**Proposal: adopt Sun's Growth Signal palette everywhere** — deck, studio,
nexus. It was literally written for this product ("VC–Founder Matching App")
and the nexus app already had it once (commit `cee6601`) before the aubergine
restyle, so reverting is low-cost.

## 2. The palette (Sun's Growth Signal — source of truth)

| Token | Name | Hex | Role | Discipline |
|---|---|---|---|---|
| `forest` | Forest Green | `#0B3D2E` | Institutional weight: footers, verified badges, prestige moments | ~10% of any screen, never body text on charcoal (1.5:1 fails) |
| `emerald` | Emerald | `#10B981` | **The one accent.** CTAs, match confirmations, "something is going right" | 15–20%, action elements only; loses meaning if decorative |
| `mint` | Mint Tint | `#A7F3D0` | Selected states, card washes, chart fills, empty states | Surfaces only — never text or icons |
| `charcoal` | Charcoal | `#111827` | All primary text; dark-mode canvas | 16.9:1 on Paper White |
| `paper` | Paper White | `#F9FAFB` | Default canvas | True white `#FFFFFF` reserved for elevated cards — elevation through tone |

Composition: **60%** paper / **30%** charcoal + mint / **10%** emerald + forest.
Key contrast rule from Sun's audit: white text on Emerald is borderline (3.1:1)
— **use Charcoal text on Emerald buttons.**

## 3. Mechanical mapping for the nexus app (apply later)

Change only the `:root` values in `Martin/nexus-vetting-suite/src/styles.css`
(the Tailwind semantic layer above them stays untouched):

| CSS variable | Now (aubergine) | Becomes (Growth Signal) |
|---|---|---|
| `--background` | `#faf8f5` warm ivory | `#F9FAFB` paper |
| `--surface` / `--surface-2` | `#f3f0ea` / `#eae4db` | `#F3F4F6` / `#E5E7EB` (cool greys, same family as charcoal) |
| `--foreground` | `#241c30` plum-black | `#111827` charcoal |
| `--card` | `#ffffff` | `#FFFFFF` (unchanged — correct two-tier surface idea, keep it) |
| `--primary` | `#4a3a63` aubergine | `#0B3D2E` forest (structure = institutional green) |
| `--primary-foreground` | `#f7f2e9` cream | `#A7F3D0` mint (12.2:1 on forest — the premium pairing) |
| `--accent` (CTA) | `#ece3cd` soft gold | `#10B981` emerald, **with charcoal text** |
| `--teal` / `--teal-soft` (chips) | `#9b7c3c` gold / `#f1e8d3` | `#10B981` emerald / `#A7F3D0` mint |
| `--secondary` | `#efeaf1` faint lilac | `#ECFDF5` faint mint |
| `--muted-foreground` | `#6f6678` plum-grey ❌ | `#4B5563` neutral cool grey (real contrast, no purple cast) |
| `--destructive` | `#9b3b3b` wine | `#D03B3B` (keep a true red; wine drifts purple) |
| `--positive` / `--warning` / `--negative` | — | `#10B981` / `#B45309` amber-text / `#D03B3B` — status only, never decorative |

## 4. Dark mode (Growth Signal extension — Sun's doc flags this as TODO)

Charcoal graduates from ink to canvas, exactly as Sun's note anticipates:

| Token | Dark value | Note |
|---|---|---|
| canvas | `#0D1117` | charcoal family, near-black |
| surface / card | `#111827` / `#1A2332` | elevation through tone again |
| text primary | `#F9FAFB` paper | |
| text secondary | `#9CA3AF` | neutral grey — still no plum cast |
| forest → | `#134E3B` | one step lighter to hold on dark |
| emerald | `#10B981` (unchanged) | passes on charcoal per Sun's audit |
| mint | use at 10–15% opacity as washes | full mint glows too hard on dark |

## 5. Charts and data (unchanged)

The studio's data-visualization series colors stay on the **validated
colorblind-safe palette** already shipped in `laura/frontend/index.html`
(blue/green/amber, light + dark variants, CVD-checked). One caution when the
brand goes green: `emerald` is a *status/action* color — never use it as a
data-series color next to the series green, or "positive" and "series 2" become
indistinguishable. Chart greens stay `#008300`; emerald stays UI-only.

## 6. The avoid list (the whole point)

1. **No purple as structure** — aubergine, plum, violet, lilac washes. If a
   hue says "AI startup template," it's out.
2. **No tinted greys for text** — grey text must be neutral (`#4B5563` /
   `#9CA3AF`), never plum-, gold-, or green-tinted, and must pass 4.5:1.
3. **No second accent.** Gold is gone. Emerald is the only color allowed to
   mean something; forest is weight, not signal.
4. **No pure black, no pure-white canvas** — charcoal and paper, per Sun's
   notes; true white only on elevated cards.
5. **Green discipline** — the palette drifts "eco/wellness" fast; charcoal
   dominance and emerald scarcity are what keep it in capital territory
   (Sun's own warning, worth repeating in every review).

## 7. How to apply later (when we say go)

1. Nexus: swap the `:root` (+ `.dark`) values per §3–4 — one file, no
   component changes (the Tailwind semantic tokens absorb it).
2. Studio (`laura/frontend/index.html`): optional second step — map
   `--investor`-accent blue → emerald only if we want full brand unity;
   charts stay as-is either way.
3. Deck: Sun's terminal-brutalist deck keeps its own neon-green look — it's a
   stage artifact, not product UI; no change.
4. Re-run the contrast checks after the swap (validator for charts; 4.5:1 spot
   checks for text on mint/emerald surfaces).
