// Event bus implementing the integration contract in laura/stitch-ai-prompt.md §3.3.
// One stream drives every frontend panel; the founder role gets a filtered subset.

const EVENT_TYPES = new Set([
  "transcript.line",
  "topic.change",
  "request.item",
  "signal.update",
  "card.update",
  "model.update",
  "approval.update",
  "status.change",
  "outcome.recorded",
]);

// Events a founder connection is allowed to receive. status.change is included
// but must be stripped to the status word first — see founderView().
const FOUNDER_SAFE_TYPES = new Set([
  "transcript.line",
  "topic.change",
  "request.item",
  "status.change",
]);

export function createBus() {
  const log = [];
  const listeners = [];

  function emit(event) {
    if (!EVENT_TYPES.has(event.type)) {
      throw new Error(`unknown event type: ${event.type}`);
    }
    const stamped = { at: new Date().toISOString(), ...event };
    log.push(stamped);
    for (const fn of listeners) fn(stamped);
    return stamped;
  }

  function subscribe(fn) {
    listeners.push(fn);
    return () => listeners.splice(listeners.indexOf(fn), 1);
  }

  return { emit, subscribe, log };
}

// Server-side role gating: founders never receive analysis or negotiation
// events, and never see the internal recommendation on a status change.
export function founderView(event) {
  if (!FOUNDER_SAFE_TYPES.has(event.type)) return null;
  if (event.type === "status.change") {
    return { at: event.at, type: event.type, status: event.status };
  }
  return event;
}
