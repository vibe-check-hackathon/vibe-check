/** Static deployments keep the scripted interview but cannot safely hold an
 * ElevenLabs credential or mint a provider session in the browser. */

export type LiveStatus = "idle" | "connecting" | "connected" | "ended" | "error";

export type LiveTurn = { who: "agent" | "founder"; text: string };

export function useLiveInterview() {
  return {
    available: false,
    status: "idle" as LiveStatus,
    error: null,
    turns: [] as LiveTurn[],
    mode: null,
    start: async () => undefined,
    stop: async () => undefined,
  };
}
