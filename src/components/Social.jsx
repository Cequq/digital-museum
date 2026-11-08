import { parseSocial } from '../lib/social';

const ICONS = {
  instagram: (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
      <path d="M14 8h3V4h-3c-2.8 0-4 1.7-4 4.3V10H7v4h3v8h4v-8h3l1-4h-4V8.6c0-.4.3-.6.6-.6z" />
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
      <path d="M22 8.2a3 3 0 0 0-2.1-2.1C18 5.6 12 5.6 12 5.6s-6 0-7.9.5A3 3 0 0 0 2 8.2 31 31 0 0 0 1.6 12 31 31 0 0 0 2 15.8a3 3 0 0 0 2.1 2.1c1.9.5 7.9.5 7.9.5s6 0 7.9-.5a3 3 0 0 0 2.1-2.1c.3-1.2.4-2.5.4-3.8s-.1-2.6-.4-3.8zM10 15V9l5.2 3z" />
    </svg>
  ),
  web: (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </svg>
  ),
};

/** "Эх сурвалж: Instagram ↗" маягийн жижиг холбоос */
export function SourceLink({ url, prefix = 'Эх сурвалж', className = '' }) {
  const info = parseSocial(url);
  if (!info) return null;
  return (
    <a href={url} target="_blank" rel="noreferrer" className={`source source--${info.platform} ${className}`}
      onClick={(e) => e.stopPropagation()}>
      {ICONS[info.platform]}
      <span>{prefix ? `${prefix}: ` : ''}{info.label} ↗</span>
    </a>
  );
}

/** Instagram / Facebook / YouTube постыг iframe-ээр харуулна; embed боломжгүй бол холбоос болно. */
export function SocialEmbed({ url }) {
  const info = parseSocial(url);
  if (!info) return null;
  if (!info.embedUrl) {
    return (
      <a href={url} target="_blank" rel="noreferrer" className={`social-card social-card--${info.platform}`}>
        {ICONS[info.platform]} <span>{info.label} дээр үзэх ↗</span>
      </a>
    );
  }
  const tall = info.platform !== 'youtube';
  return (
    <figure className={`embed embed--${info.platform}`}>
      <iframe
        src={info.embedUrl}
        title={`${info.label} пост`}
        loading="lazy"
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        allowFullScreen
        style={tall ? { height: 620 } : undefined}
      />
      <figcaption><SourceLink url={url} prefix="" /></figcaption>
    </figure>
  );
}
