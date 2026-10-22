import { Group } from 'three'
import { mountScene } from './engine'

/**
 * Окна и двери: собирается стена с проёмами, в них встают рамы, стеклопакет
 * и входная дверь. Потом створка открывается внутрь, за ней — дверь.
 */
export function mountWindows(canvas, options) {
  return mountScene(canvas, {
    ...options,
    build({ scene, geo, material, part, Vector3 }) {
      const ground = material(0x141a21, { roughness: 0.95 })
      const wall = material(0x3b4450, { roughness: 0.9 })
      const inside = material(0x232a33, { roughness: 0.9 })
      const pvc = material(0xeef2f5, { roughness: 0.35 })
      const glass = material(0x7fb6cf, { roughness: 0.05, metalness: 0.6, transparent: true, opacity: 0.55 })
      const door = material(options.accent, { roughness: 0.4, emissiveIntensity: 0.1 })
      const metal = material(0xc9ced4, { metalness: 0.85, roughness: 0.25 })
      const sill = material(0xdfe5ea, { roughness: 0.5 })

      let o = 0
      part(geo.box, ground, { pos: [0, 0.02, 1], size: [13, 0.04, 9], order: o++, from: [0, -1, 0], glow: false })
      part(geo.box, inside, { pos: [-0.5, 2.5, -3], size: [9.5, 5, 0.2], order: o++, from: [0, -5, 0], glow: false })

      // стена кусками вокруг проёма окна (x −3.2…−0.4, y 1.2…4) и двери (x 1…2.6, y 0…3.8)
      const T = 0.4
      ;[
        [-5, -3.2, 0, 5],
        [-0.4, 1.0, 0, 5],
        [2.6, 4.0, 0, 5],
        [-3.2, -0.4, 0, 1.2],
        [-3.2, -0.4, 4, 5],
        [1.0, 2.6, 3.8, 5],
      ].forEach(([x0, x1, y0, y1], i) =>
        part(geo.box, wall, { pos: [(x0 + x1) / 2, (y0 + y1) / 2, 0], size: [x1 - x0, y1 - y0, T], order: o + i * 0.3, from: [0, -4, 0], glow: false }),
      )
      o += 2

      // рама окна и отлив
      ;[
        [-1.8, 1.25, 2.8, 0.12],
        [-1.8, 3.95, 2.8, 0.12],
        [-3.15, 2.6, 0.12, 2.8],
        [-0.45, 2.6, 0.12, 2.8],
        [-1.8, 2.6, 0.1, 2.6],
      ].forEach(([x, y, sx, sy]) => part(geo.box, pvc, { pos: [x, y, 0], size: [sx, sy, 0.3], order: o, from: [0, 0, 3], flash: x === -1.8 && y > 3 }))
      o++
      part(geo.box, sill, { pos: [-1.8, 1.15, 0.35], size: [3.0, 0.06, 0.45], order: o++, from: [0, 0, 3] })
      // глухая половина
      part(geo.box, glass, { pos: [-1.1, 2.6, 0], size: [1.2, 2.55, 0.04], order: o++, from: [0, 0, 3], glow: false })

      // открывающаяся створка на петлях слева
      const sash = new Group()
      sash.position.set(-3.08, 2.6, 0.05)
      scene.add(sash)
      ;[
        [0.65, 1.22, 1.3, 0.1],
        [0.65, -1.22, 1.3, 0.1],
        [0.05, 0, 0.1, 2.54],
        [1.25, 0, 0.1, 2.54],
      ].forEach(([x, y, sx, sy]) => part(geo.box, pvc, { pos: [x, y, 0], size: [sx, sy, 0.12], order: o, parent: sash, from: [0, 0, 3] }))
      part(geo.box, glass, { pos: [0.65, 0, 0], size: [1.1, 2.34, 0.04], order: o, parent: sash, from: [0, 0, 3], glow: false })
      part(geo.box, metal, { pos: [1.16, 0.1, 0.1], size: [0.06, 0.3, 0.06], order: o++, parent: sash, from: [0, 0, 3], glow: false })

      // дверь: коробка, полотно на петлях, ручка
      ;[
        [1.06, 1.9, 0.12, 3.8],
        [2.54, 1.9, 0.12, 3.8],
        [1.8, 3.74, 1.6, 0.12],
      ].forEach(([x, y, sx, sy]) => part(geo.box, pvc, { pos: [x, y, 0], size: [sx, sy, 0.3], order: o, from: [0, 0, 3] }))
      o++
      const leaf = new Group()
      leaf.position.set(1.12, 0, 0.08)
      scene.add(leaf)
      part(geo.box, door, { pos: [0.68, 1.84, 0], size: [1.36, 3.62, 0.1], order: o++, parent: leaf, from: [0, 0, 4], flash: true })
      part(geo.box, door, { pos: [0.68, 2.6, 0.06], size: [1.0, 1.4, 0.04], order: o, parent: leaf, from: [0, 0, 4], glow: false })
      part(geo.box, door, { pos: [0.68, 0.9, 0.06], size: [1.0, 1.0, 0.04], order: o, parent: leaf, from: [0, 0, 4], glow: false })
      part(geo.box, metal, { pos: [1.2, 1.8, 0.12], size: [0.3, 0.06, 0.06], order: o++, parent: leaf, from: [0, 0, 4], glow: false })
      part(geo.box, sill, { pos: [1.8, 0.06, 0.5], size: [1.9, 0.12, 0.7], order: o++, from: [0, 0, 3], glow: false })

      return {
        target: new Vector3(-0.4, 2.1, 0),
        radius: 23,
        height: 4.6,
        angle: 1.15,
        sway: 0.35,
        spin: 0.2,
        step: 0.05,
        fog: [20, 46],
        update({ elapsed, done, assembled }) {
          if (!done) return
          // цикл 10 с: створка открывается и закрывается, потом дверь
          const t = (elapsed - assembled) % 10
          const pulse = (a, b) => {
            const k = t < a || t > b ? 0 : Math.sin(((t - a) / (b - a)) * Math.PI)
            return k * k * (3 - 2 * k)
          }
          sash.rotation.y = pulse(0.5, 4.5) * 1.1
          leaf.rotation.y = pulse(5, 9.5) * 1.2
        },
      }
    },
  })
}
