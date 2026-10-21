import { Color, SphereGeometry } from 'three'
import { mountScene } from './engine'

/**
 * Салон красоты: собирается рабочее место мастера — зеркало с лампами,
 * кресло и полка с флаконами. Лампы вокруг зеркала загораются по кругу.
 */
export function mountBeauty(canvas, options) {
  return mountScene(canvas, {
    ...options,
    build({ geo, material, part, disposables, Vector3 }) {
      const wall = material(0x2a2026, { roughness: 0.85 })
      const frame = material(0xe7d3c4, { roughness: 0.4, metalness: 0.2 })
      const mirror = material(0x8a98a8, { roughness: 0.05, metalness: 0.95 })
      const seat = material(options.accent, { roughness: 0.5, emissiveIntensity: 0.1 })
      const chrome = material(0xc9ced4, { roughness: 0.2, metalness: 0.9 })
      const shelf = material(0xd8c3b0, { roughness: 0.6 })
      const bottles = [0xf2d6e0, 0x2f2a33, 0xd9a77e, 0xf6efe6, 0xb88aa0].map((c) => material(c, { roughness: 0.3, metalness: 0.1 }))
      const bulb = new SphereGeometry(0.5, 16, 12)
      disposables.push(bulb)

      let o = 0
      part(geo.box, material(0x1e171b, { roughness: 0.9 }), { pos: [0, 0.02, 0.5], size: [12, 0.04, 7], order: o++, from: [0, -1, 0], glow: false })
      part(geo.box, wall, { pos: [0, 3, -2.2], size: [12, 6, 0.2], order: o++, from: [0, -6, 0], glow: false })

      // зеркало в раме
      part(geo.box, frame, { pos: [0, 3.4, -2.0], size: [3.6, 4, 0.16], order: o++, from: [0, 0, 3], flash: true })
      part(geo.box, mirror, { pos: [0, 3.4, -1.9], size: [3.0, 3.4, 0.04], order: o++, from: [0, 0, 3], glow: false })
      // лампы по периметру — по часовой стрелке, начиная с левого нижнего угла
      const lamps = []
      const ring = []
      for (let i = 0; i < 5; i++) ring.push([-1.65, 1.75 + i * 0.83])
      for (let i = 1; i < 4; i++) ring.push([-1.65 + i * 0.83, 5.07])
      for (let i = 4; i >= 0; i--) ring.push([1.65, 1.75 + i * 0.83])
      ring.forEach(([x, y], i) => {
        const m = material(0xfff4dc, { roughness: 0.3, emissive: new Color(0xffd9a0), emissiveIntensity: 0.15 })
        part(bulb, m, { pos: [x, y, -1.82], size: [0.32, 0.32, 0.32], order: o + i * 0.2, from: [0, 0, 2], glow: false })
        lamps.push(m)
      })
      o += 3

      // столешница мастера
      part(geo.box, shelf, { pos: [0, 1.5, -1.6], size: [4.4, 0.12, 1.0], order: o++, from: [0, 3, 0] })
      ;[-2, 2].forEach((x) => part(geo.box, shelf, { pos: [x, 0.75, -1.6], size: [0.12, 1.5, 0.9], order: o, from: [0, 3, 0], glow: false }))
      o++
      // флаконы на столешнице
      ;[[-1.6, 0.5], [-1.2, 0.75], [-0.8, 0.4], [1.0, 0.6], [1.45, 0.85]].forEach(([x, h], i) => {
        part(geo.cyl, bottles[i], { pos: [x, 1.56 + h / 2, -1.5], size: [0.28, h, 0.28], order: o + i * 0.3, from: [0, 3, 0] })
        part(geo.cyl, chrome, { pos: [x, 1.6 + h, -1.5], size: [0.14, 0.12, 0.14], order: o + i * 0.3, from: [0, 3, 0], glow: false })
      })
      o += 2

      // кресло
      part(geo.cyl, chrome, { pos: [0, 0.06, 0.6], size: [1.5, 0.12, 1.5], order: o++, from: [0, 3, 0] })
      part(geo.cyl, chrome, { pos: [0, 0.6, 0.6], size: [0.2, 1.0, 0.2], order: o++, from: [0, 3, 0] })
      part(geo.box, seat, { pos: [0, 1.15, 0.6], size: [1.6, 0.35, 1.5], order: o++, from: [0, 3, 0], flash: true })
      part(geo.box, seat, { pos: [0, 2.0, 1.3], size: [1.6, 1.5, 0.3], rot: [-0.12, 0, 0], order: o++, from: [0, 3, 0] })
      ;[-0.9, 0.9].forEach((x) => part(geo.box, seat, { pos: [x, 1.55, 0.6], size: [0.2, 0.2, 1.3], order: o, from: [0, 3, 0] }))
      o++

      // кашпо с растением сбоку
      part(geo.cyl, shelf, { pos: [3.6, 0.5, -1.2], size: [0.9, 1.0, 0.9], order: o++, from: [0, 3, 0] })
      part(bulb, material(0x4f7a57, { roughness: 0.9 }), { pos: [3.6, 1.6, -1.2], size: [1.3, 1.4, 1.3], order: o++, from: [0, 3, 0], glow: false })

      return {
        target: new Vector3(0.3, 2.4, 0),
        radius: 17,
        height: 4.8,
        angle: 1.25,
        sway: 0.35,
        spin: 0.2,
        step: 0.05,
        fog: [18, 42],
        update({ elapsed, done, assembled }) {
          if (!done) return
          // огонёк бежит по кругу и все лампы зажигаются, потом снова гаснут до тёплого фона
          const t = elapsed - assembled
          const n = lamps.length
          const head = (t * 6) % (n * 2)
          lamps.forEach((m, i) => {
            const on = head < n ? i <= head : i > head - n
            m.emissiveIntensity = on ? 1.1 : 0.15
          })
        },
      }
    },
  })
}
