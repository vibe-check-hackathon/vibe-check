// Transcription provider abstraction for AUTHORIZED LOCAL recordings only
// (.mp3 .wav .m4a .mp4 .webm). No hosted-media downloading — for platform
// media, users must supply a local file, a transcript, or rights-holder
// captions (enforced upstream by checkSourcePolicy).
//
// Providers implement: transcribe(filePath) → [{speaker,startSeconds,endSeconds,text}]
// Adding a provider = one entry in PROVIDERS (see INTERVIEWS.md).

import { readFileSync } from "node:fs";
import { basename } from "node:path";
import { loadConfig } from "./llm.js";

const PROVIDERS = {
  /** OpenAI speech-to-text (whisper-1, verbose_json segments). Uses the same
   *  24h key store as everything else (set-key.js) when the key is OpenAI. */
  openai: {
    available: () => loadConfig()?.provider === "openai",
    async transcribe(filePath) {
      const cfg = loadConfig();
      const bytes = readFileSync(filePath);
      const form = new FormData();
      form.append("file", new Blob([bytes]), basename(filePath));
      form.append("model", "whisper-1");
      form.append("response_format", "verbose_json");
      const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: { Authorization: `Bearer ${cfg.key}` },
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message ?? `transcription http ${res.status}`);
      return (data.segments ?? []).map((s) => ({
        speaker: null, // whisper-1 has no diarization — speakers assigned in review
        startSeconds: s.start,
        endSeconds: s.end,
        text: s.text.trim(),
      }));
    },
  },
};

export function transcriptionProvider() {
  for (const [name, p] of Object.entries(PROVIDERS)) if (p.available()) return { name, ...p };
  return null;
}

export async function transcribeRecording(filePath) {
  const provider = transcriptionProvider();
  if (!provider) {
    throw new Error(
      "no transcription provider available — set an OpenAI key (node laura/pipeline/set-key.js) " +
        "or supply a transcript file (.txt/.srt/.vtt/.json) instead of the recording",
    );
  }
  return { provider: provider.name, segments: await provider.transcribe(filePath) };
}
