import { Link, useRouterState } from "@tanstack/react-router";
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
  UserSquare,
} from "lucide-react";
import logo from "@/assets/vibecheck.svg.asset.json";

const NAV: { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean }[] = [
  { to: "/", label: "Pipeline", icon: LayoutDashboard, exact: true },
  { to: "/board", label: "Board", icon: Kanban },
  { to: "/applications", label: "Applications", icon: FileText },
  { to: "/interviews", label: "Live Interview", icon: Mic },
  { to: "/founder", label: "Founder Psychogram", icon: UserSquare },
  { to: "/memo", label: "Decision Memo", icon: ScrollText },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-border bg-sidebar">
          <div className="flex h-14 items-center gap-2 px-5 border-b border-sidebar-border">
            <img src={logo.url} alt="Maschmeyer Investment Group" className="h-6 w-6" />
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif text-[17px] leading-none tracking-tight text-sidebar-foreground">
                Maschmeyer
              </span>
              <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                Group
              </span>
            </div>
          </div>

          <div className="px-3 py-3">
            <div className="rounded-md border border-sidebar-border bg-background/50 px-2.5 py-2">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Fund
              </div>
              <div className="mt-0.5 flex items-center justify-between">
                <div className="text-sm font-medium">MIG Ventures III</div>
                <div className="text-[10px] text-muted-foreground">€320M</div>
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
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground")
                  }
                >
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mx-3 mb-3 rounded-md border border-sidebar-border bg-background/60 p-3">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-positive pulse-dot" />
              <div className="text-[11px] font-medium">1 memo due · 24h</div>
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground leading-snug">
              Acme Robotics awaiting IC · live interview in progress.
            </div>
          </div>

          <div className="border-t border-sidebar-border px-3 py-2.5 flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground grid place-items-center text-[11px] font-semibold">
              MK
            </div>
            <div className="min-w-0">
              <div className="text-[12px] font-medium truncate">Marlene Krüger</div>
              <div className="text-[10px] text-muted-foreground truncate">
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
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  className="w-full h-8 rounded-md border border-border bg-surface pl-8 pr-16 text-[13px] placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-ring"
                  placeholder="Search companies, founders, memos…"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] text-muted-foreground">
                  <kbd className="rounded border border-border bg-background px-1 py-0.5 flex items-center gap-0.5">
                    <Command className="h-2.5 w-2.5" /> K
                  </kbd>
                </div>
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
                <button className="h-8 rounded-md bg-primary px-3 text-[12px] font-medium text-primary-foreground hover:opacity-90">
                  New application
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
