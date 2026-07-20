import { Checky } from "@/components/Checky";
import { FirstCheckLogo } from "@/components/FirstCheckLogo";
import { isPipelineRoute, PIPELINE_STAGES, PipelineStages } from "@/components/PipelineStages";
import { isInvestor, logout } from "@/lib/auth";
import { INVESTOR, STARTUP_USER, STARTUPS, type Startup } from "@/lib/data";
import { loadSyntheticStartups } from "@/lib/synthetic-opportunities";
import { useViewMode, type ViewMode } from "@/lib/view-mode";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  Check,
  ChevronDown,
  Command,
  CornerDownLeft,
  FileText,
  Kanban,
  LayoutDashboard,
  Search,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

/**
 * Top-level navigation only. The four pipeline stages (snapshot → founders →
 * interview → diligence) live in the horizontal stage bar, not here.
 */
type NavItem = { to: string; label: string; icon: LucideIcon; exact?: boolean };

const INVESTOR_NAV: NavItem[] = [
  { to: "/board", label: "Board", icon: Kanban },
  // Pipeline has no page of its own — it enters at the first stage.
  { to: PIPELINE_STAGES[0].to, label: "Pipeline", icon: LayoutDashboard, exact: true },
  { to: "/settings", label: "Settings", icon: Settings },
];

/** The startup side sees its own application, never the deal flow. */
const STARTUP_NAV: NavItem[] = [
  { to: "/apply", label: "Your application", icon: FileText },
  { to: "/settings", label: "Settings", icon: Settings },
];

const SECTORS = Array.from(new Set(STARTUPS.map((s) => s.sector))).sort();

