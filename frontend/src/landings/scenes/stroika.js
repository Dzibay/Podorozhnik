import { Group } from 'three'
import { mountScene } from './engine'

/**
 * Стройка: на фундаменте ряд за рядом растут стены из блоков, ложится
 * перекрытие и кровля, рядом работает башенный кран с поддоном на крюке.
 */
export function mountStroika(canvas, options) {
  return mountScene(canvas, {
    ...options,
    build({ scene, geo, material, part, grid, Vector3 }) {
      grid(44, 0.45)
      const concrete = material(0x8a8d91, { roughness: 0.85 })
      const block = material(0xc9c2b6, { roughness: 0.9 })
      const blockAlt = material(0xb9b1a4, { roughness: 0.9 })
      const roof = material(0x3c4450, { roughness: 0.6, metalness: 0.2 })
      const frame = material(0x2b2f36, { roughness: 0.5 })
      const yellow = material(options.accent, { roughness: 0.45, metalness: 0.3, emissiveIntensity: 0.15 })

      const W = 8 // ширина дома по x
      const D = 6 // глубина по z
      const BH = 0.5 // высота ряда блоков
      const ROWS = 6
      let o = 0

      part(geo.box, concrete, { pos: [0, 0.2, 0], size: [W + 0.6, 0.4, D + 0.6], order: o++, from: [0, -1, 0], flash: true })

      // проёмы окон и двери: [сторона, позиция, нижний ряд, верхний ряд]
      const openings = [
        ['front', -2, 2, 4],
        ['front', 2.5, 2, 4],
        ['front', 0, 0, 4],
        ['back', -1.5, 2, 4],
        ['back', 2, 2, 4],
        ['left', 0, 2, 4],
        ['right', -1, 2, 4],
      ]
      const isOpen = (side, p, row) => openings.some(([s, c, a, b]) => s === side && Math.abs(p - c) < 0.6 && row >= a && row < b)

      for (let row = 0; row < ROWS; row++) {
        const y = 0.4 + BH / 2 + row * BH
        const shift = row % 2 ? 0.5 : 0
        const mat = row % 2 ? blockAlt : block
        // фасад и тыл
        for (let x = -W / 2 + 0.5 + shift; x <= W / 2 - 0.5 + 0.01; x += 1) {
          if (!isOpen('front', x, row)) part(geo.box, mat, { pos: [x, y, D / 2 - 0.2], size: [0.98, BH - 0.03, 0.4], order: o + row * 100 + x + 5, from: [0, 2.4, 0] })
          if (!isOpen('back', x, row)) part(geo.box, mat, { pos: [x, y, -D / 2 + 0.2], size: [0.98, BH - 0.03, 0.4], order: o + row * 100 + x + 5.5, from: [0, 2.4, 0] })
        }
        // торцы
        for (let z = -D / 2 + 0.9 + shift; z <= D / 2 - 0.9 + 0.01; z += 1) {
          if (!isOpen('left', z, row)) part(geo.box, mat, { pos: [-W / 2 + 0.2, y, z], size: [0.4, BH - 0.03, 0.98], order: o + row * 100 + 20 + z, from: [0, 2.4, 0] })
          if (!isOpen('right', z, row)) part(geo.box, mat, { pos: [W / 2 - 0.2, y, z], size: [0.4, BH - 0.03, 0.98], order: o + row * 100 + 20.5 + z, from: [0, 2.4, 0] })
        }
      }
      o += ROWS * 100 + 50

      // перемычки над проёмами
      const lintel = 0.4 + 4 * BH + 0.1
      part(geo.box, concrete, { pos: [0, lintel, D / 2 - 0.2], size: [W - 0.2, 0.2, 0.42], order: o++ })
      part(geo.box, concrete, { pos: [0, lintel, -D / 2 + 0.2], size: [W - 0.2, 0.2, 0.42], order: o++ })

      // перекрытие и кровля
      const top = 0.4 + ROWS * BH
      part(geo.box, concrete, { pos: [0, top + 0.12, 0], size: [W + 0.3, 0.24, D + 0.3], order: o++, flash: true })
      const rise = 2
      const half = D / 2 + 0.5
      const slope = Math.atan2(rise, half)
      const len = Math.hypot(rise, half)
      ;[-1, 1].forEach((s) => {
        part(geo.box, roof, {
          pos: [0, top + 0.24 + rise / 2, (s * half) / 2],
          size: [W + 0.8, 0.14, len],
          rot: [s * slope, 0, 0],
          order: o++,
          from: [0, 3, 0],
          flash: true,
        })
      })
      part(geo.box, frame, { pos: [0, top + 0.3 + rise, 0], size: [W + 0.9, 0.16, 0.2], order: o++ })

      // башенный кран
      const cx = 7.5
      const cz = -5
      const mastH = 12
      ;[[-0.4, -0.4], [0.4, -0.4], [-0.4, 0.4], [0.4, 0.4]].forEach(([dx, dz], i) =>
        part(geo.box, yellow, { pos: [cx + dx, mastH / 2, cz + dz], size: [0.12, mastH, 0.12], order: -40 + i, from: [0, -mastH, 0], glow: false }),
      )
      for (let y = 1; y < mastH; y += 1.5) {
        part(geo.box, yellow, { pos: [cx, y, cz - 0.4], size: [0.8, 0.07, 0.07], order: -30 + y * 0.1, from: [0, -mastH, 0], glow: false })
        part(geo.box, yellow, { pos: [cx, y, cz + 0.4], size: [0.8, 0.07, 0.07], order: -30 + y * 0.1, from: [0, -mastH, 0], glow: false })
      }
      // поворотная часть: стрела, противовес, тележка с крюком
      const jib = new Group()
      jib.position.set(cx, mastH, cz)
      scene.add(jib)
      part(geo.box, frame, { pos: [0, 0.4, 0], size: [1.1, 0.8, 1.1], order: -20, parent: jib, from: [0, 2, 0] })
      part(geo.box, yellow, { pos: [-5, 0.9, 0], size: [10, 0.35, 0.5], order: -19, parent: jib, from: [0, 2, 0], glow: false })
      part(geo.box, yellow, { pos: [2.2, 0.9, 0], size: [3.4, 0.3, 0.45], order: -18, parent: jib, from: [0, 2, 0], glow: false })
      part(geo.box, concrete, { pos: [3.4, 0.4, 0], size: [1, 0.9, 0.9], order: -17, parent: jib, from: [0, 2, 0] })
      const cable = part(geo.box, frame, { pos: [-6.5, -2.3, 0], size: [0.04, 6, 0.04], order: -16, parent: jib, from: [0, 2, 0], glow: false })
      const load = part(geo.box, block, { pos: [-6.5, -5.5, 0], size: [1.2, 0.6, 0.9], order: -15, parent: jib, from: [0, 2, 0] })

      return {
        target: new Vector3(2.5, 5, -1.5),
        radius: 34,
        height: 12,
        angle: 0.55,
        step: 0.022,
        drop: 0.55,
        fog: [28, 60],
        update({ elapsed }) {
          // стрела плавно ходит туда-обратно, груз покачивается
          jib.rotation.y = Math.sin(elapsed * 0.25) * 0.9 - 0.2
          const sway = Math.sin(elapsed * 1.3) * 0.06
          load.rotation.z = sway
          cable.rotation.z = sway * 0.5
        },
      }
    },
  })
}
