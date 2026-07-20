import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, Badge } from "@/components/ui-kit";
import { FirstCheckLogo } from "@/components/FirstCheckLogo";
import { LogIn, CheckCircle2, AlertTriangle, HelpCircle } from "lucide-react";
import { login, logout, founderInfo } from "@/lib/auth";

export const Route = createFileRoute("/founder-portal")({
  head: () => ({ meta: [{ title: "Your feedback · FirstCheck" }] }),
  component: FounderPortalPage,
});

type Hypothesis = { id: string; axis: string; text: string; basis: string; status: string };
type Founder = { id: string; name: string; email: string | null; hypotheses: Hypothesis[]; assessed: boolean };
type Feedback = {
  opportunityId: string;
  company: string | null;
  screening: { pass: boolean; hardFails: string[]; softFlags: string[] } | null;
  founders: Founder[];
  interviewFeedback: {
    matchedBy: string;
    card: string;
    founderScore: number | null;
    founderScoreConfidence: number | null;
    status: string | null;
  } | null;
};

function FounderPortalPage() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [authed, setAuthed] = useState(!!founderInfo());
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  async function loadFeedback() {
    const res = await fetch("/my-feedback", { credentials: "include" });
    if (res.ok) setFeedback((await res.json()) as Feedback);
  }

  async function submit() {
    setBusy(true);
    setError(null);
    const result = await login(email, pw);
    setBusy(false);
    if (!result.ok) {
      setError(result.error ?? "sign-in failed");
      return;
    }
    setAuthed(true);
    await loadFeedback();
  }

  if (authed && !feedback) void loadFeedback();

  if (!authed) {
    return (
      <div className="min-h-screen bg-background text-foreground grid place-items-center px-4">
        <Card className="w-full max-w-sm p-6">
          <FirstCheckLogo className="h-4 w-auto text-foreground" />
          <div className="mt-3 text-[16px] font-semibold">Your feedback</div>
          <p className="mt-1 text-[12.5px] text-muted-foreground">
            Sign in with the account shown when you applied — check your{" "}
            <Link to={"/apply" as never} className="text-primary hover:underline">
              application confirmation
            </Link>{" "}
            if you saved it.
          </p>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(null); }}
            placeholder="Email"
            className="mt-4 w-full rounded-md border border-border bg-card px-3 py-2 text-[13px] outline-none focus:border-ring"
          />
          <input
            type="password"
            value={pw}
            onChange={(e) => { setPw(e.target.value); setError(null); }}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Password"
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
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <FirstCheckLogo className="h-4 w-auto text-foreground" />
          <span className="text-[13px] text-muted-foreground">· your feedback</span>
        </div>
        <button
          onClick={() => { void logout().then(() => { setAuthed(false); setFeedback(null); }); }}
          className="text-[12px] text-muted-foreground hover:text-foreground"
        >
          Log out
        </button>
      </header>
      <div className="mx-auto max-w-2xl px-4 py-8 space-y-4">
        {!feedback ? (
          <p className="text-[12.5px] text-muted-foreground">Loading…</p>
        ) : (
          <>
            <Card className="p-5">
              <div className="flex items-center gap-2">
                {feedback.screening?.pass ? (
                  <CheckCircle2 className="h-4 w-4 text-positive" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-negative" />
                )}
                <span className="text-[13.5px] font-medium">{feedback.company ?? "Your application"}</span>
                <Badge tone="outline">{feedback.opportunityId}</Badge>
              </div>
              <p className="mt-2 text-[12.5px] text-muted-foreground">
                {feedback.screening?.pass
                  ? "Your application passed the canonical screen and is in the research funnel."
                  : "Your application was screened out — reasons below."}
              </p>
              {feedback.screening?.hardFails && feedback.screening.hardFails.length > 0 && (
                <ul className="mt-2 space-y-1 text-[12px] text-negative">
                  {feedback.screening.hardFails.map((f) => <li key={f}>· {f}</li>)}
                </ul>
              )}
            </Card>

            {feedback.interviewFeedback ? (
              <Card className="p-5">
                <div className="text-[13px] font-medium">Interview score</div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Matched to your application by {feedback.interviewFeedback.matchedBy}.
                </p>
                <div className="mt-3 flex gap-4">
                  <div>
                    <div className="text-[20px] font-semibold">{feedback.interviewFeedback.founderScore ?? "—"}</div>
                    <div className="text-[11px] text-muted-foreground">Founder Score</div>
                  </div>
                  <div>
                    <div className="text-[20px] font-semibold">
                      {feedback.interviewFeedback.founderScoreConfidence ?? "—"}
                    </div>
                    <div className="text-[11px] text-muted-foreground">Confidence</div>
                  </div>
                </div>
                <p className="mt-3 text-[11.5px] text-muted-foreground">
                  This score is a snapshot of your durable profile, not a probability of outcome — it
                  reflects the evidence gathered so far, and self-reported claims are credited at most 65%.
                </p>
              </Card>
            ) : (
              <Card className="p-5">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-[13px] font-medium">Areas your interview will explore</span>
                </div>
                <p className="mt-1 text-[11.5px] text-muted-foreground">
                  No interview has been scored yet — here are the open questions queued for it. Nothing
                  below is a score; each is unverified until the interview evidences it either way.
                </p>
                {feedback.founders.map((f) => (
                  <div key={f.id} className="mt-3 border-t border-border pt-3">
                    <div className="text-[12.5px] font-medium">{f.name}</div>
                    <ul className="mt-1 space-y-1.5">
                      {f.hypotheses.map((h) => (
                        <li key={h.id} className="text-[12px] text-muted-foreground">
                          <span className="font-medium text-foreground">{h.axis}:</span> {h.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
