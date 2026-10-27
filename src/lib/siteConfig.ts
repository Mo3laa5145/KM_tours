// Contact details shown on the site. Set them in .env (see .env.example).
const env = import.meta.env

export const SITE = {
  name: 'KM Tours',
  whatsapp: ((env.VITE_WHATSAPP_NUMBER as string | undefined) || '201555382365').replace(/[^\d]/g, ''),
  email: (env.VITE_CONTACT_EMAIL as string | undefined) ?? '',
  phone: (env.VITE_CONTACT_PHONE as string | undefined) || '+20 155 538 2365',
}

export function whatsappLink(text?: string): string | null {
  if (!SITE.whatsapp) return null
  return `https://wa.me/${SITE.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`
}
