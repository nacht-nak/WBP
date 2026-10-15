"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import Image from "next/image";
import { profile } from "@/data/profile";
import { LiveChat } from "@/components/ui/LiveChat";

export function ContactChat() {
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (open) {
      dialog.current?.showModal();
      dialog.current?.querySelector("textarea")?.focus();
    } else if (dialog.current?.open) dialog.current.close();
  }, [open]);
  function close() {
    setOpen(false);
    launcher.current?.focus();
  }
  return (
    <>
      <button
        ref={launcher}
        className="floating-contact"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="contact-chat"
      >
        <MessageCircle size={20} strokeWidth={1.8} aria-hidden="true" />
        <span>Chat with Wel</span>
      </button>
      <dialog
        ref={dialog}
        id="contact-chat"
        className="contact-chat"
        aria-labelledby="chat-title"
        onCancel={close}
        onClose={close}
      >
        <div className="chat-shell">
          <header className="chat-header">
            <span className="chat-avatar">
              <Image src={profile.photo} alt="" width={36} height={36} />
              <span className="chat-presence" aria-hidden="true" />
            </span>
          <div className="chat-heading">
  <h2 id="chat-title">Chat with Wel</h2>
  <p className="chat-status">
    <span className="status-dot" />
    ONLINE
  </p>
</div>
            <button
              type="button"
              className="chat-icon-button"
              onClick={close}
              aria-label="Close chat"
            >
              <X size={20} />
            </button>
          </header>
          <LiveChat active={open} />
        </div>
      </dialog>
    </>
  );
}
