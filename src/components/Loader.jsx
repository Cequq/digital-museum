export default function Loader({ label = 'Ачаалж байна…' }) {
  return (
    <div className="loader" role="status" aria-live="polite">
      <span className="loader__dot" />
      <span className="loader__dot" />
      <span className="loader__dot" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
