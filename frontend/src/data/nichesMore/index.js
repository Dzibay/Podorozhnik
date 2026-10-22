import { make } from '../nichesExtra.js'
import health from './health.js'
import family from './family.js'
import home from './home.js'
import b2b from './b2b.js'
import retail from './retail.js'

/**
 * Ниши второй волны: тот же шаблон посадочной и витрина с палитрой,
 * калькулятором и путём клиента — но без 3D-сцены (scene: null),
 * вместо неё в hero плакат в палитре ниши.
 */
const all = [...health, ...family, ...home, ...b2b, ...retail]

const calcLead = 'Подставьте свои цифры и отметьте, что про вас. Посчитаем, сколько выручки за год уходит конкурентам.'

export const moreNiches = all.map(({ show, ...n }) => make(n))

export const moreShowcase = Object.fromEntries(
  all.map(({ slug, show }) => [slug, { scene: null, still: null, ...show, calc: { lead: calcLead, ...show.calc } }]),
)