export function AppShell({ children }: { children: React.ReactNode }) {
  /* Investor gate: the app is investor-only; logged-out visitors get the
   * public founder apply surface. Demo-grade (client flag), not security. */
  const [authed, setAuthed] = useState<boolean | null>(null);
  useEffect(() => {
    if (isInvestor()) setAuthed(true);
    else {
      setAuthed(false);
      window.location.hash = "/login";
    }
  }, []);
  /* The gate decides who you are; this toggle lets an authenticated investor
   * preview the startup side without logging out. */
  const { mode, setMode } = useViewMode();
  const NAV = mode === "investor" ? INVESTOR_NAV : STARTUP_NAV;
  const person = mode === "investor" ? INVESTOR : STARTUP_USER;
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const search = useRouterState({ select: (s) => s.location.search as { sector?: string } });
  const navigate = useNavigate();

  const [q, setQ] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [menu, setMenu] = useState<null | "bell" | "user" | "sectors">(null);
  const [synthetic, setSynthetic] = useState<Startup[]>([]);
  useEffect(() => {
    loadSyntheticStartups()
      .then(setSynthetic)
      .catch(() => {});
  }, []);

  // Global search covers every deal on the board — real cards, current
  // applications, outbound finds — and opens the full pipeline check for it.
  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    return [...STARTUPS, ...synthetic]
      .filter(
        (s) =>
          s.company.toLowerCase().includes(t) ||
          s.sector.toLowerCase().includes(t) ||
          s.founders.some((f) => f.name.toLowerCase().includes(t)),
      )
      .slice(0, 6);
  }, [q, synthetic]);

  const activeSector = search?.sector;

  /** Open the pipeline for this deal: the decision memo fills itself from the
   *  deal's evidence — the FirstCheck showcase, but for every company. */
  const go = (s: Startup) => {
    setQ("");
    setSearchOpen(false);
    navigate({ to: "/memo" as never, search: { deal: s.id } as never });
  };

  const pickSector = (sector?: string) => {
    setMenu(null);
    navigate({ to: "/board" as never, search: (sector ? { sector } : {}) as never });
  };

  if (authed !== true) {
    // Never a dead blank page: say what is happening and give a manual path
    // out in case the client-side redirect cannot fire (stale tab, JS error).
    return (
      <div className="min-h-screen bg-background text-foreground grid place-items-center px-4">
        <div className="text-center text-[13px] text-muted-foreground">
          <div>
            {authed === false ? "Investor login required — redirecting…" : "Checking access…"}
          </div>
          <a href="#/login" className="mt-2 inline-block text-primary hover:underline">
            Go to investor login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <div className="flex min-h-screen">
        {/* Sidebar — deep plum, gold accents */}
        <aside
          className="hidden md:flex w-60 shrink-0 flex-col border-r border-sidebar-border text-sidebar-foreground"
          style={{
            backgroundImage:
              "linear-gradient(180deg, var(--sidebar), color-mix(in srgb, var(--sidebar) 80%, #000))",
          }}
        >
          <div className="flex h-14 items-center gap-2 px-5 border-b border-sidebar-border">
            <FirstCheckLogo className="h-5 w-auto text-sidebar-foreground" />
          </div>

          {mode === "investor" && (
            <div className="px-3 py-3">
              <div className="rounded-md border border-sidebar-border bg-black/15 px-2.5 py-2">
                <div className="text-[10px] uppercase tracking-wider text-sidebar-foreground/55">
                  Fund
                </div>
                <div className="mt-0.5 flex items-center justify-between">
                  <div className="text-sm font-medium text-sidebar-foreground">
                    MIG Ventures III
                  </div>
                  <div className="text-[10px] text-sidebar-foreground/50">€320M</div>
                </div>
              </div>
            </div>
          )}

          <nav className="flex-1 px-2 space-y-0.5">
            {NAV.map((item) => {
              // Pipeline stays lit while you are inside any of its stages.
              const active = item.exact
                ? pathname === item.to || isPipelineRoute(pathname)
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
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-50 h-14 border-b border-border bg-background/85 backdrop-blur">
            <div className="h-full flex items-center gap-3 px-6">
              {/* Search */}
              <div className="relative flex-1 max-w-xl">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground z-10" />
                <input
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    setSearchOpen(true);
                  }}
                  onFocus={() => setSearchOpen(true)}
                  onBlur={() => setTimeout(() => setSearchOpen(false), 120)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setSearchOpen(false);
                      (e.target as HTMLInputElement).blur();
                    }
                    if (e.key === "Enter" && results[0]) go(results[0]);
                  }}
                  className="w-full h-8 rounded-md border border-border bg-surface pl-8 pr-16 text-[13px] placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-ring"
                  placeholder="Search companies, founders, sectors…"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] text-muted-foreground">
                  <kbd className="rounded border border-border bg-background px-1 py-0.5 flex items-center gap-0.5">
                    <Command className="h-2.5 w-2.5" /> K
                  </kbd>
                </div>
                {searchOpen && q.trim() && (
                  <div className="absolute left-0 right-0 top-10 rounded-lg border border-border bg-popover shadow-lg overflow-hidden z-50">
                    {results.length === 0 ? (
                      <div className="px-3 py-3 text-[12.5px] text-muted-foreground">
                        No matches for “{q}”.
                      </div>
                    ) : (
                      results.map((s) => (
                        <button
                          key={s.id}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => go(s)}
                          className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-surface transition-colors"
                        >
                          <div className="h-7 w-7 rounded-md bg-surface-2 grid place-items-center text-[11px] font-serif text-foreground/80 shrink-0">
                            {s.company.slice(0, 2)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-[12.5px] font-medium truncate">
                              {s.company}
                              {!s.assessed && (
                                <span className="ml-2 text-[10px] text-muted-foreground uppercase tracking-wider">
                                  public
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-muted-foreground truncate">
                              {s.sector} · {s.geography}
                            </div>
                          </div>
                          <span className="text-[10px] px-1.5 py-0.5 rounded border border-border text-muted-foreground shrink-0">
                            {s.stage}
                          </span>
                        </button>
                      ))
                    )}
                    <div className="flex items-center justify-between px-3 py-1.5 border-t border-border text-[10px] text-muted-foreground">
                      <span>
                        {results.length} result{results.length === 1 ? "" : "s"}
                      </span>
                      <span className="flex items-center gap-1">
                        <CornerDownLeft className="h-2.5 w-2.5" /> open
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* ml-auto keeps the profile block pinned to the top-right corner */}
              <div className="ml-auto hidden md:flex items-center gap-2">
                <button className="h-8 rounded-md border border-border bg-surface px-2.5 text-[12px] text-muted-foreground hover:text-foreground">
                  Q3 · 2026
                </button>

                {/* Sector filter */}
                <div className="relative">
                  <button
                    onClick={() => setMenu(menu === "sectors" ? null : "sectors")}
                    className={
                      "h-8 rounded-md border px-2.5 text-[12px] flex items-center gap-1.5 " +
                      (activeSector
                        ? "border-ring text-foreground bg-accent"
                        : "border-border bg-surface text-muted-foreground hover:text-foreground")
                    }
                  >
                    {activeSector ?? "All sectors"} <ChevronDown className="h-3 w-3" />
                  </button>
                  {menu === "sectors" && (
                    <div className="absolute right-0 top-10 w-56 rounded-lg border border-border bg-popover shadow-lg overflow-hidden z-50 py-1">
                      <MenuItem active={!activeSector} onClick={() => pickSector(undefined)}>
                        All sectors
                      </MenuItem>
                      {SECTORS.map((sec) => (
                        <MenuItem
                          key={sec}
                          active={activeSector === sec}
                          onClick={() => pickSector(sec)}
                        >
                          {sec}
                        </MenuItem>
                      ))}
                    </div>
                  )}
                </div>

                {/* Notifications (moved from sidebar) */}
                <div className="relative">
                  <button
                    onClick={() => setMenu(menu === "bell" ? null : "bell")}
                    className="relative h-8 w-8 rounded-md border border-border bg-surface grid place-items-center text-muted-foreground hover:text-foreground"
                  >
                    <Bell className="h-3.5 w-3.5" />
                    <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-teal ring-2 ring-background" />
                  </button>
                  {menu === "bell" && (
                    <div className="absolute right-0 top-10 w-72 rounded-lg border border-border bg-popover shadow-lg overflow-hidden z-50">
                      <div className="px-3 py-2 border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground">
                        Notifications
                      </div>
                      <button
                        onClick={() => {
                          setMenu(null);
                          navigate({ to: "/interviews" as never });
                        }}
                        className="w-full text-left px-3 py-2.5 hover:bg-surface transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-teal pulse-dot" />
                          <span className="text-[12.5px] font-medium">1 memo due · 24h</span>
                        </div>
                        <div className="mt-0.5 pl-3.5 text-[11.5px] text-muted-foreground leading-snug">
                          FirstCheck awaiting IC · live interview in progress.
                        </div>
                      </button>
                    </div>
                  )}
                </div>

                {/* One control, top-right: the active profile's photo IS the
                    role switcher. */}
                <div className="relative">
                  <button
                    onClick={() => setMenu(menu === "user" ? null : "user")}
                    aria-haspopup="listbox"
                    aria-expanded={menu === "user"}
                    className="flex items-center gap-2 h-8 rounded-md border border-border bg-surface pl-1 pr-2 hover:bg-accent transition-colors"
                  >
                    <Avatar person={person} />
                    <span className="hidden lg:block text-[12px] font-medium leading-none">
                      {person.name}
                    </span>
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  </button>
                  {menu === "user" && (
                    <div
                      role="listbox"
                      className="absolute right-0 top-10 w-64 rounded-lg border border-border bg-popover shadow-lg overflow-hidden z-50 py-1"
                    >
                      <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                        Switch profile
                      </div>
                      {PROFILES.map((o) => {
                        const active = o.id === mode;
                        return (
                          <button
                            key={o.id}
                            role="option"
                            aria-selected={active}
                            onClick={() => {
                              setMode(o.id);
                              setMenu(null);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-surface transition-colors"
                          >
                            <Avatar person={o.person} />
                            <span className="min-w-0 flex-1">
                              <span className="block text-[12.5px] font-medium">
                                {o.person.name}
                              </span>
                              <span className="block text-[11px] text-muted-foreground truncate">
                                {o.label} · {o.person.role}
                              </span>
                            </span>
                            {active && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                          </button>
                        );
                      })}
                      <div className="mt-1 border-t border-border pt-1">
                        <MenuItem
                          onClick={() => {
                            setMenu(null);
                            navigate({ to: "/settings" as never });
                          }}
                        >
                          Settings
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            void logout().then(() => {
                              window.location.hash = "/apply";
                            });
                          }}
                        >
                          Log out
                        </MenuItem>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          {mode === "investor" && isPipelineRoute(pathname) && <PipelineStages />}

          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>

      {/* click-away backdrop for header menus */}
      {menu && <div className="fixed inset-0 z-40" onClick={() => setMenu(null)} />}

      {/* Checky: evidence-grounded diligence assistant, investor-side only */}
      <Checky />
    </div>
  );
}

/** The two profiles the avatar control switches between. */
const PROFILES: { id: ViewMode; label: string; person: typeof INVESTOR }[] = [
  { id: "investor", label: "Investor", person: INVESTOR },
  { id: "startup", label: "Startup", person: STARTUP_USER },
];

/** Photo for whichever profile is active; initials until a photo is supplied. */
function Avatar({
  person,
}: {
  person: { name: string; initials: string; avatarUrl: string | null };
}) {
  if (person.avatarUrl) {
    return (
      <img src={person.avatarUrl} alt={person.name} className="h-6 w-6 rounded-full object-cover" />
    );
  }
  return (
    <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground grid place-items-center text-[10px] font-semibold">
      {person.initials}
    </span>
  );
}

function MenuItem({
  children,
  onClick,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between px-3 py-1.5 text-[12.5px] text-foreground hover:bg-surface transition-colors"
    >
      <span>{children}</span>
      {active && <Check className="h-3.5 w-3.5 text-primary" />}
    </button>
  );
}
