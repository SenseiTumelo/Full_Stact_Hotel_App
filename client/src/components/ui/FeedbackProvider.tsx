import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { AlertTriangle, Check, CircleAlert, Info, X } from 'lucide-react';
import Button from './Button';

type ConfirmOptions = { title: string; message: string; confirmLabel?: string; destructive?: boolean };
type Notice = { id: number; message: string; kind: 'success' | 'error' | 'info' };
type Feedback = { confirm: (options: ConfirmOptions) => Promise<boolean>; notify: (message: string, kind?: Notice['kind']) => void };
type PendingConfirm = ConfirmOptions & { resolve: (value: boolean) => void };

const FeedbackContext = createContext<Feedback | null>(null);
let noticeSequence = 0;

export function useFeedback() {
  const value = useContext(FeedbackContext);
  if (!value) throw new Error('useFeedback must be used within FeedbackProvider');
  return value;
}

export default function FeedbackProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<PendingConfirm | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const dialogRef = useRef<PendingConfirm | null>(null);
  const panelRef = useRef<HTMLElement | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => new Promise<boolean>((resolve) => {
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const pending = { ...options, resolve };
    dialogRef.current = pending;
    setDialog(pending);
  }), []);

  const notify = useCallback((message: string, kind: Notice['kind'] = 'success') => {
    const id = ++noticeSequence;
    setNotices((current) => [...current, { id, message, kind }]);
    window.setTimeout(() => setNotices((current) => current.filter((notice) => notice.id !== id)), 4200);
  }, []);

  const closeDialog = useCallback((accepted: boolean) => {
    dialogRef.current?.resolve(accepted);
    dialogRef.current = null;
    setDialog(null);
    window.setTimeout(() => returnFocusRef.current?.focus(), 0);
  }, []);

  useEffect(() => {
    if (!dialog) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeDialog(false);
      if (event.key === 'Tab' && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>('button:not(:disabled)');
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dialog, closeDialog]);

  return (
    <FeedbackContext.Provider value={{ confirm, notify }}>
      {children}
      <div className="toast-stack" aria-live="polite" aria-relevant="additions">
        {notices.map((notice) => {
          const Icon = notice.kind === 'success' ? Check : notice.kind === 'error' ? CircleAlert : Info;
          return <div className={`app-toast app-toast-${notice.kind}`} key={notice.id} role={notice.kind === 'error' ? 'alert' : 'status'}>
            <Icon size={19} aria-hidden="true" /><span>{notice.message}</span>
            <button type="button" aria-label="Dismiss notification" onClick={() => setNotices((current) => current.filter((item) => item.id !== notice.id))}><X size={16} /></button>
          </div>;
        })}
      </div>
      {dialog && <div className="dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) closeDialog(false); }}>
        <section ref={panelRef} className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-message">
          <span className={`confirm-dialog-icon${dialog.destructive ? ' is-danger' : ''}`}><AlertTriangle size={21} aria-hidden="true" /></span>
          <h2 id="confirm-title">{dialog.title}</h2>
          <p id="confirm-message">{dialog.message}</p>
          <div className="confirm-dialog-actions">
            <Button autoFocus variant="secondary" onClick={() => closeDialog(false)}>Go back</Button>
            <Button className={dialog.destructive ? 'btn-danger-solid' : ''} variant={dialog.destructive ? 'dark' : 'primary'} onClick={() => closeDialog(true)}>{dialog.confirmLabel ?? 'Confirm'}</Button>
          </div>
        </section>
      </div>}
    </FeedbackContext.Provider>
  );
}
