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
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);

  function submit() {
    if (login(pw)) window.location.href = "/board"; // straight to the deal board, no extra hops
    else setError(true);
  }

  return (
    <div className="min-h-screen bg-background text-foreground grid place-items-center px-4">
      <Card className="w-full max-w-sm p-6">
        <div className="text-[16px] font-semibold">Investor login</div>
        <p className="mt-1 text-[12.5px] text-muted-foreground">
          The deal platform is investor-only. Founders don't need an account —{" "}
          <Link to={"/apply" as never} className="text-primary hover:underline">
            apply here
          </Link>
          .
        </p>
        <input
          type="password"
          value={pw}
          onChange={(e) => {
            setPw(e.target.value);
            setError(false);
          }}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Password (demo: growth-signal)"
          className="mt-4 w-full rounded-md border border-border bg-card px-3 py-2 text-[13px] outline-none focus:border-ring"
        />
        {error && <div className="mt-2 text-[12px] text-negative">Wrong password.</div>}
        <button
          onClick={submit}
          className="mt-3 h-9 w-full rounded-md bg-primary text-[12.5px] font-medium text-primary-foreground flex items-center justify-center gap-1.5"
        >
          <LogIn className="h-3.5 w-3.5" /> Sign in
        </button>
        <p className="mt-3 text-[10.5px] text-muted-foreground">
          Demo-grade gate for the hackathon — not real authentication.
        </p>
      </Card>
    </div>
  );
}
