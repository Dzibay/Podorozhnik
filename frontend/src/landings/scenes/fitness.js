import { Group, SphereGeometry, TorusGeometry } from 'three'
import { mountScene } from './engine'

/**
 * Фитнес: собирается силовая рама со штангой, скамья, стойка гантелей
 * и гири. Потом штанга ходит вверх-вниз — идёт подход.
 */
export function mountFitness(canvas, options) {
  return mountScene(canvas, {
    ...options,
    build({ scene, geo, material, part, disposables, Vector3 }) {
      const floor = material(0x1b1620, { roughness: 0.95 })
      const mat = material(0x2a2230, { roughness: 0.9 })
      const frame = material(0x6a6372, { metalness: 0.25, roughness: 0.5 })
      const chrome = material(0xc9ced4, { metalness: 0.9, roughness: 0.2 })
      const plate = material(0x17151a, { roughness: 0.6 })
      const rubber = material(options.accent, { roughness: 0.5, emissiveIntensity: 0.1 })
      const pad = material(0x4a4152, { roughness: 0.7 })
      const iron = material(0x2d2b30, { metalness: 0.5, roughness: 0.5 })
      const sphere = new SphereGeometry(0.5, 20, 14)
      const handle = new TorusGeometry(0.32, 0.07, 10, 20, Math.PI)
      disposables.push(sphere, handle)
      const side = [0, 0, Math.PI / 2]

      let o = 0
      part(geo.box, floor, { pos: [0, 0.02, 0], size: [13, 0.04, 8], order: o++, from: [0, -1, 0], glow: false })
      part(geo.box, mat, { pos: [0, 0.06, 0.2], size: [5.2, 0.05, 4], order: o++, from: [0, -1, 0], glow: false })

      // рама: четыре стойки и верхние перекладины
      ;[-1.35, 1.35].forEach((x) =>
        [-0.9, 0.9].forEach((z) => part(geo.box, frame, { pos: [x, 2.2, z], size: [0.2, 4.4, 0.2], order: o, from: [0, 6, 0], flash: x < 0 && z < 0 })),
      )
      o++
      ;[-1.35, 1.35].forEach((x) => part(geo.box, frame, { pos: [x, 4.35, 0], size: [0.2, 0.2, 2.0], order: o, from: [0, 3, 0] }))
      ;[-0.9, 0.9].forEach((z) => part(geo.box, frame, { pos: [0, 4.35, z], size: [2.9, 0.2, 0.2], order: o, from: [0, 3, 0] }))
      o++
      // крюки под гриф
      ;[-1.35, 1.35].forEach((x) => part(geo.box, chrome, { pos: [x, 2.1, 0.98], size: [0.24, 0.1, 0.3], order: o, from: [0, 2, 0], glow: false }))
      o++

      // скамья под грифом
      part(geo.box, frame, { pos: [0, 0.3, 0.5], size: [0.3, 0.5, 2.2], order: o++, from: [0, 3, 0] })
      part(geo.box, pad, { pos: [0, 0.65, 0.5], size: [0.8, 0.2, 2.4], order: o++, from: [0, 3, 0] })

      // штанга с блинами — потом ходит вверх-вниз
      const bar = new Group()
      bar.position.set(0, 2.25, 0.98)
      scene.add(bar)
      part(geo.cyl, chrome, { pos: [0, 0, 0], size: [0.1, 4.6, 0.1], rot: side, order: o++, parent: bar, from: [0, 3, 0], flash: true })
      ;[1, -1].forEach((s) => {
        part(geo.cyl, rubber, { pos: [s * 1.75, 0, 0], size: [1.3, 0.16, 1.3], rot: side, order: o, parent: bar, from: [s * 3, 0, 0] })
        part(geo.cyl, plate, { pos: [s * 1.95, 0, 0], size: [1.0, 0.14, 1.0], rot: side, order: o + 0.5, parent: bar, from: [s * 3, 0, 0], glow: false })
        part(geo.cyl, chrome, { pos: [s * 2.1, 0, 0], size: [0.2, 0.1, 0.2], rot: side, order: o + 0.7, parent: bar, from: [s * 3, 0, 0], glow: false })
      })
      o += 2

      // стойка с гантелями
      part(geo.box, frame, { pos: [4.2, 0.6, -1.6], size: [2.6, 0.08, 0.9], order: o++, from: [0, 3, 0] })
      part(geo.box, frame, { pos: [4.2, 1.25, -1.6], size: [2.6, 0.08, 0.9], order: o++, from: [0, 3, 0] })
      ;[3.1, 5.3].forEach((x) => part(geo.box, frame, { pos: [x, 0.65, -1.6], size: [0.1, 1.3, 0.8], order: o, from: [0, 3, 0], glow: false }))
      o++
      ;[0.75, 1.4].forEach((y, row) =>
        [3.65, 4.4, 5.1].forEach((x, i) => {
          const r = 0.3 + (row + i) * 0.03
          ;[-0.22, 0.22].forEach((dz) =>
            part(geo.cyl, row ? rubber : iron, { pos: [x, y + r / 2, -1.6 + dz], size: [r, 0.16, r], rot: [Math.PI / 2, 0, 0], order: o + row + i * 0.2, from: [0, 3, 0], glow: false }),
          )
          part(geo.cyl, chrome, { pos: [x, y + r / 2, -1.6], size: [0.07, 0.3, 0.07], rot: [Math.PI / 2, 0, 0], order: o + row + i * 0.2, from: [0, 3, 0], glow: false })
        }),
      )
      o += 3

      // гири
      ;[[-3.6, 0.9], [-4.4, 0.7], [-3.9, 0.55]].forEach(([x, s], i) => {
        const z = -1.2 + i * 0.9
        part(sphere, i === 0 ? rubber : iron, { pos: [x, s * 0.45, z], size: [s, s * 0.9, s], order: o + i * 0.4, from: [0, 3, 0], glow: i === 0 })
        part(handle, iron, { pos: [x, s * 0.82, z], size: [s, s, s], order: o + i * 0.4, from: [0, 3, 0], glow: false })
      })

      return {
        target: new Vector3(0.2, 2.0, 0),
        radius: 21,
        height: 6,
        angle: 1.05,
        sway: 0.4,
        spin: 0.2,
        step: 0.045,
        fog: [22, 48],
        update({ elapsed, done, assembled }) {
          if (!done) return
          // подход: пауза на крюках, восемь повторов, отдых
          const t = (elapsed - assembled) % 12
          const rep = t > 1.5 && t < 9.5 ? (1 - Math.cos(((t - 1.5) / 8) * Math.PI * 2 * 4)) / 2 : 0
          bar.position.y = 2.25 - rep * 0.95
          bar.position.z = 0.98 - Math.min(1, Math.max(0, t < 1.5 ? t / 1.5 : t > 9.5 ? 1 - (t - 9.5) / 1.5 : 1)) * 0.45
        },
      }
    },
  })
}
