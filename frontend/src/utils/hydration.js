/**
 * Идёт ли гидрация: Vue «оживляет» готовый HTML из пререндера.
 * Хуки onMounted всех компонентов страницы срабатывают внутри app.mount(),
 * поэтому флаг виден им синхронно — так компонент отличает первую загрузку
 * от перехода по сайту и не прячет то, что посетитель уже видит.
 */
let hydrating = false

export const isHydrating = () => hydrating

export function mountApp(app, root, hydrate) {
  hydrating = hydrate
  try {
    return app.mount(root)
  } finally {
    hydrating = false
  }
}
