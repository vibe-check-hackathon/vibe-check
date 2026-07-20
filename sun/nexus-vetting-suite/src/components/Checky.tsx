import { STARTUPS } from "@/lib/data";
import { MessageCircleQuestion, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/*
 * Checky — the diligence assistant. Floating chat over every investor page:
 * local lookup over the bundled opportunity records. The static build never
 * asks for provider credentials because browser code cannot keep them secret.
 */

type Msg = { role: "user" | "assistant"; content: string; retrieved?: string[] };

const HELLO: Msg = {
  role: "assistant",
  content:
    "I'm Checky in local demo mode. Ask me to check a company in the bundled evidence base. " +
    'If the record is missing I say so. Try: "check FirstCheck" or "which deals are robotics?"',
};

export function Checky() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([HELLO]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [msgs, busy]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    const next: Msg[] = [...msgs, { role: "user" as const, content: text }];
    setMsgs(next);
    setBusy(true);
    const words = text
      .toLowerCase()
      .split(/\W+/)
      .filter((word) => word.length > 2);
    const matches = STARTUPS.filter((startup) =>
      words.some((word) =>
        `${startup.company} ${startup.sector} ${startup.geography} ${startup.oneLiner}`
          .toLowerCase()
          .includes(word),
      ),
    ).slice(0, 5);
    const reply = matches.length
      ? `Local evidence matches:\n${matches.map((startup) => `- ${startup.company}: ${startup.oneLiner} Stage: ${startup.stage}; trust: ${startup.trustScore ?? "not assessed"}.`).join("\n")}`
      : "Not in the bundled evidence base. Local demo mode does not infer or browse for missing facts.";
    setMsgs((messages) => [
      ...messages,
      { role: "assistant", content: reply, retrieved: matches.map((startup) => startup.id) },
    ]);
    setBusy(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        title="Checky — evidence-grounded diligence assistant"
        className="fixed bottom-5 right-5 z-40 flex h-11 items-center gap-2 rounded-full bg-primary px-4 text-[13px] font-medium text-primary-foreground shadow-lg"
      >
        <MessageCircleQuestion className="h-4.5 w-4.5" /> Checky
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-40 flex h-[540px] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-lg border border-border bg-card shadow-2xl">
      <div className="flex items-center justify-between border-b border-border bg-surface px-3 py-2">
        <div className="flex items-center gap-2">
          <MessageCircleQuestion className="h-4 w-4 text-primary" />
          <span className="text-[13px] font-medium">Checky · diligence assistant</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setOpen(false)}
            className="grid h-6 w-6 place-items-center rounded border border-border text-muted-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-2.5 overflow-y-auto px-3 py-3">
        {msgs.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-lg px-3 py-2 text-[12.5px] leading-relaxed ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface border border-border"
              }`}
            >
              {m.content}
              {m.retrieved && m.retrieved.length > 0 && (
                <div className="mt-1.5 border-t border-border pt-1 text-[10.5px] text-muted-foreground">
                  grounded in: {m.retrieved.join(", ")}
                </div>
              )}
            </div>
          </div>
        ))}
        {busy && (
          <div className="text-[12px] text-muted-foreground">
            Checky is checking the evidence base…
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 border-t border-border p-2.5">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder='Ask a check: "check Kyrok", "is TetraxAI on thesis?"'
          className="h-9 w-full rounded-md border border-border bg-background px-2.5 text-[12.5px] outline-none focus:border-ring"
        />
        <button
          onClick={send}
          disabled={busy}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground disabled:opacity-60"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
