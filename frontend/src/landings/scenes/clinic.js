import { Color, Group } from 'three'
import { mountScene } from './engine'

/**
 * Клиника: собирается стена-расписание, ячейки приёмов по одной
 * заполняются записями. Рядом из кубиков складывается медицинский крест и медленно вращается.
 */
export function mountClinic(canvas, options) {
  return mountScene(canvas, {
    ...options,
    build({ scene, geo, material, part, grid, accentColor, Vector3 }) {
      grid(40, 0.4)
      const panel = material(0x1b2a2c, { roughness: 0.8 })
      const white = material(0xeef4f3, { roughness: 0.45 })
      const head = material(options.accent, { emissiveIntensity: 0.35, roughness: 0.4 })

      let o = 0
      part(geo.box, panel, { pos: [0, 3, -2], size: [9.4, 6, 0.24], order: o++, from: [0, -6, 0], glow: false })
      part(geo.box, head, { pos: [0, 5.5, -1.82], size: [9, 0.6, 0.14], order: o++, from: [0, 2, 0], flash: true })

      // ячейки расписания: 7 дней × 5 слотов, у каждой свой материал, чтобы перекрашивать
      const free = new Color(0x3a4c4f)
      const slots = []
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 7; c++) {
          const m = material(free, { roughness: 0.5 })
          const mesh = part(geo.box, m, {
            pos: [-3.66 + c * 1.22, 4.6 - r * 0.95, -1.8],
            size: [1.08, 0.8, 0.12],
            order: o + c * 0.4 + r * 0.6,
            from: [0, 0, 3],
            glow: false,
          })
          slots.push({ mesh, m, rank: (Math.sin(c * 12.9898 + r * 78.233) * 43758.5453) % 1, v: 0 })
        }
      }
      slots.forEach((s) => (s.rank = Math.abs(s.rank)))
      o += 8

      // крест из кубиков
      const cross = new Group()
      cross.position.set(6.4, 3.6, 0.2)
      scene.add(cross)
      const cells = [[0, 2], [0, 1], [0, 0], [0, -1], [0, -2], [-1, 0], [-2, 0], [1, 0], [2, 0]]
      cells.forEach(([x, y], i) => {
        part(geo.box, i === 2 ? head : white, { pos: [x * 0.62, y * 0.62, 0], size: [0.6, 0.6, 0.6], order: o + i * 0.5, parent: cross, from: [x * 2, 3, 2], flash: i === 2 })
      })
      o += 5
      // стойка регистрации
      part(geo.box, white, { pos: [4.6, 0.55, 2], size: [3.4, 1.1, 1], order: o++, from: [0, 3, 0] })
      part(geo.box, head, { pos: [4.6, 1.14, 2], size: [3.6, 0.08, 1.2], order: o++, from: [0, 3, 0] })

      const tmp = new Color()
      return {
        target: new Vector3(0.7, 2.6, 0),
        radius: 28,
        height: 6.5,
        angle: 1.3,
        sway: 0.38,
        spin: 0.17,
        step: 0.035,
        fog: [26, 56],
        update({ elapsed, dt, done, assembled }) {
          cross.rotation.y = elapsed * 0.5
          if (!done) return
          // расписание заполняется за ~12 секунд, держится и обнуляется к новой неделе
          const k = ((elapsed - assembled) % 16) / 16
          slots.forEach((s) => {
            const booked = k < 0.9 && k * 1.3 > s.rank * 0.95
            // dt = 0 — неподвижный кадр спокойного режима, красим сразу
            s.v += ((booked ? 1 : 0) - s.v) * (dt ? Math.min(1, dt * 5) : 1)
            s.m.color.copy(tmp.copy(free).lerp(accentColor, s.v))
            s.m.emissiveIntensity = s.v * 0.35
          })
        },
      }
    },
  })
}
