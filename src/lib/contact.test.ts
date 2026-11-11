import { test } from "node:test";
import assert from "node:assert/strict";
import { buildAutoReply, buildInquiryEmail, contactSchema } from "./contact.ts";

const valid = {
  name: "Sam Example",
  email: "sam@example.com",
  projectType: "Websites",
  budget: "Not sure yet",
  timeline: "No fixed date",
  message: "We need a new site for our bakery.",
};

const without = (...keys: string[]) =>
  Object.fromEntries(Object.entries(valid).filter(([k]) => !keys.includes(k)));

test("accepts a complete inquiry", () => {
  assert.equal(contactSchema.safeParse(valid).success, true);
});

test("rejects empty name, bad email and overlong message", () => {
  assert.equal(
    contactSchema.safeParse({ ...valid, name: "  " }).success,
    false,
  );
  assert.equal(
    contactSchema.safeParse({ ...valid, email: "sam@" }).success,
    false,
  );
  const long = "x".repeat(5001);
  assert.equal(
    contactSchema.safeParse({ ...valid, message: long }).success,
    false,
  );
});

test("rejects options that are not on the form", () => {
  assert.equal(
    contactSchema.safeParse({ ...valid, budget: "$1" }).success,
    false,
  );
});

test("budget and timeline are optional but still checked when given", () => {
  // Astro turns an unchosen optional radio group into undefined.
  const rest = without("budget", "timeline");
  assert.equal(contactSchema.safeParse(rest).success, true);
  assert.equal(
    contactSchema.safeParse({ ...rest, budget: undefined, timeline: undefined })
      .success,
    true,
  );
  assert.equal(
    contactSchema.safeParse({ ...valid, timeline: "Yesterday" }).success,
    false,
  );
  assert.equal(
    contactSchema.safeParse({ ...valid, budget: null }).success,
    false,
  );
});

test("project type, name, email and message stay required", () => {
  for (const key of ["projectType", "name", "email", "message"] as const) {
    assert.equal(contactSchema.safeParse(without(key)).success, false, key);
  }
});

test("inquiry email says 'Not given' for an empty budget or timeline", () => {
  const data = contactSchema.parse(without("budget", "timeline"));
  const { text } = buildInquiryEmail(data);
  assert.match(text, /^Budget: Not given$/m);
  assert.match(text, /^Timeline: Not given$/m);
  const full = buildInquiryEmail(contactSchema.parse(valid)).text;
  assert.match(full, /^Budget: Not sure yet$/m);
  assert.match(full, /^Timeline: No fixed date$/m);
});

test("inquiry subject is one line even if the name has line breaks", () => {
  const data = contactSchema.parse({ ...valid, name: "Sam\r\nBcc: x@y.z" });
  const { subject, text } = buildInquiryEmail(data);
  assert.doesNotMatch(subject, /[\r\n]/);
  assert.match(text, /sam@example\.com/);
  assert.match(text, /We need a new site/);
});

test("auto-reply is fixed text and never echoes visitor input", () => {
  const { subject, text } = buildAutoReply();
  assert.doesNotMatch(subject, /[\r\n]/);
  assert.match(text, /one business day/);
  assert.doesNotMatch(text, /We need a new site|Sam/);
});

test("missing fields get friendly messages, not validator jargon", () => {
  // Astro turns empty form inputs into null before validation.
  const r = contactSchema.safeParse({ ...valid, name: null, message: null });
  assert.equal(r.success, false);
  const messages = r.error!.issues.map((i) => i.message).join(" ");
  assert.match(messages, /Please enter your name/);
  assert.match(messages, /Please tell us a little/);
});
