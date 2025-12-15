import React from 'react';

export function Loader({ label = 'Loading...' }) {
  return (
    <div className="card pad" role="status" aria-live="polite">
      <div className="muted">{label}</div>
    </div>
  );
}

export function ErrorBlock({ error }) {
  if (!error) return null;
  const message = typeof error === 'string' ? error : (error.message || 'Something went wrong');
  return (
    <div className="card pad" role="alert" aria-live="assertive" style={{ borderColor: '#EF4444' }}>
      <div style={{ color: '#B91C1C', fontWeight: 700, marginBottom: 6 }}>Error</div>
      <div className="muted">{message}</div>
    </div>
  );
}

export function EmptyState({ title = 'No data', description = 'There is nothing here yet.', action }) {
  return (
    <div className="card pad" style={{ textAlign: 'center' }}>
      <div className="section-title">{title}</div>
      <div className="muted" style={{ marginBottom: 10 }}>{description}</div>
      {action}
    </div>
  );
}

export function Modal({ title, open, onClose, children, footer }) {
  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label={title}
         style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.35)', display: 'grid', placeItems: 'center', padding: 16, zIndex: 50 }}>
      <div className="card pad" style={{ width: '100%', maxWidth: 560 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div className="section-title">{title}</div>
          <button className="btn" onClick={onClose} aria-label="Close modal">✕</button>
        </div>
        <div style={{ display: 'grid', gap: 12 }}>
          {children}
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 14 }}>
          {footer}
        </div>
      </div>
    </div>
  );
}
