// All content sourced from mechanical-seal-germany.com (pages, type lists, images, data sheets)
import catalog from './catalog.json'

const SRC = 'https://www.mechanical-seal-germany.com'
const { types, extras } = catalog
const withImage = (list) => list.filter((g) => g.image)

export const company = {
  name: 'Mechanical Seals Germany',
  operator: 'SAP Parts Europe GmbH',
  since: 2009,
  street: 'Benzstrasse 21',
  city: '51381 Leverkusen',
  country: 'Germany',
  phone: '+49 2171 3629923',
  mobile: '+49 155 65683852',
  email: 'tanwiri@sapparts.com',
}

export const legal = {
  managers: 'Steven Chugh, Johannes Orlowski',
  court: 'Amtsgericht Cologne, Germany',
  register: 'HRB 82724',
  vat: 'DE300917783',
  privacyEmail: 'europe@sapparts.com',
  odr: 'https://ec.europa.eu/consumers/odr',
  privacyUrl: `${SRC}/impressum.html`,
}

// Notice shown on the original homepage (translated from German)
export const notice = {
  title: 'Dealer prices for end customers',
  text: 'For cartridge seals, whether Type SQE single or Type DB double cartridge, end customers can now order at dealer purchase prices.',
}

export const categories = [
  { id: 'cartridge', label: 'Cartridge & agitator' },
  { id: 'component', label: 'Component seals' },
  { id: 'special', label: 'Special & custom' },
  { id: 'elements', label: 'Sealing elements' },
]

