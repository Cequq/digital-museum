export default function EmptyState({ title = 'Илэрц олдсонгүй', children, action }) {
  return (
    <div className="empty">
      <div className="empty__icon" aria-hidden="true">
        <svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="6" y="10" width="36" height="28" rx="3" />
          <path d="M6 18h36M16 26h16M20 32h8" strokeLinecap="round" />
        </svg>
      </div>
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}
