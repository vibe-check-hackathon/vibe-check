import { useEffect, useRef, useState } from "react";
import { KeyRound, MessageCircleQuestion, Send, X } from "lucide-react";

/*
 * Checky — the diligence assistant. Floating chat over every investor page:
 * retrieval-grounded answers from the opportunity DB (POST /assistant, which
 * cites the chunk ids it reasoned from), plus token management inline — paste
 * or switch the LLM key without touching a terminal (same 24h cache as
 * laura/pipeline/set-key.js). Provider-agnostic: Claude, OpenAI, or a local
 * OpenAI-compatible server, detected from the key.
 */

type Msg = { role: "user" | "assistant"; content: string; retrieved?: string[] };

const HELLO: Msg = {
  role: "assistant",
  content:
    "I'm Checky. Ask me to check anything in the evidence base — a deal, a founder, thesis fit, screening flags. " +
    'I only reason from the opportunity DB and cite my sources; if the evidence is missing I say so. Try: "check Auxilius" or "which outbound deals fit our thesis best?"',
};

export function Checky() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([HELLO]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [keyStatus, setKeyStatus] = useState<{ active: boolean; status: string; provider: string | null } | null>(null);
  const [keyInput, setKeyInput] = useState("");
  const [showKeyForm, setShowKeyForm] = useState(false);
  const [showCustomEndpoint, setShowCustomEndpoint] = useState(false);
  const [baseUrl, setBaseUrl] = useState("");
  const [model, setModel] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const refreshKeyStatus = () =>
    fetch("/llm-key").then((r) => r.json()).then(setKeyStatus).catch(() => {});

  useEffect(() => {
    if (open) refreshKeyStatus();
  }, [open]);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [msgs, busy, showKeyForm]);

  async function saveToken() {
    if (!keyInput.trim()) return;
    if (showCustomEndpoint && !baseUrl.trim()) return;
    const res = await fetch("/llm-key", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key: keyInput.trim(),
        ...(showCustomEndpoint && baseUrl.trim() ? { baseUrl: baseUrl.trim() } : {}),
        ...(showCustomEndpoint && model.trim() ? { model: model.trim() } : {}),
      }),
    });
    const data = await res.json();
    setKeyInput("");
    setBaseUrl("");
    setModel("");
    setShowKeyForm(false);
    setKeyStatus(data);
    setMsgs((m) => [
      ...m,
      { role: "assistant", content: res.ok ? `Token activated: ${data.status}. Ask away.` : `Could not save the token: ${data.error ?? "unknown error"}` },
    ]);
  }

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    const next: Msg[] = [...msgs, { role: "user" as const, content: text }];
    setMsgs(next);
    setBusy(true);
    try {
      const res = await fetch("/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.filter((m) => m !== HELLO).map(({ role, content }) => ({ role, content })) }),
      });
      const data = await res.json();
      if (res.status === 501) {
        setShowKeyForm(true);
        setMsgs((m) => [...m, { role: "assistant", content: "I need an LLM token first — paste one below (Claude sk-ant-…, OpenAI sk-…). It's cached locally for 24h, same as the terminal set-key flow." }]);
      } else if (!res.ok) {
        setMsgs((m) => [...m, { role: "assistant", content: `That check failed: ${data.error ?? "unknown error"}` }]);
      } else {
        setMsgs((m) => [...m, { role: "assistant", content: data.answer, retrieved: data.retrieved }]);
      }
    } catch {
      setMsgs((m) => [...m, { role: "assistant", content: "Could not reach the assistant endpoint — is the dev server running?" }]);
    } finally {
      setBusy(false);
    }
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
            onClick={() => { setShowKeyForm((v) => !v); refreshKeyStatus(); }}
            title={keyStatus?.status ?? "token"}
            className={`grid h-6 w-6 place-items-center rounded border border-border ${keyStatus?.active ? "text-positive" : "text-negative"}`}
          >
            <KeyRound className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => setOpen(false)} className="grid h-6 w-6 place-items-center rounded border border-border text-muted-foreground">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-2.5 overflow-y-auto px-3 py-3">
        {msgs.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-lg px-3 py-2 text-[12.5px] leading-relaxed ${
                m.role === "user" ? "bg-primary text-primary-foreground" : "bg-surface border border-border"
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
        {busy && <div className="text-[12px] text-muted-foreground">Checky is checking the evidence base…</div>}
        {showKeyForm && (
          <div className="rounded-md border border-border bg-surface p-2.5">
            <div className="text-[11.5px] text-muted-foreground">
              {keyStatus?.active ? `Active: ${keyStatus.status} — paste a new key to switch provider.` : "No active token. Paste one to activate (cached 24h, never committed)."}
            </div>
            <div className="mt-1.5 flex gap-1.5">
              <input
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !showCustomEndpoint && saveToken()}
                placeholder={showCustomEndpoint ? "API key for that endpoint" : "sk-ant-… or sk-…"}
                className="h-8 w-full rounded-md border border-border bg-card px-2 text-[12px] outline-none focus:border-ring"
              />
              <button onClick={saveToken} className="h-8 shrink-0 rounded-md bg-primary px-2.5 text-[12px] text-primary-foreground">
                Activate
              </button>
            </div>
            {showCustomEndpoint && (
              <div className="mt-1.5 space-y-1.5">
                <input
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="Base URL — e.g. https://api.groq.com/openai"
                  className="h-8 w-full rounded-md border border-border bg-card px-2 text-[12px] outline-none focus:border-ring"
                />
                <input
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveToken()}
                  placeholder="Model — e.g. llama-3.3-70b-versatile"
                  className="h-8 w-full rounded-md border border-border bg-card px-2 text-[12px] outline-none focus:border-ring"
                />
              </div>
            )}
            <button
              onClick={() => setShowCustomEndpoint((v) => !v)}
              className="mt-1.5 text-[11px] text-primary hover:underline"
            >
              {showCustomEndpoint ? "Use Claude or OpenAI instead" : "Use a free / self-hosted endpoint instead (Groq, Ollama, LM Studio…)"}
            </button>
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
        <button onClick={send} disabled={busy} className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground disabled:opacity-60">
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