export const products = [
  {
    slug: 'cartridge-seals',
    name: 'Cartridge Seals',
    code: 'Type D ATEX',
    category: 'cartridge',
    image: '/img/cartridge.jpg',
    short: 'Single or double configuration, with or without protective sleeve.',
    heading: 'Cartridge seals, engineered for reliability and performance',
    intro: 'Our cartridge seals are designed for maximum operational safety, easy installation, and long-term reliability. Built for demanding applications, they provide consistent sealing performance even under extreme conditions.',
    note: 'Engineered for extremes: cartridges with heat resistance up to 450 °C. Other versions available on request.',
    highlights: ['Up to 450 °C', 'API 682 up to 60 bar', 'Single & double'],
    types: types.cartridges,
    link: `${SRC}/cartridges.html`,
  },
  {
    slug: 'metal-bellows',
    name: 'Metal Bellows Seals',
    code: 'Type 16HT',
    category: 'component',
    image: '/img/metal-bellows.jpg',
    short: 'Precision for high-temperature applications, up to 450 °C.',
    heading: 'Metal bellows seals, precision for high-temperature applications',
    intro: 'Metal bellows seals are ideal for high-temperature and high-pressure environments where durability and precision are critical.',
    note: 'Unique: metal bellows mechanical seal with heat resistance up to 450 °C.',
    highlights: ['Up to 450 °C', 'High pressure', 'DIN 24960'],
    types: types.metallfaltenbalg,
    link: `${SRC}/metallfaltenbalg.html`,
  },
  {
    slug: 'splitted-seals',
    name: 'Splitted Mechanical Seals',
    code: 'Type 85',
    category: 'special',
    image: '/img/splitted.jpg',
    short: 'Install without dismantling machinery. Minimise downtime.',
    heading: 'Split mechanical seals, minimise downtime and maintenance',
    intro: 'Split seals allow installation without dismantling machinery, reducing downtime and maintenance costs significantly.',
    highlights: ['Patented', 'No disassembly', 'Less downtime'],
    types: types['geteilte-gleitringdichtungen'],
    link: `${SRC}/geteilte-gleitringdichtungen.html`,
  },
  {
    slug: 'agitator-seals',
    name: 'Agitator Seals',
    code: 'Type 70',
    category: 'cartridge',
    image: '/img/agitator.jpg',
    short: 'Single or double configuration, with or without integrated bearing.',
    heading: 'Agitator seals, reliable performance in mixing systems',
    intro: 'Our agitator seals are engineered for demanding mixing processes and provide long-lasting sealing performance. Mixer (agitator) seals in single or double configuration, with or without integrated bearing.',
    highlights: ['Integrated bearing', 'Dry-running', 'Biogas'],
    types: types.ruehrwerksdichtungen,
    link: `${SRC}/ruehrwerksdichtungen.html`,
  },
  {
    slug: 'elastomer-bellows',
    name: 'Elastomer Bellows Seals',
    code: 'Type 9C',
    category: 'component',
    image: '/img/elastomer-bellows.jpg',
    short: 'Flexible and cost-effective sealing for a wide range of uses.',
    heading: 'Elastomer bellows seals, flexible and cost-effective solutions',
    intro: 'Elastomer bellows seals provide excellent flexibility and reliable sealing performance across a wide range of industrial applications.',
    highlights: ['Flexible', 'Cost-effective', '9 types'],
    types: types['gummibalg-gleitringdichtungen'],
    link: `${SRC}/gummibalg-gleitringdichtungen.html`,
  },
  {
    slug: 'high-pressure',
    name: 'High Pressure Seals',
    code: 'Type 13H',
    category: 'component',
    image: '/img/high-pressure.jpg',
    short: 'Built for extreme conditions, up to 60 bar as API 610.',
    heading: 'High pressure mechanical seals, built for extreme conditions',
    intro: 'Our high-pressure mechanical seals are engineered to withstand the most demanding environments. Designed for durability, safety, and performance under extreme pressure conditions.',
    highlights: ['Up to 60 bar', 'API 610', '17 types'],
    types: types['hochdruck-gleitringdichtungen'],
    link: `${SRC}/hochdruck-gleitringdichtungen.html`,
  },
  {
    slug: 'stationary-seals',
    name: 'Stationary Mechanical Seals',
    code: 'Type B100',
    category: 'component',
    image: types['stationaere-gleitringdichtungen'][0].image,
    short: 'Developed by engineers, tailored to your application.',
    heading: 'Stationary mechanical seals, engineering solutions you can trust',
    intro: 'Developed by engineers, tailored to your application. All cartridges are approved for safe operation at 8 bar pressure.',
    note: 'All cartridge units and cartridge-mounted designs are also classified as stationary mechanical seals.',
    highlights: ['8 bar approved', 'Stationary', 'Cartridge-mounted'],
    types: types['stationaere-gleitringdichtungen'],
    link: `${SRC}/stationaere-gleitringdichtungen.html`,
  },
  {
    slug: 'sterile-seals',
    name: 'Sterile Seals',
    code: 'All-in-One',
    category: 'special',
    image: '/img/sterile.jpg',
    short: 'Hygienic solutions for pharma, food and biotech.',
    heading: 'Sterile mechanical seals, hygienic solutions for sensitive industries',
    intro: 'Designed for pharmaceutical, food, and biotech industries, our sterile seals meet the highest hygiene standards.',
    highlights: ['Pharma', 'Food', 'Biotech'],
    types: types.sterildichtungen,
    link: `${SRC}/sterildichtungen.html`,
  },
  {
    slug: 'custom-seals',
    name: 'Customized Seals',
    code: 'Type 14A',
    category: 'special',
    image: '/img/custom.jpg',
    short: 'Fully customised seals for complex technical challenges.',
    heading: 'Custom mechanical seals, engineered for your application',
    intro: 'We develop fully customized sealing solutions for complex technical challenges and demanding process requirements.',
    highlights: ['To drawing', 'Alternatives', 'Special builds'],
    types: [],
    gallery: withImage(extras.custom),
    link: `${SRC}/sonderdichtungen.html`,
  },
  {
    slug: 'externally-mounted',
    name: 'Externally Mounted Seals',
    code: 'Type 14',
    category: 'component',
    image: '/img/external.jpg',
    short: 'Externally mounted mechanical seals.',
    heading: 'Externally mounted mechanical seals',
    intro: 'Externally mounted mechanical seal, Type 14. Download the data sheet or send us a request.',
    highlights: ['Type 14', 'Data sheet'],
    types: [{ name: 'Type 14 externally mounted mechanical seal', image: '/img/external.jpg', datasheets: [`${SRC}/images/document/1736831/Typ14Druck.pdf`] }],
    link: `${SRC}/images/document/1736831/Typ14Druck.pdf`,
  },
  {
    slug: 'radial-shaft-seals',
    name: 'Radial Shaft Seals',
    code: 'Piston · Rod · U-cup',
    category: 'elements',
    image: '/img/radial-shaft.jpg',
    short: 'Hydraulic and pneumatic elements: piston, rod and U-cup seals.',
    heading: 'Radial shaft seals, reliable sealing for rotating equipment',
    intro: 'High-quality radial shaft seals designed for durability and dependable performance in demanding industrial applications. Hydraulic and pneumatic sealing elements: piston seals, rod seals, and U-cup seals.',
    highlights: ['Hydraulic', 'Pneumatic', 'Rod & piston'],
    types: [{ name: 'Radial shaft seals, piston seals, rod seals, U-cup seals', image: '/img/radial-shaft.jpg', datasheets: [`${SRC}/images/0/1746781/Protektor....pdf`] }],
    gallery: withImage(extras.radial),
    link: `${SRC}/radialwellendichtringe.html`,
  },
  {
    slug: 'wp11-water-pump',
    name: 'WP11 Water Pump Seal',
    code: 'Type WP11',
    category: 'component',
    image: '/img/wp11.jpg',
    short: 'Type WP11 mechanical seal for water pumps.',
    heading: 'Type WP11 mechanical seal for water pumps',
    intro: 'Type WP11 mechanical seal for water pumps. Download the data sheet or send us a request.',
    highlights: ['Water pumps', 'Data sheet'],
    types: [{ name: 'Type WP11 mechanical seal for water pumps', image: '/img/wp11.jpg', datasheets: [`${SRC}/images/document/1776362/WP11.pdf`] }],
    link: `${SRC}/images/document/1776362/WP11.pdf`,
  },
  {
    slug: 'rotary-unions',
    name: 'Rotary Unions',
    code: 'Type DD',
    category: 'elements',
    image: '/img/rotary-union.jpg',
    short: 'Efficient fluid transfer in motion systems.',
    heading: 'Rotary unions, efficient fluid transfer in motion systems',
    intro: 'Our rotary unions ensure reliable and safe transfer of fluids in rotating equipment across various industries.',
    highlights: ['Type DD', 'Rotating equipment'],
    types: types.drehdurchfuehrungen,
    link: `${SRC}/drehdurchfuehrungen.html`,
  },
  {
    slug: 'seal-faces',
    name: 'SiC, WC, Carbon & Ceramic Faces',
    code: 'To drawing',
    category: 'elements',
    image: withImage(extras.custom)[1]?.image,
    short: 'Precision seal faces manufactured according to your drawing.',
    heading: 'Advanced seal faces, silicon carbide, tungsten carbide & carbon',
    intro: 'We manufacture precision seal faces from high-performance materials tailored to your exact application requirements. Please send us your request. We can provide your part according to your drawing in several materials.',
    highlights: ['SiC', 'WC', 'Carbon', 'Ceramic'],
    types: [],
    link: `${SRC}/sic-wc-kohle-keramik-anfertigung-nach-zeichnung.html`,
  },
  {
    slug: 'defense-applications',
    name: 'Defense Applications',
    code: 'Defense',
    category: 'special',
    image: withImage(extras.defense)[0]?.image,
    short: 'Sealing for defense and highly specialised applications.',
    heading: 'Mechanical seals for defense and specialised applications',
    intro: 'We provide advanced sealing solutions for defense-related and highly specialized applications where reliability and precision are essential.',
    highlights: ['Defense', 'Specialised'],
    types: [],
    gallery: withImage(extras.defense),
    link: `${SRC}/wehrtechnik.html`,
  },
  {
    slug: 'metallic-rings-carbon-segments',
    name: 'Metallic Rings & Carbon Segment Seals',
    code: 'On request',
    category: 'elements',
    image: null,
    short: 'C & E metallic sealing rings and carbon segment seals, on request.',
    heading: 'C & E metallic sealing rings, carbon segment seals',
    intro: 'C & E metallic sealing rings and carbon segment seals (Kohle-Segmentdichtungen) are available on request.',
    highlights: ['C-rings', 'E-rings', 'Carbon segments'],
    types: [],
    link: `${SRC}/produkte.html`,
  },
]

