import { ConeGeometry, Group } from 'three'
import { mountScene } from './engine'

/**
 * Спецтехника: собирается экскаватор — гусеницы, поворотная платформа,
 * кабина, стрела, рукоять и ковш. Потом он копает: опускает стрелу,
 * загребает ковшом и разворачивается к отвалу.
 */
export function mountMachinery(canvas, options) {
  return mountScene(canvas, {
    ...options,
    build({ scene, geo, material, part, grid, disposables, Vector3 }) {
      grid(40, 0.3)
      const dirt = material(0x3a2f22, { roughness: 1 })
      const pile = material(0x5b4630, { roughness: 1 })
      const track = material(0x1a1b1d, { roughness: 0.9 })
      const body = material(options.accent, { roughness: 0.45, metalness: 0.2, emissiveIntensity: 0.1 })
      const dark = material(0x2a2b2e, { roughness: 0.6, metalness: 0.4 })
      const glass = material(0x13202b, { roughness: 0.1, metalness: 0.6 })
      const steel = material(0x7d838a, { metalness: 0.7, roughness: 0.35 })
      const cone = new ConeGeometry(0.5, 1, 18)
      disposables.push(cone)

      let o = 0
      part(geo.box, dirt, { pos: [1, 0.02, 0], size: [14, 0.04, 9], order: o++, from: [0, -1, 0], glow: false })
      part(cone, pile, { pos: [5.6, 0.7, 2.6], size: [3.4, 1.4, 3.0], order: o++, from: [0, -2, 0], glow: false })
      part(cone, pile, { pos: [-4.8, 0.55, -2.2], size: [2.8, 1.1, 2.6], order: o++, from: [0, -2, 0], glow: false })

      // гусеницы
      ;[-1.15, 1.15].forEach((z) => {
        part(geo.box, track, { pos: [0, 0.42, z], size: [3.8, 0.7, 0.8], order: o, from: [0, 3, 0], flash: z < 0 })
        ;[-1.9, 1.9].forEach((x) => part(geo.cyl, track, { pos: [x, 0.42, z], size: [0.7, 0.8, 0.7], rot: [Math.PI / 2, 0, 0], order: o, from: [0, 3, 0], glow: false }))
        for (let i = 0; i < 4; i++) part(geo.cyl, steel, { pos: [-1.2 + i * 0.8, 0.42, z + (z > 0 ? 0.41 : -0.41)], size: [0.36, 0.04, 0.36], rot: [Math.PI / 2, 0, 0], order: o + 0.5, from: [0, 3, 0], glow: false })
      })
      o++
      part(geo.cyl, dark, { pos: [0, 0.88, 0], size: [1.6, 0.25, 1.6], order: o++, from: [0, 3, 0] })

      // поворотная платформа со всем, что на ней
      const turret = new Group()
      turret.position.set(0, 1.0, 0)
      scene.add(turret)
      part(geo.box, body, { pos: [-0.3, 0.35, 0], size: [3.2, 0.6, 2.4], order: o++, parent: turret, from: [0, 4, 0], flash: true })
      part(geo.box, dark, { pos: [-1.75, 0.6, 0], size: [0.5, 0.9, 2.3], order: o++, parent: turret, from: [-3, 0, 0] })
      part(geo.box, body, { pos: [-0.9, 1.05, -0.4], size: [1.4, 0.8, 1.4], order: o++, parent: turret, from: [0, 4, 0] })
      part(geo.box, body, { pos: [0.6, 1.25, 0.6], size: [1.2, 1.6, 1.0], order: o++, parent: turret, from: [0, 4, 0] })
      part(geo.box, glass, { pos: [1.21, 1.4, 0.6], size: [0.02, 1.1, 0.85], order: o, parent: turret, from: [0, 4, 0], glow: false })
      part(geo.box, glass, { pos: [0.6, 1.4, 1.11], size: [1.0, 1.1, 0.02], order: o++, parent: turret, from: [0, 4, 0], glow: false })

      // стрела → рукоять → ковш, каждый на своём шарнире
      const boom = new Group()
      boom.position.set(1.0, 0.7, -0.35)
      boom.rotation.z = 0.75
      turret.add(boom)
      part(geo.box, body, { pos: [1.7, 0, 0], size: [3.5, 0.45, 0.45], order: o++, parent: boom, from: [0, 4, 0], flash: true })
      const arm = new Group()
      arm.position.set(3.4, 0, 0)
      arm.rotation.z = -1.9
      boom.add(arm)
      part(geo.box, body, { pos: [1.2, 0, 0], size: [2.5, 0.35, 0.35], order: o++, parent: arm, from: [0, 4, 0] })
      part(geo.cyl, steel, { pos: [0.2, 0.3, 0], size: [0.12, 1.4, 0.12], rot: [0, 0, Math.PI / 2], order: o, parent: arm, from: [0, 4, 0], glow: false })
      const bucket = new Group()
      bucket.position.set(2.4, 0, 0)
      bucket.rotation.z = -0.4
      arm.add(bucket)
      part(geo.box, dark, { pos: [0.35, -0.25, 0], size: [0.8, 0.7, 0.9], order: o++, parent: bucket, from: [0, 4, 0] })
      for (let i = 0; i < 4; i++) part(geo.box, steel, { pos: [0.78, -0.55, -0.33 + i * 0.22], size: [0.18, 0.2, 0.1], order: o, parent: bucket, from: [0, 4, 0], glow: false })

      return {
        target: new Vector3(0.8, 1.9, 0),
        radius: 25,
        height: 7,
        angle: 0.95,
        sway: 0.45,
        spin: 0.18,
        step: 0.05,
        fog: [24, 52],
        update({ elapsed, done, assembled }) {
          if (!done) return
          // цикл 9 с: опустить стрелу, загрести, поднять, повернуть к отвалу, высыпать, вернуться
          const t = (elapsed - assembled) % 9
          const s = (a, b) => {
            const k = Math.min(1, Math.max(0, (t - a) / (b - a)))
            return k * k * (3 - 2 * k)
          }
          const down = s(0, 1.5) - s(3, 4.5)
          const scoop = s(1.5, 3) - s(5.5, 6.5)
          const swing = s(3.5, 5.5) - s(7, 9)
          boom.rotation.z = 0.75 - down * 0.65
          arm.rotation.z = -1.9 + scoop * 0.7
          bucket.rotation.z = -0.4 + scoop * 1.2
          turret.rotation.y = -swing * 1.1
        },
      }
    },
  })
}
