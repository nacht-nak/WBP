"use client";

import { useRef, useState, type FormEvent, type MouseEvent } from "react";
import Link from "next/link";
import { ChevronRight, Mail, CalendarDays, X } from "lucide-react";

export function ContactInquiry({ email }: { email: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const sending = useRef(false);
  const submission = useRef<{ id: string; content: string } | null>(null);
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [failed, setFailed] = useState(false);

  function open(event: MouseEvent<HTMLButtonElement>) {
    trigger.current = event.currentTarget;
    dialog.current?.showModal();
    dialog.current?.querySelector("input")?.focus();
  }

  async function saveInquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending.current) return;
    const form = event.currentTarget;
    for (const field of event.currentTarget.querySelectorAll<
      HTMLInputElement | HTMLTextAreaElement
    >("input, textarea")) {
      field.setCustomValidity(
        field.value.trim() ? "" : "Please fill out this field.",
      );
      if (!field.reportValidity()) return;
    }
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") || "").trim();
    const sender = String(data.get("email") || "").trim();
    const subject = String(data.get("subject") || "").trim();
    const message = String(data.get("message") || "").trim();
    if (!name || !sender || !subject || !message) return;
    const fields = { name, email: sender, subject, message };
    const content = JSON.stringify(fields);
    if (submission.current?.content !== content) {
      submission.current = { id: crypto.randomUUID(), content };
    }
    sending.current = true;
    setPending(true);
    setFeedback("");
    setFailed(false);
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, id: submission.current.id }),
        signal: AbortSignal.timeout(55000),
      });
      const result = await response.json();
      if (!response.ok || result.success !== true) {
        throw new Error(
          result.error || "Your inquiry could not be sent. Please try again.",
        );
      }
      setFeedback("Your message has been sent to Wel. Thank you!");
      form.reset();
      submission.current = null;
    } catch (error) {
      setFailed(true);
      setFeedback(
        error instanceof Error && error.name === "Error"
          ? error.message
          : "Could not confirm delivery. Try Save again to check your submission.",
      );
    } finally {
      sending.current = false;
      setPending(false);
    }
  }

  return (
    <>
      <div className="contact-links">
        <button
          type="button"
          className="contact-card"
          onClick={open}
          aria-haspopup="dialog"
          aria-controls="inquiry-dialog"
        >
          <span className="contact-icon">
            <Mail size={17} strokeWidth={1.6} />
          </span>
          <span className="contact-text">
            <strong>Email</strong>
            <span>{email || "Write an email inquiry"}</span>
          </span>
          <ChevronRight size={14} />
        </button>
        <Link href="/meeting" className="contact-card">
          <span className="contact-icon">
            <CalendarDays size={17} strokeWidth={1.6} />
          </span>
          <span className="contact-text">
            <strong>Let’s talk</strong>
            <span>Schedule a call</span>
          </span>
          <ChevronRight size={14} />
        </Link>
      </div>
      <dialog
        ref={dialog}
        id="inquiry-dialog"
        className="inquiry-dialog"
        aria-labelledby="inquiry-title"
        aria-describedby="inquiry-description"
        onClose={() => trigger.current?.focus()}
      >
        <div className="inquiry-header">
          <span className="inquiry-icon">
            <Mail size={21} strokeWidth={1.5} />
          </span>
          <button
            type="button"
            className="inquiry-close"
            onClick={() => dialog.current?.close()}
            aria-label="Close inquiry"
          >
            <X size={20} />
          </button>
        </div>
        <h2 id="inquiry-title">Let’s talk about your project.</h2>
        <p id="inquiry-description">
          Have an idea or a question? Leave a few details and we’ll take it from
          there.
        </p>
        <form
          onSubmit={saveInquiry}
          aria-busy={pending}
          className="inquiry-form"
          onInput={(event) => {
            const field = event.target;
            if (
              field instanceof HTMLInputElement ||
              field instanceof HTMLTextAreaElement
            )
              field.setCustomValidity("");
            setFeedback("");
          }}
        >
          <div className="inquiry-fields">
            <label>
              Your name
              <input
                name="name"
                autoComplete="name"
                placeholder="Full name"
                maxLength={100}
                disabled={pending}
                required
              />
            </label>
            <label>
              Your email
              <input
                name="email"
                type="email"
                autoComplete="email"
                placeholder="wel@example.com"
                maxLength={254}
                disabled={pending}
                required
              />
            </label>
          </div>
          <label>
            Subject
            <input
              name="subject"
              placeholder="Type your wants"
              maxLength={140}
              disabled={pending}
              required
            />
          </label>
          <label>
            Message
            <textarea
              name="message"
              placeholder="Tell me what you have in mind…"
              rows={5}
              maxLength={4000}
              disabled={pending}
              required
            />
          </label>
          <div className="inquiry-actions">
            <button
              type="submit"
              className="inquiry-primary"
              disabled={pending}
            >
              {pending ? "Saving..." : "Save"}
            </button>
          </div>
          {feedback && (
            <p
              className={
                failed ? "inquiry-result inquiry-error" : "inquiry-result"
              }
              role={failed ? "alert" : "status"}
            >
              {feedback}
            </p>
          )}
        </form>
      </dialog>
    </>
  );
}
