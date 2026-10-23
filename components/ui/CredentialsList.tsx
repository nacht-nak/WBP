"use client";

import { useEffect, useId, useRef, useState, type MouseEvent } from "react";
import Image from "next/image";
import { Expand, X } from "lucide-react";
import { certifications, training, type Credential } from "@/data/profile";

function CredentialEntry({
  item,
  dialogId,
  onOpen,
}: {
  item: Credential;
  dialogId: string;
  onOpen: (item: Credential, event: MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <article className="credential-entry">
      <span className="credential-date">{item.date}</span>
      <button
        type="button"
        className="credential-thumbnail"
        onClick={(event) => onOpen(item, event)}
        aria-label={`Open ${item.title} certificate`}
        aria-haspopup="dialog"
        aria-controls={dialogId}
      >
        <Image
          src={item.image}
          alt={`${item.title} certificate`}
          width={94}
          height={60}
          sizes="(max-width: 650px) 68px, 94px"
        />
      </button>
      <div className="credential-copy">
        <h4>{item.title}</h4>
        <p>{item.issuer}</p>
        <button
          type="button"
          className="credential-link"
          onClick={(event) => onOpen(item, event)}
          aria-label={`View ${item.title} certificate`}
          aria-haspopup="dialog"
          aria-controls={dialogId}
        >
          View certificate
          <Expand size={11} aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}

export function CredentialsList({ preview = false }: { preview?: boolean }) {
  const dialogId = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [selected, setSelected] = useState<Credential | null>(null);
  const credentials = preview ? certifications.slice(0, 1) : certifications;
  const courses = preview ? training.slice(0, 2) : training;

  useEffect(() => {
    const modal = dialog.current;
    if (!selected || !modal) return;

    const previousOverflow = document.body.style.overflow;
    modal.showModal();
    modal.scrollTop = 0;
    document.body.style.overflow = "hidden";

    return () => {
      modal.close();
      document.body.style.overflow = previousOverflow;
      if (trigger.current?.getClientRects().length) {
        trigger.current.focus({ preventScroll: true });
      }
    };
  }, [selected]);

  function open(item: Credential, event: MouseEvent<HTMLButtonElement>) {
    trigger.current = event.currentTarget;
    setSelected(item);
  }

  function closeOnBackdrop(event: MouseEvent<HTMLDialogElement>) {
    if (event.target !== event.currentTarget) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    ) {
      event.currentTarget.close();
    }
  }

  return (
    <div className="credentials-list">
      {credentials.length > 0 && (
        <div className="credential-group">
          <h3 className="credential-label">Certificates &amp; memberships</h3>
          {credentials.map((item) => (
            <CredentialEntry
              key={item.title}
              item={item}
              dialogId={dialogId}
              onOpen={open}
            />
          ))}
        </div>
      )}
      {courses.length > 0 && (
        <div className="credential-group training-group">
          <h3 className="credential-label">Training &amp; webinars</h3>
          {courses.map((item) => (
            <CredentialEntry
              key={item.title}
              item={item}
              dialogId={dialogId}
              onOpen={open}
            />
          ))}
        </div>
      )}
      <dialog
        ref={dialog}
        id={dialogId}
        className="certificate-dialog"
        aria-labelledby={`${dialogId}-title`}
        aria-describedby={`${dialogId}-description`}
        onClose={() => setSelected(null)}
        onClick={closeOnBackdrop}
      >
        {selected && (
          <>
            <div className="certificate-dialog-header">
              <span>Certificate details</span>
              <button
                type="button"
                className="certificate-dialog-close"
                onClick={() => dialog.current?.close()}
                aria-label="Close certificate"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <div className="certificate-dialog-content">
              <div className="certificate-dialog-image">
                <Image
                  src={selected.fullImage}
                  alt={`${selected.title} certificate awarded to Welquim Panogaling`}
                  width={selected.imageWidth}
                  height={selected.imageHeight}
                  unoptimized
                  loading="eager"
                />
              </div>
              <div className="certificate-dialog-details">
                <span className="certificate-dialog-date">{selected.date}</span>
                <h2 id={`${dialogId}-title`}>{selected.title}</h2>
                <p className="certificate-dialog-issuer">{selected.issuer}</p>
                <div className="certificate-dialog-description">
                  <h3>About this certificate</h3>
                  <p id={`${dialogId}-description`}>{selected.description}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </dialog>
    </div>
  );
}
