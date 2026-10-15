"use client";

import { useEffect, useRef, useState } from "react";
import { Send, UserRound } from "lucide-react";
import Image from "next/image";
import { profile } from "@/data/profile";

const welcome: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Hey! I'm Wel — feel free to ask about my projects, the stack I work with, or anything else related to technology.",
  delivered: true,
};

type Message = {
  id: string;
  role: "user" | "owner" | "assistant";
  content: string;
  delivered: boolean;
};

export function LiveChat({ active }: { active: boolean }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [connected, setConnected] = useState<boolean | null>(null);
  const [aiAvailable, setAIAvailable] = useState(false);
  const [humanMode, setHumanMode] = useState(false);
  const [warning, setWarning] = useState("");
  const [retryMessage, setRetryMessage] = useState<{
    id: string;
    content: string;
  } | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const sending = sendingId !== null;
  const [error, setError] = useState("");
  const [syncError, setSyncError] = useState(false);
  const transcript = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const pending = useRef<AbortController | null>(null);
  const revision = useRef(0);
  const attempt = useRef<{ id: string; content: string } | null>(null);
  const activeMessage = useRef<{ id: string; content: string } | null>(null);

  useEffect(() => () => pending.current?.abort(), []);
  useEffect(() => {
    if (!active) return;
    input.current?.focus();
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    async function refresh() {
      try {
        if (!pending.current || activeMessage.current) {
          const startedAtRevision = revision.current;
          const response = await fetch("/api/messages", {
            cache: "no-store",
            signal: AbortSignal.any([
              controller.signal,
              AbortSignal.timeout(10000),
            ]),
          });
          const data = await response.json();
          if (!response.ok || !Array.isArray(data.messages)) throw new Error();
          if (controller.signal.aborted) return;
          // A POST may have begun after this GET: never overwrite its optimistic message.
          if (startedAtRevision !== revision.current) return;
          setMessages((current) => {
            const next: Message[] = data.messages;
            const optimistic = activeMessage.current;
            if (optimistic && !next.some((m) => m.id === optimistic.id))
              next.push({ ...optimistic, role: "user", delivered: false });
            return JSON.stringify(current) === JSON.stringify(next)
              ? current
              : next;
          });
          setConnected(data.connected === true);
          setAIAvailable(data.aiAvailable === true);
          setHumanMode(data.humanMode === true);
          setSyncError(false);
        }
      } catch {
        if (!controller.signal.aborted) setSyncError(true);
      } finally {
        if (!controller.signal.aborted)
          timer = setTimeout(refresh, activeMessage.current ? 1000 : 3000);
      }
    }
    void refresh();
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [active]);

  useEffect(() => {
    const element = transcript.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [messages, error]);

  async function send(retry?: { id: string; content: string }) {
    const content = (retry?.content || draft).trim();
    if (
      !content ||
      content.length > 3000 ||
      pending.current ||
      connected === null
    )
      return;
    if (retry) attempt.current = retry;
    else if (attempt.current?.content !== content)
      attempt.current = { id: crypto.randomUUID(), content };
    const message = attempt.current;
    activeMessage.current = message;
    const controller = new AbortController();
    pending.current = controller;
    revision.current++;
    setSendingId(message.id);
    setError("");
    setWarning("");
    setRetryMessage(null);
    setDraft("");
    setMessages((current) =>
      current.some((m) => m.id === message.id)
        ? current
        : [...current, { ...message, role: "user", delivered: false }],
    );
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(message),
        signal: AbortSignal.any([
          controller.signal,
          AbortSignal.timeout(45000),
        ]),
      });
      const data = await response.json();
      if (controller.signal.aborted) return;
      if (Array.isArray(data.messages)) setMessages(data.messages);
      if (!response.ok || !Array.isArray(data.messages))
        throw new Error(
          data.error || "Message could not be delivered. Please try again.",
        );
      if (controller.signal.aborted) return;
      setMessages(data.messages);
      setHumanMode(data.humanMode === true);
      setConnected(data.connected === true);
      setAIAvailable(data.aiAvailable === true);
      setWarning(data.warning || "");
      if (data.retryable) setRetryMessage(message);
      setDraft("");
      attempt.current = null;
    } catch (failure) {
      if (!controller.signal.aborted) {
        setRetryMessage(message);
        setError(
          failure instanceof Error && failure.name === "Error"
            ? failure.message
            : "Could not confirm delivery. Please try again.",
        );
      }
    } finally {
      if (pending.current === controller) {
        pending.current = null;
        activeMessage.current = null;
        revision.current++;
        setSendingId(null);
      }
    }
  }

  return (
    <div className="chat-live" hidden={!active}>
      <div className="chat-transcript" ref={transcript}>
        {connected === false && (
          <p className="chat-connection-note" role="status">
            {aiAvailable
              ? "AI chat is available. Personal replies are not connected yet."
              : "Chat is temporarily unavailable. Please try again later."}
          </p>
        )}
        {syncError && (
          <p className="chat-error" role="status">
            Unable to check for replies. Reconnecting…
          </p>
        )}
        <div
          className="chat-messages"
          role="log"
          aria-label="Direct conversation"
          aria-live="polite"
          aria-relevant="additions text"
        >
          {[welcome, ...messages].map((message) => (
            <div
              key={message.id}
              className={`chat-message chat-message-${message.role === "user" ? "user" : "assistant"}`}
            >
              <span className="chat-message-avatar" aria-hidden="true">
                {message.role === "user" ? (
                  <UserRound size={15} />
                ) : (
                  <Image src={profile.photo} alt="" width={24} height={24} />
                )}
              </span>
              <div className="chat-bubble">
                {message.role === "owner" && (
                  <span className="chat-personal-label">
                    Wel 
                  </span>
                )}
                <p>{message.content}</p>
              </div>
            </div>
          ))}
        </div>
        {sending &&
          !humanMode &&
          !messages.some((m) => m.id === `ai-${sendingId}`) && (
            <div
              className="chat-thinking"
              role="status"
              aria-label="Wel's AI is typing"
            >
              <span />
              <span />
              <span />
            </div>
          )}
        {warning && (
          <p className="chat-error" role="status">
            {warning}{" "}
            {retryMessage && (
              <button
                type="button"
                disabled={sending}
                onClick={() => void send(retryMessage)}
              >
                Retry
              </button>
            )}
          </p>
        )}
        {error && (
          <p className="chat-error" role="alert">
            {error}{" "}
            <button
              type="button"
              disabled={sending}
              onClick={() => void send(retryMessage || undefined)}
            >
              Retry
            </button>
          </p>
        )}
      </div>
      <footer className="chat-footer">
        <form
          className="chat-composer"
          onSubmit={(event) => {
            event.preventDefault();
            void send();
          }}
        >
          <label className="chat-sr-only" htmlFor="direct-message">
            Your message
          </label>
          <textarea
            ref={input}
            id="direct-message"
            rows={1}
            maxLength={3000}
            value={draft}
            readOnly={sending}
            placeholder="Type a message…"
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !event.shiftKey &&
                !event.nativeEvent.isComposing
              ) {
                event.preventDefault();
                void send();
              }
            }}
          />
          <button
            type="submit"
            className="chat-send"
            disabled={
              sending ||
              connected === null ||
              (!connected && !aiAvailable) ||
              !draft.trim()
            }
            aria-label="Send message"
          >
            <Send size={17} strokeWidth={1.8} />
          </button>
        </form>
      </footer>
    </div>
  );
}
