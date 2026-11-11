import { ActionError, defineAction } from "astro:actions";
import {
  CONTACT_INBOX,
  RESEND_API_KEY,
  RESEND_FROM,
  TURNSTILE_SECRET_KEY,
} from "astro:env/server";
import { PUBLIC_CONTACT_EMAIL } from "astro:env/client";
import { z } from "astro/zod";
import {
  buildAutoReply,
  buildInquiryEmail,
  contactSchema,
} from "../lib/contact";

// Only offer email as the way out when there is an address to offer.
const fallback = PUBLIC_CONTACT_EMAIL
  ? `Please try again, or email us at ${PUBLIC_CONTACT_EMAIL}.`
  : "Please try again in a few minutes.";

async function turnstileOk(token: string, ip: string | null) {
  const body = new FormData();
  body.append("secret", TURNSTILE_SECRET_KEY ?? "");
  body.append("response", token);
  if (ip) body.append("remoteip", ip);
  const res = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    { method: "POST", body },
  );
  if (!res.ok) return false;
  const data = (await res.json()) as { success?: boolean };
  return data.success === true;
}

async function sendEmail(email: {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: RESEND_FROM,
      to: [email.to],
      subject: email.subject,
      text: email.text,
      reply_to: email.replyTo,
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

export const server = {
  contact: defineAction({
    accept: "form",
    input: contactSchema.extend({
      "cf-turnstile-response": z.string().optional(),
    }),
    handler: async (input, context) => {
      if (
        !RESEND_API_KEY ||
        !RESEND_FROM ||
        !CONTACT_INBOX ||
        !TURNSTILE_SECRET_KEY
      ) {
        throw new ActionError({
          code: "SERVICE_UNAVAILABLE",
          message: PUBLIC_CONTACT_EMAIL
            ? `The form isn't set up yet. Please email us at ${PUBLIC_CONTACT_EMAIL}.`
            : "The form isn't set up yet. Please try again later.",
        });
      }

      const token = input["cf-turnstile-response"] ?? "";
      const ip = context.request.headers.get("CF-Connecting-IP");
      if (!token || !(await turnstileOk(token, ip))) {
        throw new ActionError({
          code: "FORBIDDEN",
          message: "We couldn't confirm you're not a bot. Please try again.",
        });
      }

      try {
        await sendEmail({
          to: CONTACT_INBOX,
          replyTo: input.email,
          ...buildInquiryEmail(input),
        });
      } catch (err) {
        console.error("Contact inquiry failed to send", err);
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Your message didn't send. ${fallback}`,
        });
      }

      // The inquiry is delivered; a failed auto-reply must not fail the form.
      try {
        await sendEmail({ to: input.email, ...buildAutoReply() });
      } catch (err) {
        console.error("Contact auto-reply failed to send", err);
      }

      return { ok: true };
    },
  }),
};
