import { mountScene } from './engine'

/**
 * Интернет-магазин: собирается большой смартфон с витриной и кнопкой
 * «купить», рядом лента конвейера. Потом кнопка пульсирует, а из телефона
 * по ленте одна за другой едут посылки.
 */
export function mountShop(canvas, options) {
  return mountScene(canvas, {
    ...options,
    build({ geo, material, part, grid, Vector3 }) {
      grid(40, 0.3)
      const body = material(0x1c1b24, { roughness: 0.35, metalness: 0.5 })
      const screen = material(0x24222f, { roughness: 0.3, emissive: 0x8a86ff, emissiveIntensity: 0.06 })
      const card = material(0x3a3748, { roughness: 0.5 })
      const thumbs = [0xffb38a, 0x8ad1ff, 0xc3a6ff, 0x9fe3b0].map((c) => material(c, { roughness: 0.5, emissive: c, emissiveIntensity: 0.15 }))
      const button = material(options.accent, { roughness: 0.4, emissive: options.accent, emissiveIntensity: 0.3 })
      const belt = material(0x26252d, { roughness: 0.8 })
      const frame = material(0x4a4856, { roughness: 0.5, metalness: 0.5 })
      const roller = material(0x8a8896, { roughness: 0.35, metalness: 0.7 })
      const kraft = [0xc49a63, 0xb3895a].map((c) => material(c, { roughness: 0.85 }))
      const tape = material(options.accent, { roughness: 0.5 })

      let o = 0
      // смартфон стоит на торце, экраном к зрителю
      part(geo.box, body, { pos: [-3.2, 3.2, 0], size: [3.2, 6.2, 0.35], order: o++, from: [0, 6, 0], flash: true })
      part(geo.box, screen, { pos: [-3.2, 3.25, 0.18], size: [2.9, 5.7, 0.02], order: o++, from: [0, 0, 3], glow: false })
      // витрина: две карточки товаров с картинками
      ;[[-3.9, 4.6], [-2.5, 4.6], [-3.9, 2.9], [-2.5, 2.9]].forEach(([x, y], i) => {
        part(geo.box, card, { pos: [x, y, 0.2], size: [1.2, 1.5, 0.03], order: o + i * 0.25, from: [0, 0, 2], glow: false })
        part(geo.box, thumbs[i], { pos: [x, y + 0.2, 0.22], size: [1.0, 0.9, 0.02], order: o + i * 0.25, from: [0, 0, 2], glow: false })
        part(geo.box, card, { pos: [x - 0.15, y - 0.5, 0.22], size: [0.7, 0.08, 0.02], order: o + i * 0.25, from: [0, 0, 2], glow: false })
      })
      o += 2
      const buy = part(geo.box, button, { pos: [-3.2, 1.15, 0.24], size: [2.3, 0.55, 0.08], order: o++, from: [0, 0, 3], flash: true, glow: false })

      // конвейер от телефона вправо
      const L = 7
      const x0 = -1.4
      part(geo.box, belt, { pos: [x0 + L / 2, 1.0, 1.1], size: [L, 0.1, 1.5], order: o++, from: [0, -2, 0], glow: false })
      ;[-1, 1].forEach((s) => part(geo.box, frame, { pos: [x0 + L / 2, 0.95, 1.1 + s * 0.82], size: [L, 0.3, 0.1], order: o, from: [0, -2, 0], glow: false }))
      for (let i = 0; i <= 4; i++) {
        ;[-1, 1].forEach((s) => part(geo.box, frame, { pos: [x0 + 0.3 + i * ((L - 0.6) / 4), 0.45, 1.1 + s * 0.7], size: [0.12, 0.9, 0.12], order: o + 0.5, from: [0, -2, 0], glow: false }))
      }
      const rollers = [x0, x0 + L].map((x) => part(geo.cyl, roller, { pos: [x, 0.98, 1.1], size: [0.24, 1.6, 0.24], rot: [Math.PI / 2, 0, 0], order: o + 0.5, from: [0, -2, 0], glow: false }))
      o++

      // посылки: едут по ленте и исчезают в конце, новые появляются у телефона
      const N = 4
      const boxes = Array.from({ length: N }, (_, i) => {
        const s = 0.7 + (i % 2) * 0.2
        const b = part(geo.box, kraft[i % 2], { pos: [x0 + 1 + i * 2, 1.05 + s / 2, 1.1], size: [s, s * 0.8, s], order: o + i * 0.2, from: [0, 3, 0], glow: false })
        const t = part(geo.box, tape, { pos: [x0 + 1 + i * 2, 1.05 + s * 0.8 + 0.01 + (s - s * 0.8) / 2, 1.1], size: [0.14, 0.02, s + 0.01], order: o + i * 0.2, from: [0, 3, 0], glow: false })
        return { b, t, s }
      })
      o++

      return {
        target: new Vector3(-0.2, 2.4, 0.6),
        radius: 18,
        height: 6,
        angle: 1.25,
        sway: 0.35,
        spin: 0.2,
        step: 0.04,
        fog: [22, 48],
        update({ elapsed, done, assembled }) {
          if (!done) return
          const t = elapsed - assembled
          const p = (Math.sin(t * 4) + 1) / 2
          button.emissiveIntensity = 0.3 + p * 0.6
          buy.scale.set(2.3 + p * 0.08, 0.55 + p * 0.03, 0.08)
          screen.emissiveIntensity = 0.06 + p * 0.03
          rollers.forEach((r) => (r.rotation.y = -t * 3))
          boxes.forEach(({ b, t: tp, s }, i) => {
            const k = ((t * 0.12 + i / N) % 1 + 1) % 1
            const x = x0 + 0.6 + k * (L - 1.2)
            // появляются и исчезают по краям ленты
            const g = Math.min(1, k * 8, (1 - k) * 8)
            const h = s * 0.8 * g
            b.position.x = x
            tp.position.x = x
            b.scale.set(s * g, h, s * g)
            b.position.y = 1.05 + h / 2
            tp.scale.set(0.14 * g, 0.02, (s + 0.01) * g)
            tp.position.y = 1.06 + h
          })
        },
      }
    },
  })
}
