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
