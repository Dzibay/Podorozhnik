import { CylinderGeometry, Group, SphereGeometry } from 'three'
import { mountScene } from './engine'

/**
 * Доставка еды: слой за слоем собирается бургер, рядом встают картошка
 * и фирменный пакет доставки. Готовый бургер медленно вращается.
 */
export function mountFood(canvas, options) {
  return mountScene(canvas, {
    ...options,
    build({ scene, geo, material, part, disposables, Vector3 }) {
      const board = material(0x6b4a33, { roughness: 0.8 })
      const bun = material(0xd89a4e, { roughness: 0.55 })
      const patty = material(0x5a3322, { roughness: 0.85 })
      const cheese = material(0xf2c230, { roughness: 0.4 })
      const tomato = material(0xd8432f, { roughness: 0.4 })
      const lettuce = material(0x6dbb4a, { roughness: 0.6 })
      const seed = material(0xf6ecd6, { roughness: 0.6 })
      const bag = material(options.accent, { roughness: 0.6, emissiveIntensity: 0.1 })
      const paper = material(0xe9e1d2, { roughness: 0.8 })
      const fries = material(0xf0c75e, { roughness: 0.6 })
      const box = material(0xc8372d, { roughness: 0.55 })
      const dome = new SphereGeometry(0.5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2)
      const wavy = new CylinderGeometry(0.5, 0.5, 1, 14)
      disposables.push(dome, wavy)

      let o = 0
      part(geo.cyl, board, { pos: [0, 0.1, 0], size: [5.6, 0.2, 5.6], order: o++, from: [0, -2, 0], glow: false })

      // бургер: слои падают сверху по очереди
      const burger = new Group()
      burger.position.set(0, 0.2, 0)
      scene.add(burger)
      const layers = [
        [geo.cyl, bun, 0.45, 2.6, false],
        [wavy, lettuce, 0.12, 3.0, false],
        [geo.cyl, patty, 0.5, 2.75, true],
        [geo.box, cheese, 0.08, 2.4, false],
        [geo.cyl, tomato, 0.16, 2.3, false],
        [geo.cyl, patty, 0.5, 2.75, false],
        [wavy, lettuce, 0.12, 2.9, false],
      ]
      let y = 0
      layers.forEach(([g, m, h, d, flash]) => {
        const isBox = g === geo.box
        part(g, m, { pos: [0, y + h / 2, 0], size: [d, h, d], rot: isBox ? [0, Math.PI / 4, 0] : [0, 0, 0], order: o++, parent: burger, from: [0, 6, 0], flash })
        y += h
      })
      part(dome, bun, { pos: [0, y, 0], size: [2.7, 2.2, 2.7], order: o++, parent: burger, from: [0, 6, 0], flash: true })
      // кунжут на верхней булке
      for (let i = 0; i < 9; i++) {
        const a = i * 2.4
        const rr = 0.35 + (i % 3) * 0.3
        const hy = Math.sqrt(Math.max(0, 1 - (rr / 1.35) ** 2)) * 1.1
        part(geo.box, seed, { pos: [Math.cos(a) * rr, y + hy - 0.02, Math.sin(a) * rr], size: [0.16, 0.05, 0.08], rot: [0, a, 0], order: o, parent: burger, from: [0, 3, 0], glow: false })
      }
      o++

      // картошка в коробке
      part(geo.box, box, { pos: [3.8, 0.8, 1.2], size: [1.3, 1.6, 0.9], rot: [0, -0.3, 0], order: o++, from: [0, 4, 0] })
      for (let i = 0; i < 9; i++) {
        const x = 3.8 + ((i % 3) - 1) * 0.34
        const z = 1.2 + (Math.floor(i / 3) - 1) * 0.22
        part(geo.box, fries, { pos: [x, 1.8 + (i % 2) * 0.2, z], size: [0.14, 0.9, 0.14], rot: [(i % 3 - 1) * 0.12, 0, (i % 2 ? 1 : -1) * 0.1], order: o + i * 0.2, from: [0, 3, 0], glow: false })
      }
      o += 2

      // пакет доставки
      part(geo.box, bag, { pos: [-4.0, 1.5, -0.8], size: [1.9, 3, 1.3], rot: [0, 0.35, 0], order: o++, from: [0, 5, 0], flash: true })
      part(geo.box, paper, { pos: [-4.0, 3.1, -0.8], size: [1.9, 0.2, 1.3], rot: [0, 0.35, 0], order: o++, from: [0, 5, 0], glow: false })

      return {
        target: new Vector3(-0.4, 1.7, 0),
        radius: 17,
        height: 6,
        angle: 1.2,
        sway: 0.4,
        spin: 0.18,
        step: 0.08,
        fog: [18, 42],
        update({ elapsed, done, assembled }) {
          if (!done) return
          burger.rotation.y = (elapsed - assembled) * 0.4
        },
      }
    },
  })
}
