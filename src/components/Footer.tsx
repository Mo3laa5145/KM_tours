import { useI18n } from '../lib/i18n'
import { SITE, whatsappLink } from '../lib/siteConfig'

export default function Footer() {
  const { t } = useI18n()
  const wa = whatsappLink()
  return (
    <footer id="contact" style={{ borderTop: '1px solid #E5E7EB', backgroundColor: '#fff' }}>
      <div className="max-w-7xl mx-auto px-6 py-10 grid gap-8 md:grid-cols-3 items-start">
        <div>
          <div className="font-display text-lg font-semibold text-[#1E293B]" dir="ltr" style={{ letterSpacing: '-0.02em' }}>
            KM Tours
          </div>
          <p className="text-sm mt-2 text-[#64748B] max-w-xs">{t('home.subtitle')}</p>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <div className="font-semibold text-[#1E293B] mb-1">{t('nav.contact')}</div>
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer" className="text-[#059669] hover:underline" dir="ltr">
              WhatsApp +{SITE.whatsapp}
            </a>
          )}
          {SITE.phone && (
            <a href={`tel:${SITE.phone.replace(/\s/g, '')}`} className="text-[#64748B] hover:text-[#1E293B]" dir="ltr">
              {SITE.phone}
            </a>
          )}
          {SITE.email && (
            <a href={`mailto:${SITE.email}`} className="text-[#64748B] hover:text-[#1E293B]">
              {SITE.email}
            </a>
          )}
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 md:justify-end">
          {(['footer.privacy', 'footer.terms', 'footer.support', 'footer.about'] as const).map((k) => (
            <span key={k} className="text-sm text-[#94A3B8]">
              {t(k)}
            </span>
          ))}
        </div>
      </div>
      <div className="border-t border-[#F1F5F9]">
        <div className="max-w-7xl mx-auto px-6 py-4 text-sm text-[#CBD5E1]">
          {t('footer.rights', { year: new Date().getFullYear() })}
        </div>
      </div>
    </footer>
  )
}
