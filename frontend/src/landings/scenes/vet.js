import { Group, SphereGeometry } from 'three'
import { mountScene } from './engine'

/**
 * Ветклиника: собирается смотровой стол, на него запрыгивает пёс,
 * рядом монитор с пульсом и полки с лекарствами. Пёс виляет хвостом.
 */
export function mountVet(canvas, options) {
  return mountScene(canvas, {
    ...options,
    build({ scene, geo, material, part, disposables, Vector3 }) {
      const floor = material(0x18211b, { roughness: 0.9 })
      const wall = material(0x1f2b23, { roughness: 0.85 })
      const steel = material(0xbfc7cc, { metalness: 0.75, roughness: 0.3 })
      const white = material(0xe8ece6, { roughness: 0.5 })
      const fur = material(0xc8955d, { roughness: 0.85 })
      const furDark = material(0x7a5232, { roughness: 0.85 })
      const black = material(0x15171a, { roughness: 0.4 })
      const collar = material(options.accent, { roughness: 0.4, emissiveIntensity: 0.15 })
      const paw = material(options.accent, { roughness: 0.5, emissiveIntensity: 0.1 })
      const screen = material(0x0d1a12, { roughness: 0.3, emissive: options.accent, emissiveIntensity: 0.2 })
      const bottles = [0xf2efe4, 0x6fa7d8, 0xe9b65c, 0xd86f6f].map((c) => material(c, { roughness: 0.35 }))
      const sphere = new SphereGeometry(0.5, 20, 14)
      disposables.push(sphere)

      let o = 0
      part(geo.box, floor, { pos: [0, 0.02, 0], size: [11, 0.04, 7], order: o++, from: [0, -1, 0], glow: false })
      part(geo.box, wall, { pos: [0, 3, -2.6], size: [11, 6, 0.2], order: o++, from: [0, -6, 0], glow: false })

      // смотровой стол
      part(geo.box, steel, { pos: [0, 0.05, 0], size: [1.6, 0.1, 1.0], order: o++, from: [0, 3, 0] })
      part(geo.cyl, steel, { pos: [0, 0.55, 0], size: [0.5, 1.0, 0.5], order: o++, from: [0, 3, 0] })
      part(geo.box, steel, { pos: [0, 1.08, 0], size: [3.4, 0.12, 1.6], order: o++, from: [0, 3, 0], flash: true })

      // пёс: туловище и лапы
      ;[-0.65, 0.65].forEach((x) =>
        [-0.25, 0.25].forEach((z) => part(geo.box, fur, { pos: [x, 1.44, z], size: [0.26, 0.6, 0.26], order: o, from: [0, 4, 0], glow: false })),
      )
      o++
      part(geo.box, fur, { pos: [0, 1.95, 0], size: [1.8, 0.8, 0.82], order: o++, from: [0, 4, 0], flash: true })
      part(geo.box, collar, { pos: [0.8, 2.15, 0], size: [0.16, 0.6, 0.88], order: o++, from: [0, 4, 0] })

      const head = new Group()
      head.position.set(1.15, 2.55, 0)
      scene.add(head)
      part(geo.box, fur, { pos: [0, 0, 0], size: [0.72, 0.66, 0.64], order: o++, parent: head, from: [0, 4, 0] })
      part(geo.box, fur, { pos: [0.48, -0.12, 0], size: [0.42, 0.34, 0.42], order: o++, parent: head, from: [2, 0, 0], glow: false })
      part(geo.box, black, { pos: [0.7, -0.04, 0], size: [0.08, 0.13, 0.15], order: o, parent: head, from: [2, 0, 0], glow: false })
      ;[-0.17, 0.17].forEach((z) => {
        part(geo.box, black, { pos: [0.37, 0.1, z], size: [0.03, 0.09, 0.09], order: o, parent: head, from: [2, 0, 0], glow: false })
        part(geo.box, furDark, { pos: [-0.06, 0.38, z * 1.35], size: [0.22, 0.34, 0.12], rot: [z > 0 ? 0.25 : -0.25, 0, 0], order: o, parent: head, from: [0, 2, 0], glow: false })
      })
      o++
      const tail = new Group()
      tail.position.set(-0.9, 2.15, 0)
      scene.add(tail)
      part(geo.box, furDark, { pos: [-0.22, 0.2, 0], size: [0.5, 0.14, 0.14], rot: [0, 0, -0.7], order: o++, parent: tail, from: [-2, 0, 0], glow: false })

      // монитор с пульсом на тумбе
      part(geo.box, white, { pos: [3.5, 0.9, -1.8], size: [2.0, 1.8, 1.0], order: o++, from: [0, 3, 0] })
      part(geo.box, black, { pos: [3.5, 2.35, -1.95], size: [1.3, 0.9, 0.1], order: o++, from: [0, 3, 0] })
      part(geo.box, screen, { pos: [3.5, 2.35, -1.89], size: [1.15, 0.75, 0.02], order: o++, from: [0, 3, 0], glow: false })

      // полки с лекарствами
      part(geo.box, white, { pos: [-3.4, 2.4, -2.3], size: [2.6, 0.1, 0.5], order: o++, from: [0, 3, 0] })
      part(geo.box, white, { pos: [-3.4, 3.5, -2.3], size: [2.6, 0.1, 0.5], order: o++, from: [0, 3, 0] })
      ;[-4.3, -3.8, -3.3, -2.8, -2.4].forEach((x, i) => {
        const h = 0.4 + (i % 3) * 0.15
        part(geo.cyl, bottles[i % 4], { pos: [x, 2.45 + h / 2, -2.3], size: [0.3, h, 0.3], order: o + i * 0.3, from: [0, 3, 0], glow: false })
        part(geo.cyl, bottles[(i + 2) % 4], { pos: [x + 0.15, 3.55 + h / 2, -2.3], size: [0.26, h, 0.26], order: o + i * 0.3, from: [0, 3, 0], glow: false })
      })
      o += 2

      // лапа-вывеска
      part(sphere, paw, { pos: [0.4, 4.2, -2.45], size: [1.05, 0.85, 0.2], order: o++, from: [0, 0, 2], flash: true })
      ;[-0.55, -0.2, 0.2, 0.55].forEach((dx, i) =>
        part(sphere, paw, { pos: [0.4 + dx, 4.85 - (i === 0 || i === 3 ? 0.18 : 0), -2.45], size: [0.34, 0.44, 0.2], order: o, from: [0, 0, 2], glow: false }),
      )

      return {
        target: new Vector3(0.4, 2.2, 0),
        radius: 18,
        height: 5.2,
        angle: 1.15,
        sway: 0.35,
        spin: 0.2,
        step: 0.05,
        fog: [20, 44],
        update({ elapsed, done, assembled }) {
          if (!done) return
          const t = elapsed - assembled
          tail.rotation.y = Math.sin(t * 13) * 0.7
          head.rotation.z = Math.sin(t * 1.2) * 0.12
          head.rotation.y = Math.sin(t * 0.7) * 0.25
          // пульс: короткий двойной всплеск раз в секунду
          const beat = t % 1
          screen.emissiveIntensity = 0.2 + (beat < 0.08 ? 1 : beat > 0.16 && beat < 0.24 ? 0.6 : 0)
        },
      }
    },
  })
}
