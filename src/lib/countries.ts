// ISO 3166-1 alpha-2 codes. Names are produced in the visitor's language with Intl.DisplayNames.
export const COUNTRY_CODES = (
  'AF AL DZ AD AO AG AR AM AU AT AZ BS BH BD BB BY BE BZ BJ BT BO BA BW BR BN BG BF BI CV KH CM CA CF TD CL CN CO KM CG CD CR CI HR CU CY CZ ' +
  'DK DJ DM DO EC EG SV GQ ER EE SZ ET FJ FI FR GA GM GE DE GH GR GD GT GN GW GY HT HN HK HU IS IN ID IR IQ IE IL IT JM JP JO KZ KE KI KW KG ' +
  'LA LV LB LS LR LY LI LT LU MO MG MW MY MV ML MT MH MR MU MX FM MD MC MN ME MA MZ MM NA NR NP NL NZ NI NE NG KP MK NO OM PK PW PS PA PG PY PE ' +
  'PH PL PT PR QA RO RU RW KN LC VC WS SM ST SA SN RS SC SL SG SK SI SB SO ZA KR SS ES LK SD SR SE CH SY TW TJ TZ TH TL TG TO TT TN TR TM TV UG ' +
  'UA AE GB US UY UZ VU VA VE VN YE ZM ZW'
).split(' ')

/** Countries shown first in the nationality list (main tourist markets). */
export const PRIORITY_COUNTRIES = ['EG', 'DE', 'FR', 'GB', 'IT', 'RU', 'PL', 'US', 'SA', 'AE']

const cache = new Map<string, Intl.DisplayNames | null>()

function displayNames(lang: string): Intl.DisplayNames | null {
  if (!cache.has(lang)) {
    try {
      cache.set(lang, new Intl.DisplayNames([lang], { type: 'region' }))
    } catch {
      cache.set(lang, null)
    }
  }
  return cache.get(lang) ?? null
}

export function countryName(code: string | null | undefined, lang: string): string {
  if (!code || code === '??') return lang === 'ar' ? 'غير معروف' : 'Unknown'
  try {
    return displayNames(lang)?.of(code.toUpperCase()) ?? code
  } catch {
    return code
  }
}

export function flagEmoji(code: string | null | undefined): string {
  if (!code || code.length !== 2 || code === '??') return '🌐'
  return String.fromCodePoint(...code.toUpperCase().split('').map((c) => 0x1f1e6 + c.charCodeAt(0) - 65))
}

export function sortedCountries(lang: string): { code: string; name: string }[] {
  const all = COUNTRY_CODES.map((code) => ({ code, name: countryName(code, lang) }))
  const priority = PRIORITY_COUNTRIES.map((c) => all.find((x) => x.code === c)!).filter(Boolean)
  const rest = all
    .filter((x) => !PRIORITY_COUNTRIES.includes(x.code))
    .sort((a, b) => a.name.localeCompare(b.name, lang))
  return [...priority, ...rest]
}
