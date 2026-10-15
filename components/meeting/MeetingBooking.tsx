"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  Mail,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Globe2,
  Video,
} from "lucide-react";
import { profile } from "@/data/profile";
const zones = [
  "Asia/Manila",
  "Asia/Singapore",
  "Europe/London",
  "America/New_York",
  "America/Los_Angeles",
  "UTC",
];
const timeOptions = [9, 10, 11, 14, 15, 16];
const isoDate = (date: Date) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
export function MeetingBooking() {
  const [now, setNow] = useState<Date | null>(null);
  const [month, setMonth] = useState("");
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [zone, setZone] = useState("Asia/Manila");
  const [step, setStep] = useState<"date" | "details" | "done">("date");
  const [visitor, setVisitor] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    const current = new Date();
    // Initialize from the visitor's clock after hydration, not the build server's clock.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(current);
    setMonth(isoDate(current).slice(0, 7));
  }, []);
  const formatTime = (value: string) =>
    new Intl.DateTimeFormat("en", {
      timeZone: zone,
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(value));
  const formatDate = (value: string) =>
    new Intl.DateTimeFormat("en", {
      timeZone: zone,
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(new Date(value));
  if (!now)
    return (
      <div className="booking-loading" role="status">
        Preparing the calendar…
      </div>
    );
  const today = isoDate(now);
  const [year, monthNumber] = month.split("-").map(Number);
  const monthDate = new Date(Date.UTC(year, monthNumber - 1, 1));
  const daysInMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  const firstWeekday = (monthDate.getUTCDay() + 6) % 7;
  const dates = Array.from(
    { length: daysInMonth },
    (_, i) => `${month}-${String(i + 1).padStart(2, "0")}`,
  );
  const maxDate = isoDate(new Date(now.getTime() + 60 * 86400000));
  const slots = date
    ? timeOptions
        .map((hour) =>
          new Date(
            `${date}T${String(hour).padStart(2, "0")}:00:00+08:00`,
          ).toISOString(),
        )
        .filter((value) => new Date(value).getTime() > now.getTime())
    : [];
  function changeMonth(delta: number) {
    const next = new Date(Date.UTC(year, monthNumber - 1 + delta, 1));
    setMonth(next.toISOString().slice(0, 7));
  }
  function validateSlot() {
    if (!slot || new Date(slot).getTime() <= Date.now()) {
      setError("That time has passed. Please choose a future time.");
      setNow(new Date());
      setSlot("");
      setStep("date");
      return false;
    }
    setError("");
    return true;
  }
  const subject = slot
    ? `Call request: ${formatDate(slot)} at ${formatTime(slot)} (${zone})`
    : "Call request";
  const body = slot
    ? [
        "Hi Wel,",
        "",
        "I'd like to request a 30-minute introduction.",
        `Preferred date: ${formatDate(slot)}`,
        `Preferred time: ${formatTime(slot)}`,
        `Time zone: ${zone}`,
        `Philippine time: ${new Intl.DateTimeFormat("en", { timeZone: "Asia/Manila", dateStyle: "full", timeStyle: "short" }).format(new Date(slot))} (UTC+8)`,
        "Duration: 30 minutes",
        "",
        `Name: ${visitor.trim()}`,
        `Email: ${email.trim()}`,
        ...(message.trim() ? ["", "About my project:", message.trim()] : []),
        "",
        "Please let me know if this time works for you, or suggest another time.",
      ].join("\r\n")
    : "";
  const gmailHref = `https://mail.google.com/mail/?${new URLSearchParams({ view: "cm", fs: "1", to: profile.email, su: subject, body })}`;
  const mailtoHref = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  return (
    <div className="booking-layout">
      <aside className="booking-profile">
        <Image
          src={profile.photo || "/images/avatar.svg"}
          width={64}
          height={64}
          alt="Welquim Panogaling"
        />
        <p className="muted text-sm">Welquim Panogaling</p>
        <h2>
          A good place
          <br />
          to start.
        </h2>
        <p>
          A casual introduction to talk about your idea, your project, and how
          we could work together.
        </p>
        <div className="meeting-facts">
          <span>
            <Clock3 size={16} />
            30 minutes
          </span>
          <span>
            <Video size={16} />
            Video call
          </span>
          <span>
            <Globe2 size={16} />
            Your timezone, your convenience
          </span>
        </div>
        <div className="demo-notice">
          <strong>Request a time</strong>
          <p>
            Choose your preferred time and email your request to Welquim. He’ll
            reply to confirm availability and arrange the call.
          </p>
        </div>
      </aside>
      <div className="booking-main">
        {error && (
          <p className="calendar-note" role="alert">
            {error}
          </p>
        )}
        {step === "date" && (
          <>
            <span className="eyebrow">01 / PICK A MOMENT</span>
            <h2>Select a date & time</h2>
            <div className="calendar-header">
              <strong>
                {monthDate.toLocaleString("en", {
                  month: "long",
                  year: "numeric",
                  timeZone: "UTC",
                })}
              </strong>
              <div>
                <button
                  className="icon-button"
                  aria-label="Previous month"
                  disabled={month <= today.slice(0, 7)}
                  onClick={() => changeMonth(-1)}
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  className="icon-button"
                  aria-label="Next month"
                  disabled={month >= maxDate.slice(0, 7)}
                  onClick={() => changeMonth(1)}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
            <p className="calendar-note">
              Calendar dates follow Philippine time (UTC+8).
            </p>
            <div className="calendar-grid">
              {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
                <span className="weekday" key={d}>
                  {d}
                </span>
              ))}
              {Array.from({ length: firstWeekday }, (_, i) => (
                <span key={`blank-${i}`} />
              ))}
              {dates.map((value, i) => {
                const disabled = value < today || value > maxDate;
                return (
                  <button
                    key={value}
                    disabled={disabled}
                    aria-label={new Date(
                      value + "T12:00:00Z",
                    ).toLocaleDateString("en", {
                      dateStyle: "full",
                      timeZone: "UTC",
                    })}
                    aria-pressed={date === value}
                    className={date === value ? "selected" : ""}
                    onClick={() => {
                      setDate(value);
                      setSlot("");
                    }}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
            <label className="field-label" htmlFor="timezone">
              Display time zone
            </label>
            <select
              id="timezone"
              value={zone}
              onChange={(e) => setZone(e.target.value)}
            >
              {zones.map((z) => (
                <option key={z} value={z}>
                  {z.replaceAll("_", " ")}
                </option>
              ))}
            </select>
            {date && (
              <div className="time-section">
                <p className="field-label">
                  Preferred start time · {zone.replaceAll("_", " ")}
                </p>
                <div className="time-slots">
                  {slots.map((value) => (
                    <button
                      className={slot === value ? "selected" : ""}
                      key={value}
                      onClick={() => setSlot(value)}
                      aria-pressed={slot === value}
                    >
                      {formatTime(value)}
                    </button>
                  ))}
                </div>
                {!slots.length && (
                  <p role="status" className="muted text-sm">
                    No remaining times today. Please select another date.
                  </p>
                )}
                {slot && (
                  <p className="selected-time">
                    {formatDate(slot)} · {formatTime(slot)}
                  </p>
                )}
              </div>
            )}
            <button
              className="button button-dark booking-next"
              disabled={!slot}
              onClick={() => {
                if (validateSlot()) setStep("details");
              }}
            >
              Continue
              <ArrowRight size={15} />
            </button>
          </>
        )}
        {step === "details" && (
          <>
            <button
              className="text-link back-link"
              onClick={() => setStep("date")}
            >
              <ArrowLeft size={15} />
              Change time
            </button>
            <span className="eyebrow">02 / SAY HELLO</span>
            <h2>Your details</h2>
            <p className="selected-time">
              {formatDate(slot)}
              <br />
              {formatTime(slot)} · {zone}
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (visitor.trim() && validateSlot()) setStep("done");
              }}
            >
              <label className="field-label" htmlFor="visitor">
                Your name
              </label>
              <input
                id="visitor"
                autoComplete="name"
                required
                maxLength={100}
                value={visitor}
                onChange={(e) => setVisitor(e.target.value)}
                placeholder="Your full name"
              />
              <label className="field-label" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                maxLength={254}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
              <label className="field-label" htmlFor="meeting-message">
                What would you like to discuss? (optional)
              </label>
              <textarea
                id="meeting-message"
                className="meeting-message"
                rows={4}
                maxLength={1500}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="A little about your project or questions…"
              />
              <button
                className="button button-dark booking-next"
                type="submit"
                disabled={!visitor.trim()}
              >
                Review request
                <ArrowRight size={15} />
              </button>
              <p className="calendar-note">
                You’ll review the request before opening it in your email app.
              </p>
            </form>
          </>
        )}
        {step === "done" && (
          <div className="booking-confirmation" role="status">
            <span className="confirmation-icon">
              <Mail size={26} />
            </span>
            <span className="eyebrow">03 / EMAIL YOUR REQUEST</span>
            <h2>Your request is ready, {visitor.trim().split(" ")[0]}.</h2>
            <p>
              {formatDate(slot)}
              <br />
              {formatTime(slot)} · {zone}
            </p>
            <div className="demo-notice">
              <strong>Send to {profile.email}</strong>
              <p>
                Open your draft below, review it, and press Send in your email
                app. Your time is confirmed when Welquim replies.
              </p>
            </div>
            <div className="booking-email-actions">
              <a
                className="button button-dark"
                href={gmailHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(event) => {
                  if (!validateSlot()) event.preventDefault();
                }}
              >
                Open request in Gmail <ArrowRight size={15} />
              </a>
              <a
                className="button button-outline"
                href={mailtoHref}
                onClick={(event) => {
                  if (!validateSlot()) event.preventDefault();
                }}
              >
                Use email app
              </a>
            </div>
            <button
              className="button button-outline"
              onClick={() => {
                setStep("date");
                setSlot("");
                setDate("");
              }}
            >
              Change date or time
              <ArrowRight size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
