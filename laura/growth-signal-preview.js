// Growth Signal palette — LIVE PREVIEW for Martin's nexus app.
// Paste the whole block into the browser DevTools console (F12) on
// http://localhost:8080 to see the proposed colors from laura/color-guide.md.
// Nothing is written to disk; refresh the page to go back to aubergine.
(v => Object.entries(v).forEach(([k, x]) => document.documentElement.style.setProperty(k, x)))({
  "--background": "#F9FAFB",          /* paper white canvas            */
  "--surface": "#F3F4F6",
  "--surface-2": "#E5E7EB",
  "--foreground": "#111827",          /* charcoal ink                  */
  "--card": "#FFFFFF",
  "--card-foreground": "#111827",
  "--popover": "#FFFFFF",
  "--popover-foreground": "#111827",
  "--primary": "#0B3D2E",             /* forest green = structure      */
  "--primary-foreground": "#A7F3D0",  /* mint on forest, 12.2:1        */
  "--teal": "#10B981",                /* emerald = the one accent      */
  "--teal-soft": "#A7F3D0",
  "--secondary": "#ECFDF5",
  "--secondary-foreground": "#0B3D2E",
  "--muted": "#F3F4F6",
  "--muted-foreground": "#4B5563",    /* neutral grey — no plum cast   */
  "--accent": "#10B981",
  "--accent-foreground": "#111827",   /* charcoal on emerald (3.1 trap)*/
  "--destructive": "#D03B3B",
  "--destructive-foreground": "#FFFFFF",
  "--border": "#E5E7EB",
  "--input": "#E5E7EB",
  "--ring": "#10B981",
  "--positive": "#10B981",
  "--warning": "#B45309",
  "--negative": "#D03B3B",
  "--sidebar": "#F3F4F6",
  "--sidebar-foreground": "#111827",
  "--sidebar-primary": "#0B3D2E",
  "--sidebar-primary-foreground": "#A7F3D0",
  "--sidebar-accent": "#ECFDF5",
  "--sidebar-accent-foreground": "#0B3D2E",
  "--sidebar-border": "#E5E7EB",
  "--sidebar-ring": "#10B981",
});
