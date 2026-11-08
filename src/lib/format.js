const MONTHS = ['1-р сар', '2-р сар', '3-р сар', '4-р сар', '5-р сар', '6-р сар',
  '7-р сар', '8-р сар', '9-р сар', '10-р сар', '11-р сар', '12-р сар'];

export function formatDate(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return `${d.getFullYear()} оны ${MONTHS[d.getMonth()]}ын ${d.getDate()}`;
}

export function initials(name = '') {
  const clean = name.replace(/[※()]/g, '').trim();
  const parts = clean.split(/[\s.]+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** "React, Supabase , Python" → ['React','Supabase','Python'] */
export function parseList(text) {
  return text
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function isValidUrl(value) {
  if (!value) return true;
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

/** Нэрээс тогтвортой өнгө (зураггүй картын дэвсгэрт) */
export function hueFrom(text = '') {
  let h = 0;
  for (let i = 0; i < text.length; i += 1) h = (h * 31 + text.charCodeAt(i)) % 360;
  return h;
}
