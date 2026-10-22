import { mountScene } from './engine'

/**
 * Бухгалтерия: собирается рабочий стол — монитор с графиком, папки,
 * калькулятор и печать. Потом столбцы отчёта растут, а печать ставит
 * оттиск на документ.
 */
export function mountAccounting(canvas, options) {
  return mountScene(canvas, {
    ...options,
    build({ geo, material, part, grid, Vector3 }) {
      grid(40, 0.3)
      const desk = material(0x3a3f47, { roughness: 0.7 })
      const leg = material(0x22262c, { roughness: 0.6, metalness: 0.4 })
      const frame = material(0x1b1f25, { roughness: 0.4, metalness: 0.4 })
      const screen = material(0x0f1a1f, { roughness: 0.3, emissive: options.accent, emissiveIntensity: 0.05 })
      const bar = material(options.accent, { roughness: 0.4, emissive: options.accent, emissiveIntensity: 0.5 })
      const paper = material(0xf1f3f5, { roughness: 0.8 })
      const line = material(0xb9c0c8, { roughness: 0.8 })
      const folders = [0x4fd1a5, 0x5a87c9, 0xd9a24a, 0x8a93a0].map((c) => material(c, { roughness: 0.6 }))
      const stampBody = material(0x2c3138, { roughness: 0.5, metalness: 0.3 })
      const ink = material(options.accent, { roughness: 0.6, transparent: true, opacity: 0 })
      const calc = material(0x2a2f36, { roughness: 0.5 })
      const key = material(0x8d96a1, { roughness: 0.5 })

      let o = 0
      // стол
      part(geo.box, desk, { pos: [0, 1.6, 0], size: [8, 0.16, 3.6], order: o++, from: [0, -3, 0], flash: true })
      ;[[-3.7, -1.6], [3.7, -1.6], [-3.7, 1.6], [3.7, 1.6]].forEach(([x, z]) => part(geo.box, leg, { pos: [x, 0.8, z], size: [0.14, 1.6, 0.14], order: o, from: [0, -3, 0], glow: false }))
      o++

      // монитор с графиком
      part(geo.box, leg, { pos: [-1.2, 1.75, -1.0], size: [0.9, 0.06, 0.6], order: o, from: [0, 3, 0], glow: false })
      part(geo.box, leg, { pos: [-1.2, 2.2, -1.1], size: [0.12, 0.9, 0.12], order: o++, from: [0, 3, 0], glow: false })
      part(geo.box, frame, { pos: [-1.2, 3.3, -1.05], size: [3.4, 2.0, 0.12], order: o, from: [0, 3, 0] })
      part(geo.box, screen, { pos: [-1.2, 3.3, -0.98], size: [3.2, 1.8, 0.02], order: o++, from: [0, 3, 0], glow: false })
      const bars = [0.45, 0.7, 0.6, 0.95, 1.2, 1.45].map((h, i) =>
        part(geo.box, bar, { pos: [-2.45 + i * 0.5, 2.55 + h / 2, -0.95], size: [0.3, h, 0.02], order: o + i * 0.2, from: [0, 0, 1], glow: false }),
      )
      const heights = [0.45, 0.7, 0.6, 0.95, 1.2, 1.45]
      o += 2

      // стопки папок
      ;[0, 1, 2, 3, 4].forEach((i) =>
        part(geo.box, folders[i % 4], { pos: [2.6, 1.78 + i * 0.2, -0.9 + (i % 2) * 0.06], size: [1.4, 0.18, 1.9], rot: [0, (i % 3) * 0.06 - 0.06, 0], order: o + i * 0.3, from: [0, 3, 0], glow: false }),
      )
      ;[0, 1, 2].forEach((i) =>
        part(geo.box, folders[(i + 2) % 4], { pos: [3.25, 2.4, 0.5 + i * 0.32], size: [0.2, 1.4, 1.0], rot: [0, Math.PI / 2, 0], order: o + 1.5 + i * 0.2, from: [0, 3, 0], glow: false }),
      )
      o += 3

      // документ, калькулятор
      part(geo.box, paper, { pos: [0.9, 1.69, 0.6], size: [1.5, 0.02, 2.0], rot: [0, -0.15, 0], order: o++, from: [0, 2, 0], glow: false })
      for (let i = 0; i < 5; i++) part(geo.box, line, { pos: [0.9 - 0.1 + i * 0.03, 1.705, -0.1 + i * 0.28], size: [1.0, 0.005, 0.05], rot: [0, -0.15, 0], order: o, from: [0, 2, 0], glow: false })
      const print = part(geo.cyl, ink, { pos: [1.05, 1.705, 0.95], size: [0.7, 0.01, 0.7], order: o++, from: [0, 0, 0], glow: false })
      part(geo.box, calc, { pos: [-2.7, 1.74, 0.8], size: [1.0, 0.12, 1.3], rot: [0, 0.2, 0], order: o, from: [0, 2, 0] })
      for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) part(geo.box, key, { pos: [-2.95 + c * 0.25 + r * 0.05, 1.82, 0.45 + r * 0.25 - c * 0.05], size: [0.16, 0.04, 0.16], rot: [0, 0.2, 0], order: o + 0.5, from: [0, 2, 0], glow: false })
      o++

      // печать
      const stamp = part(geo.cyl, stampBody, { pos: [1.05, 3.0, 0.95], size: [0.7, 0.35, 0.7], order: o, from: [0, 4, 0], flash: true })
      const handle = part(geo.cyl, stampBody, { pos: [1.05, 3.45, 0.95], size: [0.26, 0.6, 0.26], order: o, from: [0, 4, 0], glow: false })
      const knob = part(geo.cyl, bar, { pos: [1.05, 3.8, 0.95], size: [0.45, 0.18, 0.45], order: o++, from: [0, 4, 0], glow: false })
      const rise = [stamp, handle, knob].map((m) => m.position.y)

      return {
        target: new Vector3(0, 2.4, 0),
        radius: 17,
        height: 6.5,
        angle: 1.15,
        sway: 0.4,
        spin: 0.2,
        step: 0.03,
        fog: [18, 40],
        update({ elapsed, done, assembled }) {
          if (!done) return
          const t = elapsed - assembled
          // столбцы колеблются вокруг своей высоты, последний растёт
          bars.forEach((b, i) => {
            const h = heights[i] * (0.85 + 0.15 * Math.sin(t * 1.2 + i))
            b.scale.y = h
            b.position.y = 2.55 + h / 2
          })
          // печать: цикл 5 с — опуститься, прижать, подняться
          const c = t % 5
          const k = c < 0.6 ? c / 0.6 : c < 1.1 ? 1 : c < 1.9 ? 1 - (c - 1.1) / 0.8 : 0
          const e = k * k * (3 - 2 * k)
          const drop = e * 1.12
          ;[stamp, handle, knob].forEach((m, i) => (m.position.y = rise[i] - drop))
          ink.opacity = c < 0.6 ? 0 : 0.85 * Math.max(0, 1 - (c - 0.6) / 4)
          print.visible = ink.opacity > 0.01
          screen.emissiveIntensity = 0.12 + Math.sin(t * 2) * 0.03
        },
      }
    },
  })
}
