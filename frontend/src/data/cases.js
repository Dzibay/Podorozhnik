/** Кейсы с цифрами — источник для главной и /cases */

export const caseNiches = [
  { id: 'all', label: 'Все' },
  { id: 'production', label: 'Производство' },
  { id: 'construction', label: 'Стройка и ремонт' },
  { id: 'services', label: 'Услуги и доставка' },
]

export const cases = [
  {
    id: 'belorusskie-bloki',
    slug: 'belorusskie-bloki',
    niche: 'production',
    nicheLabel: 'Производство стройматериалов',
    client: 'ООО «БелорусскиеБлоки»',
    period: 'Долгосрочное ведение',
    title: 'Производство белорусских блоков',
    task: 'Стабильный поток целевых заявок из интернета и меньше зависимости от сарафана.',
    did: [
      'Яндекс.Директ с многоуровневой стратегией',
      '50+ A/B-тестов креативов и посадочных',
      'Квалификация лидов и доработка воронки',
      'Переход от дешёвого трафика к более качественной аудитории',
    ],
    metrics: [
      { label: 'Потрачено', value: '1 201 836 ₽' },
      { label: 'Целевых обращений', value: '1 000+' },
      { label: 'Стоимость заявки', value: '1 017 ₽' },
      { label: 'Конверсия в заявку', value: 'до 6%' },
    ],
    highlight: 'Дешёвый клик ≠ результат. Рост CPC до 50–70 ₽ поднял конверсию сайта с 2,6% до 6%.',
    preview: {
      metric: 'CPL 1 017 ₽',
      result: '~1 000 целевых обращений',
    },
  },
  {
    id: 'noris-kuhni',
    slug: 'noris-kuhni',
    niche: 'production',
    nicheLabel: 'Производство мебели (премиум)',
    client: 'Noris Кухни',
    period: '1 год 2 месяца',
    title: 'Кухни премиум-сегмента, Москва',
    task: 'Система маркетинга с нуля и стабильный поток заявок с высокой конверсией в сделку.',
    did: [
      'Стратегия: Директ + ВК + Pinterest + Instagram + YouTube',
      'CRM и сквозная аналитика по каналам',
      'Брифы и скрипты для менеджеров',
      'Систематические A/B-тесты посадочных и креативов',
    ],
    metrics: [
      { label: 'Заявок в месяц', value: '250+' },
      { label: 'CPL', value: 'до 2 000 ₽' },
      { label: 'Конверсия в замер', value: '60%' },
      { label: 'Средний чек', value: '370 000 ₽' },
    ],
    highlight: 'Конверсия в выезд замерщика выросла с 35% до 60%, доля соцсетей — с 10% до 30%.',
    preview: {
      metric: '250+ заявок/мес',
      result: 'Замер 60%, чек 370к ₽',
    },
  },
  {
    id: 'semiozerie',
    slug: 'semiozerie',
    niche: 'construction',
    nicheLabel: 'Загородная недвижимость',
    client: 'КП «Семиозерье»',
    period: '1 год',
    title: 'Коттеджный посёлок «Семиозерье»',
    task: 'Воронка от лида до бронирования и заселения в премиальные коттеджи.',
    did: [
      'Директ + ВК + Telegram под аудиторию с высоким доходом',
      'Лендинг и система бронирования',
      'Bitrix24, скрипты и триггерные рассылки',
      'Сквозная аналитика от клика до ROI',
    ],
    metrics: [
      { label: 'Бронирования', value: '+65%' },
      { label: 'Стоимость лида', value: '−30%' },
      { label: 'Конверсия сайта', value: '+40%' },
      { label: 'ROMI', value: '×2' },
    ],
    highlight: 'Время отклика на заявку сократили до 5 минут, конверсия лида в бронь — 25%.',
    preview: {
      metric: 'Брони +65%',
      result: 'ROMI вырос в 2 раза',
    },
  },
  {
    id: 'goodfood',
    slug: 'goodfood',
    niche: 'services',
    nicheLabel: 'Доставка еды',
    client: 'GoodFood',
    period: '1 год',
    title: 'Доставка готового питания GoodFood',
    task: 'Снизить стоимость заявки, увеличить обращения и возвратность клиентов.',
    did: [
      'Quiz-лендинг под конверсию',
      'Оптимизация рекламных кампаний',
      'Ретаргетинг на существующих клиентов',
    ],
    metrics: [
      { label: 'Конверсия квиза', value: '6,4%' },
      { label: 'CPL', value: '205 ₽' },
      { label: 'Заявок', value: '×3' },
      { label: 'LTV', value: '+10%' },
    ],
    highlight: 'Стоимость заявки упала с 630 ₽ до 205 ₽ — в три раза дешевле при росте объёма.',
    preview: {
      metric: 'CPL 205 ₽',
      result: 'Заявок в 3 раза больше',
    },
  },
]

export function getCase(slug) {
  return cases.find((item) => item.slug === slug) || null
}

export function casesByNiche(nicheId) {
  if (!nicheId || nicheId === 'all') return cases
  return cases.filter((item) => item.niche === nicheId)
}
