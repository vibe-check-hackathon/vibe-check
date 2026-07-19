import { ChevronRight } from "lucide-react";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  crumbs,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  crumbs?: string[];
}) {
  return (
    <div className="border-b border-border bg-surface/60">
      <div className="px-8 py-6">
        {crumbs && crumbs.length > 0 && (
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground mb-2">
            {crumbs.map((c, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="h-3 w-3" />}
                <span>{c}</span>
              </span>
            ))}
          </div>
        )}
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div className="min-w-0">
            {eyebrow && (
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1.5">
                {eyebrow}
              </div>
            )}
            <h1 className="font-serif text-[32px] leading-[1.1] tracking-tight text-foreground text-balance">
              {title}
            </h1>
            {description && (
              <p className="mt-2 text-[13px] text-muted-foreground max-w-2xl leading-relaxed">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </div>
    </div>
  );
}

export function Section({
  title,
  meta,
  children,
  className = "",
}: {
  title?: string;
  meta?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={"px-8 py-6 " + className}>
      {title && (
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground font-medium">
            {title}
          </h2>
          {meta && <div className="text-[11px] text-muted-foreground">{meta}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

export function Card({
  children,
  className = "",
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={
        "rounded-lg border border-border bg-card shadow-[0_1px_0_rgba(0,0,0,0.02),0_1px_2px_rgba(15,23,42,0.03)] " +
        className
      }
    >
      {children}
    </div>
  );
}

export function Stat({
  label,
  value,
  hint,
  trend,
}: {
  label: string;
  value: string | number;
  hint?: string;
  trend?: string;
}) {
  return (
    <Card className="p-4">
      <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1.5 flex items-baseline gap-2">
        <div className="font-serif text-[28px] leading-none tracking-tight">
          {value}
        </div>
        {trend && <div className="text-[11px] text-positive">{trend}</div>}
      </div>
      {hint && (
        <div className="mt-1.5 text-[11px] text-muted-foreground">{hint}</div>
      )}
    </Card>
  );
}

export function ScoreBar({ value, label }: { value: number; label: string }) {
  const tone =
    value >= 80
      ? "bg-positive"
      : value >= 65
        ? "bg-primary"
        : value >= 50
          ? "bg-warning"
          : "bg-negative";
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <div className="text-[11px] text-muted-foreground">{label}</div>
        <div className="text-[12px] font-mono tabular-nums">{value}</div>
      </div>
      <div className="h-1 rounded-full bg-muted overflow-hidden">
        <div className={"h-full " + tone} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
  className = "",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "positive" | "warning" | "negative" | "teal" | "outline";
  className?: string;
}) {
  const map: Record<string, string> = {
    neutral: "bg-muted text-muted-foreground",
    positive: "bg-positive/12 text-positive",
    warning: "bg-warning/15 text-[oklch(0.45_0.14_75)]",
    negative: "bg-negative/12 text-negative",
    teal: "bg-teal-soft text-primary",
    outline: "border border-border text-muted-foreground",
  };
  return (
    <span
      className={
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10.5px] font-medium tracking-wide " +
        map[tone] +
        " " +
        className
      }
    >
      {children}
    </span>
  );
}

export function EvidencePill({
  label,
  verified,
}: {
  label: string;
  verified?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2 py-1 text-[11px] text-foreground">
      <span
        className={
          "h-1.5 w-1.5 rounded-full " +
          (verified ? "bg-positive" : "bg-warning")
        }
      />
      {label}
    </span>
  );
}
