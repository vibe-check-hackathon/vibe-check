---
name: VibeCheck Studio
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#c3c6d7'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#8d90a0'
  outline-variant: '#434655'
  surface-tint: '#b4c5ff'
  primary: '#b4c5ff'
  on-primary: '#002a78'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#0053db'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#ffb95f'
  on-tertiary: '#472a00'
  tertiary-container: '#996100'
  on-tertiary-container: '#ffeedd'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin: 40px
  container-max: 1440px
---

## Brand & Style

The design system is engineered for a premium, broadcast-grade AI interview experience. It leans heavily into a "Keynote" aesthetic—cinematic, dark, and highly professional. The interface stays out of the way of the content, using sophisticated glassmorphism and surgical precision in its details to evoke the feeling of a high-end production studio.

The target audience consists of professional creators, recruiters, and media tech experts who value focus, clarity, and reliability. The visual language is minimalist and functional, prioritizing high-legibility typography and restrained motion to convey a sense of calm authority.

## Colors

This design system utilizes a deep "near-black" canvas to maximize contrast and reduce eye strain during long interview sessions. 

- **Primary:** A single, high-fidelity Blue is used exclusively for primary actions and active interface states.
- **Surface & Depth:** Surfaces utilize a soft glass effect, layered over the deep background. All containers feature a 1px hairline border in a translucent white to define boundaries without adding visual bulk.
- **Semantic/Status:** Emerald Green is reserved strictly for "Live" or "Success" states, while Amber denotes system warnings or pending events.
- **Neutrals:** Grayscale values are weighted toward the dark end, with text utilizing high-contrast whites and soft grays to maintain a clear hierarchy.

## Typography

The system utilizes **Inter** for its neutral, highly legible, and "SF Pro-like" qualities. The typographic scale is designed for broadcast clarity:

- **Display & Headlines:** Large, bold, and slightly tightened letter-spacing for a modern, editorial feel.
- **Body Text:** Generous line-heights ensure readability for transcripts and interview notes.
- **Labels:** Uppercase styling with increased tracking is used for technical metadata and status indicators to differentiate them from conversational content.

## Layout & Spacing

The layout philosophy is built on a **Fluid Grid** with fixed maximum constraints, ensuring a cinematic widescreen experience on desktop.

- **Grid:** A 12-column system for desktop with 24px gutters. On mobile, this collapses to a single column with 16px side margins.
- **Rhythm:** An 8px linear scale (with 4px increments for tight components) governs all padding and margins. 
- **Air:** Significant whitespace is maintained between primary panels to reinforce the "studio" feel. Layouts should prioritize center-aligned content for primary interview focus.

## Elevation & Depth

Depth is conveyed through **Glassmorphism** and tonal layering rather than traditional drop shadows.

- **Base Layer:** The absolute background is a matte `#0d0d0d`.
- **Surface Layer:** Interactive panels use a semi-transparent `#1a1a19` with a `backdrop-filter: blur(20px)`.
- **Accents:** Depth is reinforced by a 1px top-down inner light (white @ 10%) that acts as a "rim light" for the components, simulating a physical broadcast console.
- **Focus:** Active elements may use a subtle outer glow of the primary blue to indicate focus without disrupting the flat hierarchy.

## Shapes

The design system uses a distinctive **18px border radius** (as represented by `rounded-xl` in this configuration) for all primary containers and glass cards. This radius creates a "friendly-pro" aesthetic, reminiscent of modern hardware interfaces. Smaller components like buttons and input fields follow a secondary 8px radius to maintain structural integrity.

## Components

### Buttons & Inputs
- **Primary Buttons:** Solid Blue (#2563eb) with white text. No gradients.
- **Ghost Buttons:** 1px hairline border with a subtle hover state that increases the backdrop-blur opacity.
- **Inputs:** Darker than the surface background, featuring a persistent hairline border that glows Blue on focus.

### Glass Cards
The signature component. 18px radius, frosted background, and internal padding of at least 24px. Used for interview panels, participant profiles, and AI insight modules.

### Status Pills
Compact, pill-shaped indicators for "LIVE" or "RECORDING". These use a high-contrast background (Emerald for Live) with a subtle pulse animation for active states.

### Data & Charts
- **Horizontal Range Charts:** Used for "Vibe" metrics or sentiment analysis. Use a thick track with a high-contrast indicator. Use the Orange-to-Blue spectrum for comparative data.
- **Data Tables:** Highly compact, no vertical borders. Horizontal rows are separated by 1px hairline dividers at 5% opacity.

### Navigation
Vertical rail on the left or a floating bottom bar, using glassmorphic blurs to stay distinct from the main canvas content.