/**
 * Сошиал холбоосыг таньж, embed хийх URL болгоно.
 * Instagram/Facebook-ийн зургийн шууд холбоос (CDN) хэсэг хугацааны дараа хүчингүй болдог тул
 * зургийг татаж хуулахын оронд постыг өөрийнх нь embed-ээр харуулна — эх сурвалж, зохиогч хадгалагдана.
 */
export function parseSocial(url) {
  if (!url) return null;
  let u;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^www\.|^m\.|^web\./, '');

  if (host === 'instagram.com') {
    const m = u.pathname.match(/^\/(p|reel|tv)\/([\w-]+)/);
    return {
      platform: 'instagram',
      label: 'Instagram',
      embedUrl: m ? `https://www.instagram.com/${m[1]}/${m[2]}/embed/captioned/` : null,
      url,
    };
  }

  if (host === 'facebook.com' || host === 'fb.watch') {
    const isVideo = /\/videos\/|\/watch|\/reel\//.test(u.pathname) || host === 'fb.watch';
    const isPost = isVideo || /\/posts\/|\/photos?\/|story\.php|permalink\.php|\/share\/p\//.test(u.pathname + u.search);
    const plugin = isVideo ? 'video' : 'post';
    return {
      platform: 'facebook',
      label: 'Facebook',
      embedUrl: isPost
        ? `https://www.facebook.com/plugins/${plugin}.php?href=${encodeURIComponent(url)}&show_text=true&width=500`
        : null,
      url,
    };
  }

  if (host === 'youtube.com' || host === 'youtu.be') {
    const id = host === 'youtu.be'
      ? u.pathname.slice(1)
      : u.searchParams.get('v') || u.pathname.match(/\/(shorts|embed)\/([\w-]+)/)?.[2];
    return {
      platform: 'youtube',
      label: 'YouTube',
      embedUrl: id ? `https://www.youtube-nocookie.com/embed/${id}` : null,
      url,
    };
  }

  return { platform: 'web', label: host, embedUrl: null, url };
}

/** Тэнхим / сургуулийн албан ёсны сувгууд */
export const OFFICIAL_CHANNELS = [
  { label: 'Facebook', url: 'https://www.facebook.com/ufe.edu.mn' },
  { label: 'Instagram', url: 'https://www.instagram.com/ufe.edu.mn/' },
  { label: 'YouTube', url: 'https://www.youtube.com/@ufemedia' },
];