export const companyGallery = withImage(extras.company)

export const typeCount = new Set(
  products.flatMap((p) => p.types.map((t) => t.name.split(/[ ,]/).slice(0, 2).join(' '))),
).size

export const services = [
  { title: 'SiC, WC, carbon & ceramic', text: 'Seal faces manufactured according to your drawing.', to: '/products/seal-faces' },
  { title: 'Defense applications', text: 'Sealing solutions for defense and specialised uses.', to: '/products/defense-applications' },
  { title: 'Customized seals', text: 'Special designs for complex technical challenges.', to: '/products/custom-seals' },
]

export const industries = [
  'Pharmaceutical',
  'Food',
  'Biotech',
  'Biogas',
  'Mixing systems',
  'Water pumps',
  'Rotating equipment',
  'Defense',
]

// Flat, searchable index of every seal type (type number, name, family)
const typeCode = (name) => {
  const m = name.match(/^Typ(?:e)?\s+(.+?)(?:[,(]|\s(?=[a-z])|$)/)
  return m ? m[1].trim() : null
}

export const searchIndex = products.flatMap((p) => {
  const rows = p.types.map((t) => ({
    key: `${p.slug}:${t.name}`,
    title: t.name.replace(/^Typ(?:e)?\s+\S+\s*,?\s*/i, '').replace(/^./, (c) => c.toUpperCase()) || t.name,
    code: typeCode(t.name) || p.code,
    name: t.name,
    family: p.name,
    image: t.image || p.image,
    slug: p.slug,
  }))
  rows.push({ key: p.slug, title: p.name, code: p.code.replace(/^Type\s+/, ''), name: p.name, family: p.name, image: p.image, slug: p.slug, isFamily: true })
  return rows
})

export function searchSeals(q, limit = 6) {
  const s = q.trim().toLowerCase()
  if (!s) return []
  const scored = []
  for (const r of searchIndex) {
    const code = (r.code || '').toLowerCase()
    let match = null
    let score = 0
    if (code === s || code.replace(/\s/g, '') === s.replace(/\s/g, '')) { match = 'Type no. match'; score = 4 }
    else if (code.includes(s)) { match = 'Type no. match'; score = 3 }
    else if (r.name.toLowerCase().includes(s)) { match = 'Product name match'; score = 2 }
    else if (r.family.toLowerCase().includes(s)) { match = 'Seal family match'; score = 1 }
    if (match) scored.push({ ...r, match, score: score + (r.isFamily ? 0.5 : 0) })
  }
  const seen = new Set()
  return scored
    .sort((a, b) => b.score - a.score)
    .filter((r) => {
      const k = `${r.code}|${r.title.replace(/[^a-z0-9]/gi, '').toLowerCase()}`
      if (seen.has(k)) return false
      seen.add(k)
      return true
    })
    .slice(0, limit)
}

// Photos (Unsplash License, free for commercial use)
const us = (id, w = 1600) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=75`
export const photos = {
  refinery: us('1588011930968-eadac80e6a5a'),
  cnc: us('1713371398485-7bde1bde9def'),
  office: us('1787165574896-adae5bec834b'),
}

export const applications = [
  { id: 'chemical', label: 'Chemical', text: 'Chemical processing, transfer and mixing systems.', img: us('1704130092069-30ae33e2def0', 900), products: ['cartridge-seals', 'metal-bellows', 'agitator-seals', 'high-pressure'] },
  { id: 'oil-gas', label: 'Oil & Gas', text: 'Reliable sealing for upstream, midstream and downstream operations.', img: us('1509390288171-ce2088f7d08e', 900), products: ['cartridge-seals', 'high-pressure', 'metal-bellows', 'splitted-seals'] },
  { id: 'water', label: 'Water &\u00a0Wastewater', text: 'Durable sealing solutions for water treatment and utilities.', img: us('1644389355109-15b26f71c36b', 900), products: ['wp11-water-pump', 'elastomer-bellows', 'cartridge-seals', 'stationary-seals'] },
  { id: 'power', label: 'Power', text: 'High-reliability seals for power generation equipment.', img: us('1591200834528-4050ce99fe78', 900), products: ['metal-bellows', 'high-pressure', 'cartridge-seals', 'rotary-unions'] },
  { id: 'process', label: 'Process Industries', text: 'Engineered for demanding process conditions.', img: us('1794097546231-2011af367c5c', 900), products: ['sterile-seals', 'agitator-seals', 'cartridge-seals', 'splitted-seals', 'stationary-seals'] },
  { id: 'general', label: 'General Industrial', text: 'Versatile sealing solutions for a wide range of industrial equipment.', img: us('1566221857770-508d35ee6220', 900), products: ['elastomer-bellows', 'externally-mounted', 'radial-shaft-seals', 'custom-seals', 'seal-faces', 'metallic-rings-carbon-segments', 'defense-applications', 'rotary-unions'] },
]

// Equipment each family is used on (from product descriptions)
export const equipment = {
  'cartridge-seals': ['Pumps'], 'metal-bellows': ['Pumps', 'Compressors'], 'splitted-seals': ['Pumps', 'Agitators'],
  'agitator-seals': ['Agitators'], 'elastomer-bellows': ['Pumps'], 'high-pressure': ['Pumps', 'Compressors'],
  'stationary-seals': ['Pumps'], 'sterile-seals': ['Pumps', 'Agitators'], 'custom-seals': ['Other'],
  'externally-mounted': ['Pumps'], 'radial-shaft-seals': ['Other'], 'wp11-water-pump': ['Pumps'],
  'rotary-unions': ['Other'], 'seal-faces': ['Other'], 'defense-applications': ['Other'], 'metallic-rings-carbon-segments': ['Other'],
}
export const faceMaterials = ['Carbon', 'Silicon Carbide', 'Tungsten Carbide', 'Ceramic']
