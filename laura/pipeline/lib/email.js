/* Resend adapter — the interview invitation the voiceover promises.
 *
 * SAFETY: sending is opt-in per call (`live: true`). Every other path returns a
 * rendered preview and sends nothing. Applications carry real founders' real
 * email addresses, and an accidental blast during a demo rehearsal is not
 * recoverable — so the default had to be the harmless one.
 */

import { serviceConfig } from "./service-keys.js";

const ENDPOINT = "https://api.resend.com/emails";

/** Minimal escaping — founder-supplied names and companies land in this HTML. */
function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderInterviewInvite({ founderName, company, interviewUrl, hypothesisCount = 0 }) {
  const first = String(founderName ?? "there").split(/\s+/)[0];
  const subject = `Your FirstCheck interview — ${company}`;

  const text = [
    `Hi ${first},`,
    ``,
    `${company} passed our first-pass screen, so the next step is a short interview with our AI interviewer.`,
    ``,
    `Start it here: ${interviewUrl}`,
    ``,
    `It takes about fifteen minutes. It is a conversation, not a form — the agent asks about the`,
    `things the written application left open${hypothesisCount ? `, and there are ${hypothesisCount} of those on our side right now` : ""}.`,
    `Everything it concludes is shown to a human investor before any decision is made.`,
    ``,
    `— FirstCheck`,
  ].join("\n");

  const html = `<!doctype html><html><body style="margin:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111827">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
    <table role="presentation" width="100%" style="max-width:520px;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px">
      <tr><td style="padding:28px 28px 8px">
        <div style="font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:#6b7280">FirstCheck</div>
        <h1 style="margin:12px 0 0;font-size:20px;font-weight:600">Your interview for ${esc(company)}</h1>
      </td></tr>
      <tr><td style="padding:8px 28px 0;font-size:14px;line-height:1.6;color:#374151">
        <p style="margin:12px 0">Hi ${esc(first)},</p>
        <p style="margin:12px 0">${esc(company)} passed our first-pass screen. The next step is a short interview with our AI interviewer — about fifteen minutes, and a conversation rather than a form.</p>
        <p style="margin:12px 0">It asks about what the written application left open${hypothesisCount ? `, and there are ${hypothesisCount} of those on our side right now` : ""}. Everything it concludes is reviewed by a human investor before any decision is made.</p>
      </td></tr>
      <tr><td style="padding:20px 28px 28px">
        <a href="${esc(interviewUrl)}" style="display:inline-block;background:#0b3d2e;color:#ffffff;text-decoration:none;padding:11px 20px;border-radius:8px;font-size:14px;font-weight:500">Start the interview</a>
        <p style="margin:16px 0 0;font-size:12px;color:#6b7280;word-break:break-all">${esc(interviewUrl)}</p>
      </td></tr>
    </table>
  </td></tr></table></body></html>`;

  return { subject, text, html };
}

/**
 * Send (or preview) the invitation.
 *
 * @param {object}  opts
 * @param {boolean} opts.live  must be explicitly true to actually deliver mail
 * @returns {Promise<{sent: boolean, reason?: string, id?: string, preview: object}>}
 */
export async function sendInterviewInvite({ to, founderName, company, interviewUrl, hypothesisCount, live = false }) {
  const rendered = renderInterviewInvite({ founderName, company, interviewUrl, hypothesisCount });
  const preview = { to, ...rendered };

  if (!to) return { sent: false, reason: "no recipient address on the application", preview };
  if (!live) return { sent: false, reason: "preview only — pass live:true to deliver", preview };

  const cfg = serviceConfig("resend");
  if (!cfg) {
    return { sent: false, reason: "resend not configured — run set-service-key.js resend re_…", preview };
  }

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cfg.key}`,
      "Content-Type": "application/json",
      // Re-inviting the same founder for the same opportunity must not double-send.
      "Idempotency-Key": `invite:${company}:${to}`.slice(0, 256),
    },
    body: JSON.stringify({
      from: cfg.from,
      to: [to],
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    return { sent: false, reason: `resend ${res.status}: ${detail.slice(0, 200)}`, preview };
  }
  const body = await res.json().catch(() => ({}));
  return { sent: true, id: body.id, preview };
}
