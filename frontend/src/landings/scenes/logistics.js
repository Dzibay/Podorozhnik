import { Group } from 'three'
import { mountScene } from './engine'

/**
 * Логистика: собирается тягач с бортовой платформой, на неё грузятся паллеты.
 * Потом фура «едет»: колёса крутятся, разметка и столбы уходят назад.
 */
export function mountLogistics(canvas, options) {
  return mountScene(canvas, {
    ...options,
    build({ scene, geo, material, part, Vector3 }) {
      const asphalt = material(0x1a1f26, { roughness: 0.95 })
      const paint = material(0xdfe5ec, { roughness: 0.6 })
      const steel = material(0x6f7a88, { metalness: 0.5, roughness: 0.4 })
      const dark = material(0x2b313a, { metalness: 0.3, roughness: 0.6 })
      const tyre = material(0x121418, { roughness: 0.9 })
      const cabMat = material(options.accent, { metalness: 0.3, roughness: 0.35, emissiveIntensity: 0.1 })
      const glass = material(0x0d1a2a, { metalness: 0.6, roughness: 0.15 })
      const crate = material(0xbba27e, { roughness: 0.8 })
      const crateAlt = material(0x8f7a5c, { roughness: 0.8 })
      const film = material(0xcfd9e6, { roughness: 0.3, metalness: 0.1 })

      let o = 0
      part(geo.box, asphalt, { pos: [0, -0.03, 0], size: [70, 0.06, 7], order: -20, from: [0, -1, 0], glow: false })
      ;[-3.5, 3.5].forEach((z) => part(geo.box, paint, { pos: [0, 0.01, z], size: [70, 0.02, 0.12], order: -19, from: [0, -1, 0], glow: false }))
      // прерывистая разметка и столбы — бегут назад, когда фура «поехала»
      const dashes = []
      for (let i = 0; i < 14; i++) dashes.push(part(geo.box, paint, { pos: [-28 + i * 4.2, 0.02, 0], size: [1.8, 0.02, 0.14], order: -18 + i * 0.1, from: [0, -1, 0], glow: false }))
      const posts = []
      for (let i = 0; i < 7; i++) {
        const g = new Group()
        g.position.set(-24 + i * 8, 0, -5)
        scene.add(g)
        part(geo.box, steel, { pos: [0, 1.6, 0], size: [0.12, 3.2, 0.12], order: -15 + i * 0.2, parent: g, from: [0, -4, 0], glow: false })
        part(geo.box, steel, { pos: [0, 3.2, 0.5], size: [0.1, 0.1, 1.1], order: -15 + i * 0.2, parent: g, from: [0, -4, 0], glow: false })
        posts.push(g)
      }

      const truck = new Group()
      scene.add(truck)
      // рама, кабина, платформа
      part(geo.box, dark, { pos: [0, 0.95, 0], size: [11, 0.35, 1.6], order: o++, parent: truck, from: [0, 2, 0], flash: true })
      part(geo.box, cabMat, { pos: [4.6, 2.2, 0], size: [2.3, 2.3, 2.4], order: o++, parent: truck, from: [0, 4, 0], flash: true })
      part(geo.box, cabMat, { pos: [5.95, 1.55, 0], size: [0.5, 1.0, 2.4], order: o++, parent: truck, from: [3, 0, 0] })
      part(geo.box, glass, { pos: [5.77, 2.7, 0], size: [0.05, 0.95, 2.1], order: o++, parent: truck, from: [3, 0, 0], glow: false })
      part(geo.box, glass, { pos: [4.9, 2.7, 1.21], size: [1.2, 0.8, 0.03], order: o++, parent: truck, from: [0, 0, 2], glow: false })
      part(geo.box, steel, { pos: [-1.2, 1.25, 0], size: [8.4, 0.22, 2.5], order: o++, parent: truck, from: [-6, 0, 0] })
      part(geo.box, steel, { pos: [3.1, 2.2, 0], size: [0.12, 2.1, 2.5], order: o++, parent: truck, from: [0, 3, 0] })

      // колёса
      const wheels = []
      ;[4.6, 0.6, -0.6, -4.2, -5.4].forEach((x) =>
        [-1.1, 1.1].forEach((z) => wheels.push(part(geo.cyl, tyre, { pos: [x, 0.52, z], size: [1.04, 0.42, 1.04], rot: [Math.PI / 2, 0, 0], order: o, parent: truck, from: [0, 0, z * 3], glow: false }))),
      )
      o += 2

      // паллеты в два яруса: погрузка и есть сборка
      for (let level = 0; level < 2; level++) {
        for (let i = 0; i < 6; i++) {
          for (const z of [-0.6, 0.6]) {
            const x = -4.7 + i * 1.25
            if (level && (i === 5 || (i === 0 && z > 0))) continue
            part(geo.box, (i + level) % 2 ? crateAlt : crate, { pos: [x, 1.85 + level * 1.0, z], size: [1.1, 0.95, 1.1], order: o + level * 4 + i * 0.5 + (z > 0 ? 0.25 : 0), parent: truck, from: [0, 4, 0] })
          }
        }
      }
      o += 9
      part(geo.box, film, { pos: [-2.2, 3.4, 0], size: [5.2, 0.06, 2.3], order: o++, parent: truck, from: [0, 3, 0], flash: true })

      let speed = 0
      return {
        target: new Vector3(-0.5, 1.6, 0),
        radius: 21,
        height: 6.4,
        angle: 0.75,
        sway: 0.4,
        spin: 0.17,
        step: 0.045,
        fog: [20, 46],
        update({ elapsed, dt, done }) {
          if (!done) return
          // фура плавно трогается
          speed = Math.min(9, speed + dt * 4)
          wheels.forEach((w) => (w.rotation.y -= (dt * speed) / 0.52))
          dashes.forEach((d) => {
            d.position.x -= dt * speed
            if (d.position.x < -30) d.position.x += 14 * 4.2
          })
          posts.forEach((p) => {
            p.position.x -= dt * speed
            if (p.position.x < -28) p.position.x += 7 * 8
          })
          truck.position.y = Math.sin(elapsed * 11) * 0.012 * (speed / 9)
        },
      }
    },
  })
}
