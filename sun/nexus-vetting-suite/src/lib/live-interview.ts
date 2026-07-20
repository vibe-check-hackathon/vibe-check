import { useCallback, useEffect, useRef, useState } from "react";
import { Conversation } from "@elevenlabs/client";
import { ACME_FOUNDERS } from "@/lib/data";

/**
 * Live founder interview over ElevenLabs Agents.
 *
 * The signed URL and the founder context are minted server-side (`/interview-session`)
 * so the API key never reaches the browser. When the integration is not
 * configured the hook reports `available: false` and the page keeps its
 * scripted demo — the button is never offered where it cannot work.
 */

export type LiveStatus = "idle" | "connecting" | "connected" | "ended" | "error";

export type LiveTurn = { who: "agent" | "founder"; text: string };

export function useLiveInterview() {
  const [available, setAvailable] = useState(false);
  const [status, setStatus] = useState<LiveStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [turns, setTurns] = useState<LiveTurn[]>([]);
  /** "speaking" = the agent is talking; "listening" = waiting on the founder. */
  const [mode, setMode] = useState<"speaking" | "listening" | null>(null);
  const convo = useRef<Awaited<ReturnType<typeof Conversation.startSession>> | null>(null);

  useEffect(() => {
    fetch("/integrations")
      .then((r) => (r.ok ? r.json() : { elevenlabs: false }))
      .then((d) => setAvailable(Boolean(d.elevenlabs)))
      .catch(() => setAvailable(false));
  }, []);

  const start = useCallback(async () => {
    setError(null);
    setTurns([]);
    setStatus("connecting");
    try {
      // The mic prompt must come from a user gesture, which is why this runs
      // on click rather than on mount.
      await navigator.mediaDevices.getUserMedia({ audio: true });

      const res = await fetch("/interview-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: "FirstCheck",
          oneLiner:
            "AI-native first-check screening for venture funds — evidence-backed founder profiles and an agent interview.",
          founders: ACME_FOUNDERS.map((f) => ({
            name: f.name,
            role: f.role,
            personality: f.personality,
          })),
          openQuestions: [
            "Does the thesis lens generalise to a second fund without a second rule set?",
            "What is the inference cost per memo, and how does it scale?",
            "Who signs the first paid pilot, and when?",
          ],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "could not start the session");

      convo.current = await Conversation.startSession({
        signedUrl: data.signedUrl,
        dynamicVariables: data.dynamicVariables,
        onConnect: () => setStatus("connected"),
        onDisconnect: () => {
          setStatus("ended");
          setMode(null);
        },
        onError: (e: unknown) => {
          setError(e instanceof Error ? e.message : String(e));
          setStatus("error");
        },
        onModeChange: ({ mode: m }: { mode: string }) =>
          setMode(m === "speaking" ? "speaking" : "listening"),
        onMessage: ({ message, source }: { message: string; source: string }) =>
          setTurns((t) => [...t, { who: source === "ai" ? "agent" : "founder", text: message }]),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "could not start the interview");
      setStatus("error");
    }
  }, []);

  const stop = useCallback(async () => {
    await convo.current?.endSession();
    convo.current = null;
    setStatus("ended");
    setMode(null);
  }, []);

  // Never leave a live microphone session running behind a route change.
  useEffect(() => {
    return () => {
      convo.current?.endSession();
      convo.current = null;
    };
  }, []);

  return { available, status, error, turns, mode, start, stop };
}
