import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  LayoutDashboard,
  Kanban,
  FileText,
  ScrollText,
  Settings,
  Search,
  Command,
  Bell,
  Mic,
  Plus,
  CornerDownLeft,
} from "lucide-react";
import logo from "@/assets/vibecheck.svg.asset.json";
import { STARTUPS } from "@/lib/data";

const NAV: { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean }[] = [
  { to: "/", label: "Pipeline", icon: LayoutDashboard, exact: true },
  { to: "/board", label: "Board", icon: Kanban },
  { to: "/applications", label: "Opportunity", icon: FileText },
  { to: "/interviews", label: "Live Interview", icon: Mic },
  { to: "/memo", label: "Decision Memo", icon: ScrollText },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    return STARTUPS.filter(
      (s) =>
        s.company.toLowerCase().includes(t) ||
        s.sector.toLowerCase().includes(t) ||
        s.founders.some((f) => f.toLowerCase().includes(t)),
    ).slice(0, 6);
  }, [q]);

  const go = (id: string, demo?: boolean) => {
    setQ("");
    setOpen(false);
    navigate({ to: (demo ? "/applications" : "/board") as never });
  };

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <div className="flex min-h-screen">
        {/* Sidebar — deep plum, gold accents */}
        <aside
          className="hidden md:flex w-60 shrink-0 flex-col border-r border-sidebar-border text-sidebar-foreground"
          style={{ backgroundImage: "linear-gradient(180deg, var(--sidebar), color-mix(in srgb, var(--sidebar) 80%, #000))" }}
        >
          <div className="flex h-14 items-center gap-2 px-5 border-b border-sidebar-border">
            <img src={logo.url} alt="Maschmeyer Investment Group" className="h-6 w-6" />
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif text-[17px] leading-none tracking-tight text-sidebar-foreground">
                Maschmeyer
              </span>
              <span className="text-[10px] uppercase tracking-[0.14em] text-sidebar-foreground/45">
                Group
              </span>
            </div>
          </div>

          <div className="px-3 py-3">
            <div className="rounded-md border border-sidebar-border bg-black/15 px-2.5 py-2">
              <div className="text-[10px] uppercase tracking-wider text-sidebar-foreground/55">
                Fund
              </div>
              <div className="mt-0.5 flex items-center justify-between">
                <div className="text-sm font-medium text-sidebar-foreground">MIG Ventures III</div>
                <div className="text-[10px] text-sidebar-foreground/50">€320M</div>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-2 space-y-0.5">
            {NAV.map((item) => {
              const active = item.exact
                ? pathname === item.to
                : pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to as never}
                  className={
                    "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] transition-colors " +
                    (active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "text-sidebar-foreground/75 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground")
                  }
                >
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mx-3 mb-3 rounded-md border border-sidebar-border bg-black/15 p-3">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-sidebar-primary pulse-dot" />
              <div className="text-[11px] font-medium text-sidebar-foreground">1 memo due · 24h</div>
            </div>
            <div className="mt-1 text-[11px] text-sidebar-foreground/60 leading-snug">
              Acme Robotics awaiting IC · live interview in progress.
            </div>
          </div>

          <div className="border-t border-sidebar-border px-3 py-2.5 flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-full bg-sidebar-primary text-sidebar-primary-foreground grid place-items-center text-[11px] font-semibold">
              MK
            </div>
            <div className="min-w-0">
              <div className="text-[12px] font-medium truncate text-sidebar-foreground">Marlene Krüger</div>
              <div className="text-[10px] text-sidebar-foreground/50 truncate">
                Partner · Screening lead
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-30 h-14 border-b border-border bg-background/85 backdrop-blur">
            <div className="h-full flex items-center gap-3 px-6">
              <div className="relative flex-1 max-w-xl">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground z-10" />
                <input
                  value={q}
                  onChange={(e) => { setQ(e.target.value); setOpen(true); }}
                  onFocus={() => setOpen(true)}
                  onBlur={() => setTimeout(() => setOpen(false), 120)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") { setOpen(false); (e.target as HTMLInputElement).blur(); }
                    if (e.key === "Enter" && results[0]) go(results[0].id, results[0].demo);
                  }}
                  className="w-full h-8 rounded-md border border-border bg-surface pl-8 pr-16 text-[13px] placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-ring"
                  placeholder="Search companies, founders, sectors…"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] text-muted-foreground">
                  <kbd className="rounded border border-border bg-background px-1 py-0.5 flex items-center gap-0.5">
                    <Command className="h-2.5 w-2.5" /> K
                  </kbd>
                </div>

                {open && q.trim() && (
                  <div className="absolute left-0 right-0 top-10 rounded-lg border border-border bg-popover shadow-lg overflow-hidden z-50">
                    {results.length === 0 ? (
                      <div className="px-3 py-3 text-[12.5px] text-muted-foreground">No matches for “{q}”.</div>
                    ) : (
                      results.map((s) => (
                        <button
                          key={s.id}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => go(s.id, s.demo)}
                          className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-surface transition-colors"
                        >
                          <div className="h-7 w-7 rounded-md bg-surface-2 grid place-items-center text-[11px] font-serif text-foreground/80 shrink-0">
                            {s.company.slice(0, 2)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-[12.5px] font-medium truncate">
                              {s.company}
                              {!s.assessed && <span className="ml-2 text-[10px] text-muted-foreground uppercase tracking-wider">public</span>}
                            </div>
                            <div className="text-[11px] text-muted-foreground truncate">{s.sector} · {s.geography}</div>
                          </div>
                          <span className="text-[10px] px-1.5 py-0.5 rounded border border-border text-muted-foreground shrink-0">{s.stage}</span>
                        </button>
                      ))
                    )}
                    <div className="flex items-center justify-between px-3 py-1.5 border-t border-border text-[10px] text-muted-foreground">
                      <span>{results.length} result{results.length === 1 ? "" : "s"}</span>
                      <span className="flex items-center gap-1"><CornerDownLeft className="h-2.5 w-2.5" /> open</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="hidden md:flex items-center gap-2">
                <button className="h-8 rounded-md border border-border bg-surface px-2.5 text-[12px] text-muted-foreground hover:text-foreground">
                  Q3 · 2026
                </button>
                <button className="h-8 rounded-md border border-border bg-surface px-2.5 text-[12px] text-muted-foreground hover:text-foreground">
                  All sectors
                </button>
                <button className="h-8 w-8 rounded-md border border-border bg-surface grid place-items-center text-muted-foreground hover:text-foreground">
                  <Bell className="h-3.5 w-3.5" />
                </button>
                <button className="h-8 rounded-md bg-primary px-3 text-[12px] font-medium text-primary-foreground hover:opacity-90 flex items-center gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> Add opportunity
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
