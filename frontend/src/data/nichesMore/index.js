import { make } from '../nichesExtra.js'
import health from './health.js'
import family from './family.js'
import home from './home.js'
import b2b from './b2b.js'
import retail from './retail.js'

/**
 * Ниши второй волны: тот же шаблон посадочной и витрина с палитрой,
 * калькулятором, путём клиента и своей 3D-сценой в hero.
 * Ниша без сцены (нет в scenes) показывает плакат в палитре ниши.
 */
const all = [...health, ...family, ...home, ...b2b, ...retail]

// slug ниши → сцена из landings/scenes; кадр для облегчённого режима лежит в /img/niches/<сцена>
const scenes = {
  stomatologiya: 'dental',
  veterinariya: 'vet',
  fitnes: 'fitness',
  'detskie-centry': 'kids',
  turizm: 'travel',
  ivent: 'event',
  'agentstva-nedvizhimosti': 'realty',
  'okna-dveri': 'windows',
  'derevyannye-doma': 'loghouse',
  'inzhenernye-sistemy': 'engineering',
  spectehnika: 'machinery',
  ohrana: 'security',
  buhgalteriya: 'accounting',
  opt: 'wholesale',
  'kadrovye-agentstva': 'staffing',
  'internet-magaziny': 'shop',
  'remont-tehniki': 'repair',
  cvety: 'flowers',
}

const calcLead = 'Подставьте свои цифры и отметьте, что про вас. Посчитаем, сколько выручки за год уходит конкурентам.'

export const moreNiches = all.map(({ show, ...n }) => make(n))

export const moreShowcase = Object.fromEntries(
  all.map(({ slug, show }) => [slug, { scene: scenes[slug] || null, still: scenes[slug] ? `/img/niches/${scenes[slug]}` : null, ...show, calc: { lead: calcLead, ...show.calc } }]),
)
