# Growth Signal — Palette Specification

### VC–Founder Matching App · Core Brand Palette

_Prepared in the spirit of a Pantone color consultation. Hex values are the source of truth; Pantone references are nearest-match approximations for print/physical brand collateral._

---

## Palette Overview

| Swatch | Name             | Hex       | Nearest Pantone                    | RGB           | Role                |
| ------ | ---------------- | --------- | ---------------------------------- | ------------- | ------------------- |
| 🟩     | **Forest Green** | `#0B3D2E` | PANTONE 3435 C                     | 11, 61, 46    | Anchor / Depth      |
| 🟢     | **Emerald**      | `#10B981` | PANTONE 2416 C                     | 16, 185, 129  | Primary Action      |
| 🌿     | **Mint Tint**    | `#A7F3D0` | PANTONE 344 C                      | 167, 243, 208 | Breath / Surface    |
| ⬛     | **Charcoal**     | `#111827` | PANTONE 532 C                      | 17, 24, 39    | Typography / Ground |
| ⬜     | **Paper White**  | `#F9FAFB` | PANTONE 11-0601 TCX (Bright White) | 249, 250, 251 | Canvas              |

---

## Color-by-Color Annotations

### 1. Forest Green — `#0B3D2E`

> **Designer's note:** _This is your old-money green — the color of a banker's lamp and a hedge fund's leather chair. Notice the blue undertone (hue ~165°): it keeps the green from reading agricultural or organic-grocery. Reserve it. Use it for moments of institutional weight — footers, pitch-deck covers, the "verified investor" badge. If you flood the UI with it, the product starts to feel like a country club. Scarcity is what makes it feel expensive._

- **Temperature:** Cool, blue-leaning
- **Emotional register:** Legacy, discretion, permanence
- **Usage ratio:** ~10% of any given screen
- **Caution:** Never place body text in Forest Green on Charcoal — contrast ratio fails (1.5:1)

---

### 2. Emerald — `#10B981`

> **Designer's note:** _The hero. This sits in that rare band between "money green" and "startup green" — saturated enough to feel alive, desaturated enough to avoid crypto-scam energy. It is your semantic "yes": the match confirmation, the CTA button, the funding-milestone toast. Protect its meaning. If Emerald appears on decorative elements, it loses its power as a signal. One rule: when Emerald is on screen, it should mean something is going right._

- **Temperature:** Cool-neutral
- **Emotional register:** Growth, momentum, the green light
- **Usage ratio:** ~15–20%, action elements only
- **Accessibility:** ✅ Passes AA on Charcoal and Forest Green backgrounds; ⚠️ white text on Emerald is borderline (3.1:1) — use Charcoal text on Emerald buttons

---

### 3. Mint Tint — `#A7F3D0`

> **Designer's note:** _This is the palette's exhale. Every high-stakes product needs a place for the eye to rest, and Mint is yours — think of it as the linen inside the suit. Use it for selected states, subtle card backgrounds, chart fills, and empty states. It carries the brand's green DNA without demanding attention. Never use it for text or icons; at this lightness it exists to hold space, not to speak._

- **Temperature:** Cool, airy
- **Emotional register:** Calm, freshness, possibility
- **Usage ratio:** ~10–15%, surfaces and states only
- **Pairing:** Sings against Forest Green (12.2:1 contrast) — your premium combination

---

### 4. Charcoal — `#111827`

> **Designer's note:** _Resist the temptation to use pure black. This charcoal carries a whisper of blue-violet in its base — it's what makes the whole palette feel considered rather than defaulted. This is your typographic voice: every headline, every founder bio, every term-sheet number. In dark mode, it graduates from text color to canvas. It's the most-used and least-noticed color in the system, which is exactly the point._

- **Temperature:** Cool, blue-cast neutral
- **Emotional register:** Authority, seriousness, ink-on-paper credibility
- **Usage ratio:** All primary text; ~40% visual weight in dark mode
- **Accessibility:** ✅ 16.9:1 on Paper White — exemplary

---

### 5. Paper White — `#F9FAFB`

> **Designer's note:** _Not white — paper. That 2% gray shift is the difference between a screen that glares and a screen that invites. It softens the interface the way good stock softens a printed prospectus. Use it as your default canvas and let true white (`#FFFFFF`) exist only on elevated cards, so elevation reads through tone, not just shadow. Subtle, but users feel it even when they can't name it._

- **Temperature:** Neutral with a cool whisper
- **Emotional register:** Clarity, honesty, room to think
- **Usage ratio:** ~50–60%, dominant canvas
- **System tip:** Reserve `#FFFFFF` for modals/cards to create a two-tier surface hierarchy

---

## Compositional Guidance

**The 60-30-10 read:**

- **60%** — Paper White (canvas, negative space)
- **30%** — Charcoal (typography, structure) + Mint Tint (surfaces)
- **10%** — Emerald (action) + Forest Green (prestige moments)

**Signature pairings:**
| Combination | Mood | Where |
|---|---|---|
| Forest Green + Mint Tint | Heritage luxury | Marketing site, investor-facing views |
| Charcoal + Emerald | Modern fintech | Core app UI, CTAs |
| Paper White + Charcoal | Editorial trust | Profiles, long-form content |

**One professional warning:** Green palettes drift "eco/wellness" fast. What keeps this one in _capital_ territory is the Charcoal's dominance and the discipline of your Emerald usage. Hold that line.

---

_Palette family: Analogous green with achromatic anchors · Undertone consistency: cool throughout · WCAG audit recommended before dark-mode extension._
