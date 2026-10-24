import React, { useEffect, useRef } from "react";

// Accessible modal: Escape / backdrop click closes, body scroll locked, focus moved inside
export default function Modal({ onClose, labelledBy, children, className = "max-w-md" }) {
  const panel = useRef(null);
  // Keep the latest onClose without re-running the effect (which would steal focus on every render)
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const previouslyFocused = document.activeElement;
    const first = panel.current?.querySelector("input, button, select, textarea, [href]");
    first?.focus();

    const onKey = (e) => e.key === "Escape" && closeRef.current();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      previouslyFocused?.focus?.();
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[1000] flex animate-fade-in items-end justify-center bg-cocoa-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={`relative max-h-[92vh] w-full animate-slide-up overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl sm:p-8 ${className}`}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-xl text-cocoa-400 hover:bg-sand-100 hover:text-cocoa-800"
          aria-label="Close"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}

export function ConfirmDialog({ title, message, confirmLabel = "Confirm", busy, onConfirm, onCancel }) {
  return (
    <Modal onClose={busy ? () => {} : onCancel} labelledBy="confirm-title" className="max-w-sm">
      <h2 id="confirm-title" className="m-0 pr-8 text-lg font-bold">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-cocoa-600">{message}</p>
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={busy}>
          Cancel
        </button>
        <button type="button" className="btn-danger" onClick={onConfirm} disabled={busy}>
          {busy && <span className="spinner" />}
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
