# High-Contrast Terminal-Brutalist Pitch Deck Style Guide

## 1. Design Direction

Create a stark, technical, high-energy deck inspired by terminal interfaces and neo-brutalist print design.

Core characteristics:

- Near-black canvas
- Warm off-white text
- Neon-green accent
- Monospace typography
- Oversized, tightly tracked headings
- Hard borders and offset shadows
- Full-viewport slides
- Minimal decoration
- Strong geometric hierarchy
- No gradients, rounded corners, photographs, or soft shadows

---

## 2. Design Tokens

```css
:root {
  --black: #050505;
  --ink: #111111;
  --white: #f5f5ed;
  --muted: #a6aaa2;
  --green: #39ff14;
  --frame: #30332f;
  --surface: #0d0f0c;

  --border-accent: 3px solid var(--green);
  --border-card: 2px solid var(--white);

  --slide-padding: clamp(24px, 4vw, 64px);
  --content-width: 1500px;
}
```

### Color Rules

- Use `--black` for the page and card backgrounds.
- Use `--white` for primary text and neutral borders.
- Use `--green` selectively for emphasis, labels, numbers, markers, and active controls.
- Use `--surface` for inset emphasis panels.
- Use `--ink` only when text appears on a light or green background.
- Avoid introducing additional accent colors.

---

## 3. Typography

### Typeface

```css
font-family: "Courier New", Courier, monospace;
```

Use one monospace family throughout. Do not mix typefaces.

### Headings

```css
h1,
h2,
h3 {
  line-height: 0.96;
  text-transform: uppercase;
}

h1 {
  max-width: 1100px;
  margin-bottom: 24px;
  font-size: clamp(3.2rem, 8vw, 8.2rem);
  letter-spacing: -0.08em;
}

h2 {
  margin-bottom: 28px;
  font-size: clamp(2rem, 4vw, 4.6rem);
  letter-spacing: -0.055em;
}

h3 {
  margin-bottom: 14px;
  color: var(--green);
  font-size: clamp(1rem, 1.7vw, 1.45rem);
  letter-spacing: -0.025em;
}
```

### Body Copy

```css
p,
li,
td,
th {
  font-size: clamp(0.83rem, 1.15vw, 1.05rem);
  line-height: 1.45;
}

strong {
  color: var(--green);
}
```

### Typographic Rules

- Use uppercase for headings, labels, navigation, and compact captions.
- Keep body copy in sentence case.
- Use heavy weight for statements and labels.
- Use tight tracking only on large headings.
- Keep paragraph line lengths constrained.
- Highlight only essential words or phrases in green.
- Never use italics or decorative font effects.

---

## 4. Slide Architecture

Each slide is a semantic `<section>` occupying at least one viewport.

```html
<section class="slide" id="slide-N">
  <span class="slide-count">NN / TT</span>

  <div class="content">
    <div class="eyebrow">Section label</div>
    <h2>Short declarative heading.</h2>

    <!-- Modular components -->
  </div>
</section>
```

```css
html {
  scroll-behavior: smooth;
  scroll-snap-type: y mandatory;
}

body {
  margin: 0;
  background
```
