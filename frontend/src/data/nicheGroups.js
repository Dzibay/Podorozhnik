import { getNiche } from './niches.js'

/** Группы каталога ниш: порядок групп и ниш внутри — как на странице /dlya */
export const nicheGroups = [
  {
    id: 'health',
    title: 'Здоровье и красота',
    text: 'Записи на приём и повторные визиты',
    slugs: ['medicina', 'stomatologiya', 'veterinariya', 'fitnes', 'krasota'],
  },
  {
    id: 'family',
    title: 'Семья и досуг',
    text: 'Набор групп, брони и сезонные пики',
    slugs: ['detskie-centry', 'obrazovanie', 'turizm', 'ivent', 'horeca'],
  },
  {
    id: 'home',
    title: 'Недвижимость и дом',
    text: 'Замеры, сметы и длинные сделки',
    slugs: ['strojka', 'mebel', 'nedvizhimost', 'agentstva-nedvizhimosti', 'okna-dveri', 'derevyannye-doma', 'inzhenernye-sistemy'],
  },
  {
    id: 'b2b',
    title: 'B2B и производство',
    text: 'Дорогие заявки и постоянные заказчики',
    slugs: ['proizvodstvo', 'logistika', 'spectehnika', 'opt', 'ohrana', 'buhgalteriya', 'kadrovye-agentstva', 'yuristy'],
  },
  {
    id: 'retail',
    title: 'Ритейл и сервис',
    text: 'Быстрые заказы и Карты рядом с домом',
    slugs: ['internet-magaziny', 'cvety', 'avto', 'remont-tehniki', 'uslugi'],
  },
].map((group) => ({ ...group, niches: group.slugs.map(getNiche).filter(Boolean) }))
