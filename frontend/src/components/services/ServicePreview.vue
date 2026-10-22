<script setup>
import '../../styles/service-preview.css'

/**
 * Мини-превью услуги для карточки на странице услуг: маленькая сцена на CSS,
 * крутится по кругу. Картинка декоративная — смысл несёт текст карточки.
 * Анимация идёт, только пока у предка есть класс `is-playing`.
 */
defineProps({
  kind: { type: String, required: true },
})

const range = (n) => Array.from({ length: n }, (_, i) => i)
</script>

<template>
  <div class="sp" :class="`sp--${kind}`" aria-hidden="true">
    <!-- Директ: поиск, клик по объявлению, пришла заявка -->
    <template v-if="kind === 'direct'">
      <div class="sp-search"><i />кухни на заказ</div>
      <div class="sp-serp">
        <div class="sp-serp__row is-ad"><b>Реклама</b><span /><span class="is-short" /></div>
        <div class="sp-serp__row"><span /><span class="is-short" /></div>
        <div class="sp-serp__row"><span /><span class="is-short" /></div>
      </div>
      <span class="sp-cursor" />
      <span class="sp-chip">+1 заявка</span>
    </template>

    <!-- SEO: ваш сайт поднимается в выдаче -->
    <template v-else-if="kind === 'seo'">
      <ol class="sp-rank">
        <li v-for="i in range(5)" :key="i"><em>{{ i + 1 }}</em><span /></li>
      </ol>
      <div class="sp-rank__you"><em>↑</em>ваш сайт</div>
    </template>

    <!-- Посадочная: страница собирается по блокам, кнопка зовёт позвонить -->
    <template v-else-if="kind === 'landing'">
      <div class="sp-page">
        <span class="sp-page__hero" />
        <span class="sp-page__line" />
        <div class="sp-page__cards"><i /><i /><i /></div>
        <span class="sp-page__btn">Позвонить</span>
      </div>
    </template>

    <!-- Аналитика: воронка от кликов до продаж -->
    <template v-else-if="kind === 'funnel'">
      <div class="sp-funnel">
        <div style="--w: 100%"><span>Клики</span><i /></div>
        <div style="--w: 46%"><span>Заявки</span><i /></div>
        <div style="--w: 20%"><span>Продажи</span><i /></div>
      </div>
      <span class="sp-chip">окупилось ×2,4</span>
    </template>

    <!-- Отдел продаж: запись звонка и оценка качества -->
    <template v-else-if="kind === 'call'">
      <div class="sp-call">
        <span class="sp-call__head"><i />Звонок · 3:42</span>
        <div class="sp-wave"><i v-for="i in range(18)" :key="i" :style="{ '--i': i }" /></div>
        <div class="sp-score"><span>Качество</span><b><i /></b><em>8/10</em></div>
      </div>
    </template>

    <!-- Стратегия: план на три месяца с целью в конце -->
    <template v-else-if="kind === 'plan'">
      <div class="sp-plan">
        <svg viewBox="0 0 200 80" preserveAspectRatio="none"><path d="M6 70 C 50 64, 70 46, 100 42 S 160 14, 194 8" pathLength="100" /></svg>
        <span v-for="i in range(3)" :key="i" class="sp-plan__dot" :style="{ '--i': i }">Мес {{ i + 1 }}</span>
        <span class="sp-plan__flag">цель</span>
      </div>
    </template>

    <!-- Экспресс-аудит: чек-лист с найденными точками роста -->
    <template v-else-if="kind === 'audit'">
      <ul class="sp-check">
        <li style="--i: 0"><i>✓</i>Реклама и ставки</li>
        <li style="--i: 1" class="is-warn"><i>!</i>Сайт теряет заявки</li>
        <li style="--i: 2"><i>✓</i>Аналитика</li>
        <li style="--i: 3" class="is-warn"><i>!</i>Ответ на звонки</li>
      </ul>
      <span class="sp-chip">2 точки роста</span>
    </template>

    <!-- Сайт за 24 часа: таймер замыкается, появляется сайт -->
    <template v-else-if="kind === 'timer'">
      <div class="sp-timer">
        <svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="17" /><circle class="sp-timer__arc" cx="20" cy="20" r="17" /></svg>
        <b>24 ч</b>
      </div>
      <div class="sp-browser">
        <span class="sp-browser__bar"><i /><i /><i /></span>
        <span class="sp-page__hero" />
        <span class="sp-page__line" />
        <span class="sp-page__line is-short" />
        <span class="sp-page__btn">Заявка</span>
      </div>
    </template>

    <!-- Большой сайт: дерево разделов растёт -->
    <template v-else-if="kind === 'tree'">
      <div class="sp-tree">
        <span class="sp-tree__root">Главная</span>
        <div class="sp-tree__cols">
          <div v-for="c in range(3)" :key="c" class="sp-tree__col" :style="{ '--i': c }">
            <span class="sp-tree__node">{{ ['Каталог', 'Услуги', 'Блог'][c] }}</span>
            <i v-for="l in range(3 - (c % 2))" :key="l" :style="{ '--j': l }" />
          </div>
        </div>
      </div>
    </template>

    <!-- Бот: короткий диалог с кнопками -->
    <template v-else-if="kind === 'bot'">
      <div class="sp-chat">
        <p class="sp-bubble is-bot" style="--i: 0">Здравствуйте! Записать вас?</p>
        <p class="sp-bubble is-user" style="--i: 1">Да, на завтра</p>
        <p class="sp-bubble is-bot" style="--i: 2">
          Свободно:
          <span class="sp-bubble__btns"><i>10:00</i><i class="is-on">13:30</i></span>
        </p>
      </div>
    </template>

    <!-- SaaS: панель с цифрами и графиком -->
    <template v-else-if="kind === 'dash'">
      <div class="sp-dash">
        <div class="sp-dash__kpis"><i /><i /><i /></div>
        <div class="sp-dash__bars">
          <i v-for="(h, i) in [30, 42, 38, 55, 50, 68, 62, 80, 92]" :key="i" :style="{ '--h': `${h}%`, '--i': i }" />
        </div>
      </div>
    </template>

    <!-- Автоматизация: данные бегут по цепочке систем -->
    <template v-else-if="kind === 'flow'">
      <div class="sp-flow">
        <span class="sp-flow__wire" />
        <span class="sp-flow__dot" />
        <span v-for="(n, i) in ['Сайт', 'CRM', '1С', 'TG']" :key="n" class="sp-flow__node" :style="{ '--i': i }">{{ n }}</span>
      </div>
      <span class="sp-chip">без ручного ввода</span>
    </template>

    <!-- AI: вопрос, поиск в базе, ответ -->
    <template v-else-if="kind === 'ai'">
      <div class="sp-chat">
        <p class="sp-bubble is-user" style="--i: 0">Можно вернуть товар?</p>
        <span class="sp-source">Условия возврата · п. 3.2</span>
        <div class="sp-bubble is-bot sp-answer">
          <i style="--w: 92%" /><i style="--w: 78%" /><i style="--w: 54%" />
        </div>
      </div>
    </template>

    <!-- Кабинеты и админки: заявка проходит по статусам -->
    <template v-else-if="kind === 'board'">
      <div class="sp-board">
        <div v-for="(c, i) in ['Новые', 'В работе', 'Готово']" :key="c" class="sp-board__col">
          <span>{{ c }}</span>
          <i /><i />
          <i v-if="i === 0" class="sp-board__move" />
        </div>
      </div>
    </template>

    <!-- Ведение сайта: пульс аптайма и выполненные правки -->
    <template v-else-if="kind === 'pulse'">
      <div class="sp-pulse">
        <span class="sp-pulse__label"><i />Сайт работает</span>
        <svg viewBox="0 0 200 40" preserveAspectRatio="none">
          <path d="M0 22 H60 L68 8 L76 34 L84 14 L90 22 H200" pathLength="100" />
        </svg>
        <ul class="sp-check sp-check--mini">
          <li style="--i: 1"><i>✓</i>Новая акция на главной</li>
          <li style="--i: 2"><i>✓</i>Цены обновлены</li>
        </ul>
      </div>
    </template>
  </div>
</template>
