import { z } from "astro/zod";

export const projectTypes = [
  "Websites",
  "Web apps and business tools",
  "Mobile and desktop apps",
  "Care and hosting",
  "Not sure yet",
] as const;

// Amounts in Canadian dollars.
export const budgets = [
  "Under $5,000",
  "$5,000 to $15,000",
  "$15,000 to $40,000",
  "Over $40,000",
  "Not sure yet",
] as const;

export const timelines = [
  "As soon as possible",
  "In 1 to 3 months",
  "In 3 to 6 months",
  "No fixed date",
] as const;

const pick = (label: string) => ({ error: `Please choose ${label}.` });

export const contactSchema = z.object({
  name: z
    .string({ error: "Please enter your name." })
    .trim()
    .min(1, "Please enter your name.")
    .max(100, "Please keep your name under 100 characters."),
  email: z
    .email("Please enter a valid email address.")
    .max(254, "Please enter a valid email address."),
  projectType: z.enum(projectTypes, pick("a project type")),
  // Optional: Astro sends an unchosen radio group as undefined.
  budget: z.enum(budgets, pick("a budget range")).optional(),
  timeline: z.enum(timelines, pick("a timeline")).optional(),
  message: z
    .string({ error: "Please tell us a little about your project." })
    .trim()
    .min(1, "Please tell us a little about your project.")
    .max(5000, "Please keep your message under 5,000 characters."),
});

export type Inquiry = z.infer<typeof contactSchema>;

// Header-safe: user input must never add lines to an email header.
const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ").trim();

const summary = (d: Inquiry) =>
  [
    `Name: ${oneLine(d.name)}`,
    `Email: ${d.email}`,
    `Project type: ${d.projectType}`,
    `Budget: ${d.budget ?? "Not given"}`,
    `Timeline: ${d.timeline ?? "Not given"}`,
    "",
    d.message,
  ].join("\n");

export function buildInquiryEmail(d: Inquiry) {
  return {
    subject: oneLine(`New inquiry from ${d.name} (${d.projectType})`),
    text: summary(d),
  };
}

// Fixed text on purpose: the visitor's address is unverified, so echoing their
// input would let anyone send arbitrary text from our domain to a stranger.
export function buildAutoReply() {
  return {
    subject: "We got your message",
    text: [
      "Thanks for getting in touch with KovalSoft. We have your message and will reply within one business day.",
      "",
      "If you didn't send a message through kovalsoft.com, you can ignore this email.",
      "",
      "KovalSoft",
      "Based in Ontario",
    ].join("\n"),
  };
}
