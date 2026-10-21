<script setup>
import { ref } from 'vue'
import { homeCopy } from '../../data/home'
import { contacts } from '../../data/site'

const { faq } = homeCopy
const open = ref(0)

function toggle(index) {
  open.value = open.value === index ? -1 : index
}
</script>

<template>
  <section id="faq" class="sec faq" data-section="faq">
    <div class="container faq__layout">
      <div class="faq__aside">
        <p v-reveal class="kicker">{{ faq.kicker }}</p>
        <h2 v-reveal class="h-2">{{ faq.titleStart }} <em>{{ faq.titleAccent }}</em></h2>
        <p v-reveal class="faq__ask">
          Не нашли свой вопрос?<br />
          <a :href="contacts.phoneTel">{{ contacts.phoneDisplay }}</a>
        </p>
      </div>

      <ul class="faq__list">
        <li v-for="(item, index) in faq.items" :key="item.q" v-reveal class="faq__item" :class="{ 'is-open': open === index }">
          <button
            type="button"
            class="faq__q"
            :aria-expanded="open === index"
            :aria-controls="`faq-${index}`"
            @click="toggle(index)"
          >
            <span class="mono faq__idx">{{ String(index + 1).padStart(2, '0') }}</span>
            <span class="faq__q-text">{{ item.q }}</span>
            <span class="faq__plus" aria-hidden="true" />
          </button>
          <div :id="`faq-${index}`" class="faq__a" role="region">
            <div>
              <p>{{ item.a }}</p>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>
