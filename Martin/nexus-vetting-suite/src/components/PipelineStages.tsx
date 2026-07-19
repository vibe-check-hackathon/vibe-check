import { Link, useRouterState } from "@tanstack/react-router";
import { FileText, Users, Mic, ShieldCheck, ChevronRight, Check } from "lucide-react";

/**
 * The four pipeline stages, in the order a deal moves through them.
 * Company snapshot is the decision memo; due diligence carries the human
 * approval gate and the term sheet.
 */
export const PIPELINE_STAGES: {
  to: string;
  label: string;
  hint: string;
  icon: typeof FileText;
}[] = [
  { to: "/memo", label: "Company snapshot", hint: "Decision memo", icon: FileText },
  { to: "/founder", label: "Founder profiles", hint: "Psychogram · per founder", icon: Users },
  { to: "/interviews", label: "Agent interview", hint: "Hypothesis testing", icon: Mic },
  { to: "/diligence", label: "Due diligence", hint: "Approval gate · term sheet", icon: ShieldCheck },
];

export function isPipelineRoute(pathname: string) {
  return PIPELINE_STAGES.some((s) => pathname.startsWith(s.to));
}

export function PipelineStages() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const activeIndex = PIPELINE_STAGES.findIndex((s) => pathname.startsWith(s.to));

  return (
    <div className="sticky top-14 z-20 border-b border-border bg-background/85 backdrop-blur">
      <div className="flex items-center gap-1 overflow-x-auto px-6 py-2">
        {PIPELINE_STAGES.map((stage, i) => {
          const active = i === activeIndex;
          const done = activeIndex > -1 && i < activeIndex;
          const Icon = stage.icon;

          return (
            <div key={stage.to} className="flex items-center shrink-0">
              <Link
                to={stage.to as never}
                className={
                  "group flex items-center gap-2.5 rounded-md px-2.5 py-1.5 transition-colors " +
                  (active
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-surface hover:text-foreground")
                }
              >
                <span
                  className={
                    "grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[10px] font-medium transition-colors " +
                    (active
                      ? "border-primary bg-primary text-primary-foreground"
                      : done
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-border bg-surface text-muted-foreground")
                  }
                >
                  {done ? <Check className="h-3 w-3" strokeWidth={2.5} /> : <Icon className="h-3 w-3" strokeWidth={1.75} />}
                </span>
                <span className="flex flex-col leading-tight">
                  <span className={"text-[12.5px] " + (active ? "font-medium" : "")}>{stage.label}</span>
                  <span className="text-[10px] text-muted-foreground/70">{stage.hint}</span>
                </span>
              </Link>

              {i < PIPELINE_STAGES.length - 1 && (
                <ChevronRight className="mx-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
