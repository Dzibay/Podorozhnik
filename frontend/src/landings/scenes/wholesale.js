import { Group } from 'three'
import { mountScene } from './engine'

/**
 * Оптовые поставки: собирается склад — стеллажи, паллеты с коробками.
 * Потом погрузчик подъезжает к паллете, поднимает её и отвозит к воротам.
 */
export function mountWholesale(canvas, options) {
  return mountScene(canvas, {
    ...options,
    build({ scene, geo, material, part, grid, Vector3 }) {
      grid(40, 0.3)
      const floor = material(0x1d1e1a, { roughness: 0.9 })
      const mark = material(0xd9c24a, { roughness: 0.7 })
      const rack = material(0x3c6fb0, { roughness: 0.5, metalness: 0.4 })
      const beam = material(0xe58a2b, { roughness: 0.5, metalness: 0.3 })
      const pallet = material(0x8a6a45, { roughness: 0.9 })
      const boxes = [0xc29a66, 0xb08655, 0xd2ab78].map((c) => material(c, { roughness: 0.85 }))
      const truck = material(options.accent, { roughness: 0.45, emissiveIntensity: 0.1 })
      const dark = material(0x22241f, { roughness: 0.6, metalness: 0.4 })
      const tyre = material(0x111111, { roughness: 0.9 })
      const steel = material(0x8b9096, { metalness: 0.7, roughness: 0.35 })

      let o = 0
      part(geo.box, floor, { pos: [0, 0.02, 0], size: [16, 0.04, 11], order: o++, from: [0, -1, 0], glow: false })
      ;[-0.2, 1.8].forEach((z) => part(geo.box, mark, { pos: [0, 0.05, z], size: [14, 0.02, 0.1], order: o, from: [0, -1, 0], glow: false }))
      o++

      // стеллажи: ряд из трёх секций, на полках паллеты с коробками
      const levels = [0.15, 1.6, 3.05]
      ;[-2.2].forEach((z, row) => {
        ;[-4.6, -1.6, 1.4, 4.4].forEach((x) => part(geo.box, rack, { pos: [x, 2.3, z], size: [0.14, 4.6, 1.4], order: o, from: [0, 5, 0], glow: false }))
        levels.slice(1).forEach((y) => [-0.62, 0.62].forEach((dz) => part(geo.box, beam, { pos: [-0.1, y, z + dz], size: [9.0, 0.14, 0.1], order: o + 0.5, from: [0, 5, 0], flash: row === 0 && y < 2 && dz > 0 })))
        o++
        ;[-3.1, -0.1, 2.9].forEach((x, c) =>
          levels.forEach((y, l) => {
            if ((row + c + l) % 4 === 3) return
            part(geo.box, pallet, { pos: [x, y + 0.1, z], size: [1.9, 0.16, 1.1], order: o, from: [0, 3, 0], glow: false })
            const n = 2 + ((c + l) % 2)
            for (let k = 0; k < n; k++) part(geo.box, boxes[(k + l) % 3], { pos: [x - 0.6 + k * (1.2 / (n - 1)), y + 0.5, z], size: [0.6, 0.6, 0.9], order: o + 0.3 + k * 0.1, from: [0, 3, 0], glow: false })
          }),
        )
        o++
      })

      // паллета, которую везёт погрузчик
      const load = new Group()
      scene.add(load)
      part(geo.box, pallet, { pos: [0, 0.1, 0], size: [1.4, 0.16, 1.1], order: o, parent: load, from: [0, 3, 0], glow: false })
      ;[[-0.32, 0.45, -0.25], [0.32, 0.45, -0.25], [-0.32, 0.45, 0.25], [0.32, 0.45, 0.25], [0, 1.0, 0]].forEach(([x, y, z], k) =>
        part(geo.box, boxes[k % 3], { pos: [x, y, z], size: [0.6, 0.55, 0.48], order: o + k * 0.1, parent: load, from: [0, 3, 0], glow: false }),
      )
      o++

      // погрузчик: кузов, мачта и вилы; вилы смотрят в +x
      const lift = new Group()
      scene.add(lift)
      part(geo.box, truck, { pos: [-0.9, 0.75, 0], size: [1.8, 0.9, 1.2], order: o++, parent: lift, from: [0, 4, 0], flash: true })
      part(geo.box, dark, { pos: [-1.6, 0.85, 0], size: [0.5, 0.9, 1.15], order: o, parent: lift, from: [0, 4, 0], glow: false })
      ;[-0.45, 0.45].forEach((z) => part(geo.box, dark, { pos: [-0.75, 1.75, z], size: [0.08, 1.1, 0.08], order: o, parent: lift, from: [0, 4, 0], glow: false }))
      part(geo.box, truck, { pos: [-0.75, 2.32, 0], size: [1.2, 0.08, 1.2], order: o++, parent: lift, from: [0, 4, 0], glow: false })
      ;[[-1.5, -0.62], [-1.5, 0.62], [-0.3, -0.62], [-0.3, 0.62]].forEach(([x, z]) =>
        part(geo.cyl, tyre, { pos: [x, 0.32, z], size: [0.6, 0.24, 0.6], rot: [Math.PI / 2, 0, 0], order: o, parent: lift, from: [0, 4, 0], glow: false }),
      )
      ;[-0.5, 0.5].forEach((z) => part(geo.box, steel, { pos: [0.05, 1.5, z], size: [0.1, 2.8, 0.1], order: o + 0.5, parent: lift, from: [0, 4, 0], glow: false }))
      o++
      const forks = new Group()
      forks.position.set(0.12, 0, 0)
      lift.add(forks)
      ;[-0.3, 0.3].forEach((z) => part(geo.box, steel, { pos: [0.6, 0.14, z], size: [1.2, 0.06, 0.14], order: o, parent: forks, from: [0, 4, 0], glow: false }))
      part(geo.box, steel, { pos: [0.02, 0.5, 0], size: [0.06, 0.8, 1.0], order: o++, parent: forks, from: [0, 4, 0], glow: false })

      // погрузчик возит паллету между двумя точками проезда, туда и обратно
      const A = -3.6
      const B = 2.4
      const place = (x, h) => {
        lift.position.set(x, 0, 0.8)
        forks.position.y = h
        load.position.set(x + 0.72, h, 0.8)
      }
      place(A, 0)

      return {
        target: new Vector3(0, 1.9, 0),
        radius: 22,
        height: 7,
        angle: 1.2,
        sway: 0.4,
        spin: 0.18,
        step: 0.012,
        fog: [24, 54],
        update({ elapsed, done, assembled }) {
          if (!done) return
          // полцикла 8 с: поднять вилы, проехать, опустить, постоять; следующая половина — обратно
          const T = (elapsed - assembled) % 16
          const t = T % 8
          const s = (a, b) => {
            const k = Math.min(1, Math.max(0, (t - a) / (b - a)))
            return k * k * (3 - 2 * k)
          }
          const [from, to] = T < 8 ? [A, B] : [B, A]
          place(from + (to - from) * s(1.5, 5), (s(0, 1.5) - s(5, 6.5)) * 0.9)
        },
      }
    },
  })
}
