import { hueFrom, initials } from '../lib/format';

/** Зураг байхгүй бол нэрийн эхний үсгээр дүрс үүсгэнэ (зөвшөөрөлгүй зураг ашиглахгүй). */
export default function Avatar({ name, src, size = 56 }) {
  const style = { width: size, height: size, fontSize: size * 0.36 };
  if (src) {
    return <img className="avatar" src={src} alt={name} style={style} loading="lazy" />;
  }
  const hue = hueFrom(name);
  return (
    <span
      className="avatar avatar--initials"
      style={{ ...style, background: `hsl(${hue} 55% 88%)`, color: `hsl(${hue} 60% 28%)` }}
      aria-label={name}
    >
      {initials(name)}
    </span>
  );
}
