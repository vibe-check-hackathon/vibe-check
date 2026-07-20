import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui-kit";
import { LogIn } from "lucide-react";
import { login } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Investor login · FirstCheck" }] }),
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("investor@firstcheck.demo");
  const [pw, setPw] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    setError(null);
    const result = await login(email, pw);
    setBusy(false);
    if (result.ok) window.location.hash = "/board";
    else setError(result.error ?? "sign-in failed");
  }

  return (
    <div className="min-h-screen bg-background text-foreground grid place-items-center px-4">
      <Card className="w-full max-w-sm p-6">
        <div className="text-[16px] font-semibold">Investor login</div>
        <p className="mt-1 text-[12.5px] text-muted-foreground">
          The deal platform is investor-only. Founders get their own account when they{" "}
          <Link to={"/apply" as never} className="text-primary hover:underline">
            apply
          </Link>{" "}
          — see your{" "}
          <Link to={"/founder-portal" as never} className="text-primary hover:underline">
            feedback portal
          </Link>
          .
        </p>
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError(null);
          }}
          placeholder="Email"
          className="mt-4 w-full rounded-md border border-border bg-card px-3 py-2 text-[13px] outline-none focus:border-ring"
        />
        <input
          type="password"
          value={pw}
          onChange={(e) => {
            setPw(e.target.value);
            setError(null);
          }}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Password (demo: growth-signal)"
          className="mt-2 w-full rounded-md border border-border bg-card px-3 py-2 text-[13px] outline-none focus:border-ring"
        />
        {error && <div className="mt-2 text-[12px] text-negative">{error}</div>}
        <button
          onClick={submit}
          disabled={busy}
          className="mt-3 h-9 w-full rounded-md bg-primary text-[12.5px] font-medium text-primary-foreground flex items-center justify-center gap-1.5 disabled:opacity-60"
        >
          <LogIn className="h-3.5 w-3.5" /> Sign in
        </button>
        <p className="mt-3 text-[10.5px] text-muted-foreground">
          Frontend-only demo session stored in this browser. This is not authentication and must not protect real data.
        </p>
      </Card>
    </div>
  );
}
