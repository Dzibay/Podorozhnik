/** Имитация «живых» заявок клиентов — соцдоказательство на сайте */

export const liveNotifications = [
  { company: 'ООО «Грейдстрой»', event: 'Пришла заявка' },
  { company: 'ООО «Грейдстрой»', event: 'Новый звонок' },
  { company: 'ООО «Грейдстрой»', event: 'Новое письмо' },
  { company: 'ИП Иванов', event: 'Пришла заявка' },
  { company: 'ИП Иванов', event: 'Новый звонок' },
  { company: 'ИП Иванов', event: 'Новое письмо' },
  { company: 'ООО «СтройМонтаж»', event: 'Пришла заявка' },
  { company: 'ООО «СтройМонтаж»', event: 'Новый звонок' },
  { company: 'ООО «СтройМонтаж»', event: 'Новое письмо' },
  { company: 'ООО «БелорусскиеБлоки»', event: 'Пришла заявка' },
  { company: 'ООО «БелорусскиеБлоки»', event: 'Новый звонок' },
  { company: 'ООО «БелорусскиеБлоки»', event: 'Новое письмо' },
  { company: 'Noris Кухни', event: 'Пришла заявка' },
  { company: 'Noris Кухни', event: 'Новый звонок' },
  { company: 'Noris Кухни', event: 'Новое письмо' },
  { company: 'ООО «АлюмПерегородки»', event: 'Пришла заявка' },
  { company: 'ООО «АлюмПерегородки»', event: 'Новый звонок' },
  { company: 'ООО «АлюмПерегородки»', event: 'Новое письмо' },
  { company: 'GoodFood', event: 'Пришла заявка' },
  { company: 'GoodFood', event: 'Новый звонок' },
  { company: 'GoodFood', event: 'Новое письмо' },
  { company: 'КП «Семиозерье»', event: 'Пришла заявка' },
  { company: 'КП «Семиозерье»', event: 'Новый звонок' },
  { company: 'КП «Семиозерье»', event: 'Новое письмо' },
  { company: 'ООО «СолнечныеПанели»', event: 'Пришла заявка' },
  { company: 'ООО «СолнечныеПанели»', event: 'Новый звонок' },
  { company: 'ООО «СолнечныеПанели»', event: 'Новое письмо' },
  { company: 'СДЭК-Логистика', event: 'Пришла заявка' },
  { company: 'СДЭК-Логистика', event: 'Новый звонок' },
  { company: 'СДЭК-Логистика', event: 'Новое письмо' },
]

export function eventIcon(event) {
  if (event.includes('звонок')) return 'call'
  if (event.includes('письм')) return 'mail'
  return 'lead'
}

export function randomMinutesAgo() {
  return 2 + Math.floor(Math.random() * 44)
}

export function formatMinutesAgo(minutes) {
  if (minutes === 1) return '1 минуту назад'
  if (minutes >= 2 && minutes <= 4) return `${minutes} минуты назад`
  return `${minutes} минут назад`
}
