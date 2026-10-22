import { AdditiveBlending, ConeGeometry, DoubleSide, Group } from 'three'
import { mountScene } from './engine'

/**
 * Ивент: собирается сцена с фермой, колонками и экраном, перед ней —
 * банкетные столы. Потом прожекторы на ферме начинают гулять лучами.
 */
export function mountEvent(canvas, options) {
  return mountScene(canvas, {
    ...options,
    build({ scene, geo, material, part, disposables, Vector3 }) {
      const floor = material(0x1d1513, { roughness: 0.9 })
      const stage = material(0x2a201d, { roughness: 0.7 })
      const truss = material(0x9aa0a8, { metalness: 0.7, roughness: 0.3 })
      const black = material(0x141212, { roughness: 0.6 })
      const cloth = material(0xf1e9df, { roughness: 0.8 })
      const gold = material(options.accent, { roughness: 0.4, metalness: 0.4, emissiveIntensity: 0.1 })
      const screen = material(0x1a1214, { roughness: 0.4, emissive: options.accent, emissiveIntensity: 0.25 })
      const cone = new ConeGeometry(0.5, 1, 24, 1, true)
      cone.translate(0, -0.5, 0)
      disposables.push(cone)

      let o = 0
      part(geo.box, floor, { pos: [0, 0.02, 1], size: [14, 0.04, 10], order: o++, from: [0, -1, 0], glow: false })
      part(geo.box, stage, { pos: [0, 0.4, -1.8], size: [9, 0.8, 3.6], order: o++, from: [0, -2, 0], flash: true })
      part(geo.box, gold, { pos: [0, 0.78, -0.02], size: [9, 0.04, 0.06], order: o++, from: [0, -2, 0] })

      // ферма: две стойки и перекладина
      ;[-4.2, 4.2].forEach((x) => part(geo.box, truss, { pos: [x, 3.3, -2.0], size: [0.3, 5.0, 0.3], order: o, from: [0, 6, 0] }))
      o++
      part(geo.box, truss, { pos: [0, 5.8, -2.0], size: [8.7, 0.3, 0.3], order: o++, from: [0, 4, 0] })
      part(geo.box, truss, { pos: [0, 5.8, -1.4], size: [8.7, 0.1, 0.1], order: o, from: [0, 4, 0], glow: false })
      part(geo.box, truss, { pos: [0, 5.8, -2.6], size: [8.7, 0.1, 0.1], order: o++, from: [0, 4, 0], glow: false })

      // экран и колонки
      part(geo.box, black, { pos: [0, 3.3, -3.4], size: [6.4, 3.6, 0.2], order: o++, from: [0, 0, -3] })
      part(geo.box, screen, { pos: [0, 3.3, -3.28], size: [6.0, 3.2, 0.04], order: o++, from: [0, 0, -3], glow: false })
      ;[-3.4, 3.4].forEach((x) => {
        part(geo.box, black, { pos: [x, 1.7, -1.2], size: [1.0, 1.8, 0.9], order: o, from: [0, 4, 0] })
        part(geo.cyl, truss, { pos: [x, 1.4, -0.74], size: [0.6, 0.04, 0.6], rot: [Math.PI / 2, 0, 0], order: o + 0.5, from: [0, 4, 0], glow: false })
        part(geo.cyl, truss, { pos: [x, 2.2, -0.74], size: [0.3, 0.04, 0.3], rot: [Math.PI / 2, 0, 0], order: o + 0.5, from: [0, 4, 0], glow: false })
      })
      o += 2
      // стойка микрофона
      part(geo.cyl, black, { pos: [0, 0.85, -0.8], size: [0.5, 0.06, 0.5], order: o++, from: [0, 3, 0] })
      part(geo.cyl, truss, { pos: [0, 1.6, -0.8], size: [0.05, 1.5, 0.05], order: o++, from: [0, 3, 0], glow: false })

      // банкетные столы
      ;[[-2.6, 2.8], [2.6, 2.8], [0, 4.6]].forEach(([x, z], i) => {
        part(geo.cyl, cloth, { pos: [x, 0.42, z], size: [1.9, 0.8, 1.9], order: o + i * 0.6, from: [0, 3, 0] })
        part(geo.cyl, gold, { pos: [x, 0.95, z], size: [0.22, 0.3, 0.22], order: o + i * 0.6, from: [0, 3, 0], glow: false })
        for (let k = 0; k < 5; k++) {
          const a = (k / 5) * Math.PI * 2
          part(geo.box, gold, { pos: [x + Math.cos(a) * 1.35, 0.5, z + Math.sin(a) * 1.35], size: [0.45, 1.0, 0.45], rot: [0, -a, 0], order: o + i * 0.6 + 0.3, from: [0, 3, 0], glow: false })
        }
      })
      o += 3

      // прожекторы с лучами
      const spots = [-3, -1, 1, 3].map((x, i) => {
        const g = new Group()
        g.position.set(x, 5.6, -1.6)
        scene.add(g)
        part(geo.cyl, black, { pos: [0, -0.2, 0], size: [0.45, 0.5, 0.45], order: o + i * 0.3, parent: g, from: [0, 3, 0], glow: false })
        const beam = material(options.accent, { transparent: true, opacity: 0, depthWrite: false, blending: AdditiveBlending, side: DoubleSide, emissiveIntensity: 1, roughness: 1 })
        part(cone, beam, { pos: [0, -0.45, 0], size: [2.4, 5.2, 2.4], order: o + i * 0.3, parent: g, from: [0, 0, 0], glow: false })
        return { g, beam, i }
      })

      return {
        target: new Vector3(0, 1.7, 1.2),
        radius: 27,
        height: 6.5,
        angle: 1.2,
        sway: 0.35,
        spin: 0.2,
        step: 0.04,
        fog: [22, 50],
        update({ elapsed, done, assembled }) {
          if (!done) return
          const t = elapsed - assembled
          spots.forEach(({ g, beam, i }) => {
            beam.opacity = Math.min(0.16, t * 0.1)
            g.rotation.z = Math.sin(t * 0.9 + i * 1.3) * 0.45
            g.rotation.x = 0.35 + Math.sin(t * 0.7 + i) * 0.2
          })
          screen.emissiveIntensity = 0.25 + (Math.sin(t * 2) + 1) * 0.12
        },
      }
    },
  })
}
