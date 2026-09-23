import { useEffect, useRef, type ReactNode } from 'react';
import { UI_ICONS } from '../kit';

/** React obal nad nativním <dialog> se styly kitu (.g92-dialog) – focus trap, Esc, klik mimo. */
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  wide,
  labelledBy,
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
  labelledBy?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      // like kit dialogs: focus the dialog itself so no focus ring lands on × when opened without keyboard use
      d.tabIndex = -1;
      d.focus({ preventScroll: true });
    }
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className={`g92-dialog ${wide ? 'g92-dialog--wide' : ''}`}
      aria-labelledby={labelledBy}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      {open ? (
        <>
          <div className="g92-dialog__head">
            <h2 className="g92-dialog__title" id={labelledBy}>
              {title}
            </h2>
            <button type="button" className="g92-btn g92-btn--ghost g92-btn--icon" aria-label="Zavřít" onClick={onClose} dangerouslySetInnerHTML={{ __html: UI_ICONS.close }} />
          </div>
          <div className="g92-dialog__body">{children}</div>
          {footer ? <div className="g92-dialog__foot">{footer}</div> : null}
        </>
      ) : null}
    </dialog>
  );
}
