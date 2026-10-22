import { SphereGeometry, TorusGeometry } from 'three'
import { mountScene } from './engine'

/**
 * Кадровое агентство: собирается оргструктура — уровни-подиумы с людьми
 * и связи между ними. Одно место пустует; лупа пробегает по кандидатам,
 * и выбранный встаёт на свободное место.
 */
export function mountStaffing(canvas, options) {
  return mountScene(canvas, {
    ...options,
    build({ geo, material, part, grid, disposables, Vector3 }) {
      grid(40, 0.3)
      const tier = material(0x2a2636, { roughness: 0.7 })
      const edge = material(0x4a4360, { roughness: 0.6 })
      const link = material(0x6b6388, { roughness: 0.6, metalness: 0.2 })
      const people = [0xc9c3d8, 0x9f97b5, 0xb4aec6].map((c) => material(c, { roughness: 0.55 }))
      const hero = material(options.accent, { roughness: 0.4, emissive: options.accent, emissiveIntensity: 0.2 })
      const ghost = material(options.accent, { roughness: 0.6, transparent: true, opacity: 0.25, depthWrite: false })
      const lens = material(0xcfe6ff, { roughness: 0.05, metalness: 0.3, transparent: true, opacity: 0.3, depthWrite: false })
      const rim = material(0x2b2833, { roughness: 0.4, metalness: 0.6 })
      const sphere = new SphereGeometry(0.5, 18, 12)
      const ring = new TorusGeometry(0.5, 0.07, 10, 32)
      disposables.push(sphere, ring)

      // человек: туловище-цилиндр и голова-шар
      const person = (m, x, y, z, order, flash = false) => [
        part(geo.cyl, m, { pos: [x, y + 0.45, z], size: [0.55, 0.9, 0.55], order, from: [0, 4, 0], flash, glow: false }),
        part(sphere, m, { pos: [x, y + 1.18, z], size: [0.46, 0.46, 0.46], order, from: [0, 4, 0], glow: false }),
      ]

      let o = 0
      // подиумы уровней: 1 → 3 → 5 мест
      const levels = [
        { y: 4.2, z: -2.6, xs: [0] },
        { y: 2.4, z: -1.0, xs: [-2.4, 0, 2.4] },
        { y: 0.6, z: 0.8, xs: [-4, -2, 0, 2, 4] },
      ]
      levels.forEach(({ y, z, xs }, l) => {
        const w = (xs.length - 1) * 2 + 2
        part(geo.box, tier, { pos: [0, y / 2, z], size: [w, y, 1.6], order: o, from: [0, -y, 0], glow: false })
        part(geo.box, edge, { pos: [0, y + 0.02, z + 0.8], size: [w, 0.05, 0.05], order: o + 0.3, from: [0, -y, 0], flash: l === 0 })
        o++
      })

      // связи от каждого к начальнику уровнем выше
      const holes = { 2: 3 }
      levels.forEach(({ y, z, xs }, l) => {
        xs.forEach((x, i) => {
          if (holes[l] === i) return
          person(people[(l + i) % 3], x, y, z, o + i * 0.2, l === 0)
        })
        if (l > 0) {
          const up = levels[l - 1]
          xs.forEach((x, i) => {
            const px = up.xs.reduce((m, v) => (Math.abs(v - x) < Math.abs(m - x) ? v : m))
            // связь от головы сотрудника к подножию начальника
            const from = new Vector3(x, y + 1.5, z)
            const to = new Vector3(px, up.y + 0.05, up.z + 0.5)
            const dir = to.clone().sub(from)
            const mid = from.clone().add(to).multiplyScalar(0.5)
            const m = part(geo.cyl, link, { pos: [mid.x, mid.y, mid.z], size: [0.05, dir.length(), 0.05], order: o + 1 + i * 0.1, from: [0, 0, 0], glow: false })
            m.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), dir.normalize())
          })
        }
        o += 2
      })

      // пустое место и кандидат, который на него встаёт
      const slot = levels[2]
      const sx = slot.xs[3]
      part(geo.cyl, ghost, { pos: [sx, slot.y + 0.03, slot.z], size: [0.9, 0.04, 0.9], order: o++, from: [0, 0, 0], glow: false })
      const [body, head] = person(hero, sx, slot.y, slot.z, o++, true)

      // лупа
      const glass = part(geo.cyl, lens, { pos: [0, 0, 0], size: [1.0, 0.04, 1.0], rot: [Math.PI / 2, 0, 0], order: o, from: [0, 4, 0], glow: false })
      const frame = part(ring, rim, { pos: [0, 0, 0], size: [1.1, 1.1, 1.1], order: o, from: [0, 4, 0], glow: false })
      const handle = part(geo.cyl, rim, { pos: [0, 0, 0], size: [0.12, 0.9, 0.12], rot: [0, 0, 0.7], order: o, from: [0, 4, 0], glow: false })
      const lensAt = (x, y, z) => {
        glass.position.set(x, y, z)
        frame.position.set(x, y, z)
        handle.position.set(x + 0.55, y - 0.55, z)
      }
      lensAt(-4, slot.y + 1.2, slot.z + 1.2)

      return {
        target: new Vector3(0, 2.3, 0),
        radius: 20,
        height: 6.5,
        angle: Math.PI / 2 - 0.15,
        sway: 0.4,
        spin: 0.18,
        step: 0.03,
        fog: [22, 50],
        update({ elapsed, done, assembled }) {
          if (!done) return
          // цикл 9 с: лупа проходит по ряду, кандидат поднимается и опускается на место
          const t = (elapsed - assembled) % 9
          const k = Math.min(1, t / 4)
          const x = -4 + (sx + 4) * (k * k * (3 - 2 * k)) + Math.sin(t * 3) * 0.15 * (1 - k)
          lensAt(x, slot.y + 1.2 + Math.sin(t * 2) * 0.1, slot.z + 1.2)
          const j = t < 4 ? 0 : t < 5 ? (t - 4) : t < 6 ? 1 - (t - 5) : 0
          const lift = Math.sin(Math.min(1, j) * Math.PI / 2) * 0.6
          body.position.y = slot.y + 0.45 + lift
          head.position.y = slot.y + 1.18 + lift
          hero.emissiveIntensity = 0.2 + (t > 4 && t < 7 ? 0.6 * Math.sin(((t - 4) / 3) * Math.PI) : 0)
        },
      }
    },
  })
}
