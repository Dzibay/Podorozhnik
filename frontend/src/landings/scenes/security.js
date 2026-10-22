import { AdditiveBlending, ConeGeometry, DoubleSide, Group, SphereGeometry } from 'three'
import { mountScene } from './engine'

/**
 * Охрана: собирается периметр — забор, будка охраны, шлагбаум и мачта
 * с камерами. Потом камеры водят лучом по территории, мигает маячок,
 * шлагбаум поднимается и опускается.
 */
export function mountSecurity(canvas, options) {
  return mountScene(canvas, {
    ...options,
    build({ scene, geo, material, part, disposables, Vector3 }) {
      const ground = material(0x141920, { roughness: 0.95 })
      const asphalt = material(0x1f252d, { roughness: 0.9 })
      const fence = material(0x56606c, { metalness: 0.5, roughness: 0.45 })
      const mesh = material(0x3a434e, { metalness: 0.4, roughness: 0.5, transparent: true, opacity: 0.6 })
      const booth = material(0xdfe4e9, { roughness: 0.5 })
      const glass = material(0x1b3346, { roughness: 0.1, metalness: 0.5, emissive: 0x7fd1ff, emissiveIntensity: 0.25 })
      const red = material(options.accent, { roughness: 0.4, emissiveIntensity: 0.1 })
      const white = material(0xf2f4f6, { roughness: 0.4 })
      const cam = material(0xe9ecef, { roughness: 0.35 })
      const lens = material(0x0b0e12, { roughness: 0.1, metalness: 0.7 })
      const beacon = material(options.accent, { roughness: 0.3, emissive: options.accent, emissiveIntensity: 0.3 })
      const sphere = new SphereGeometry(0.5, 16, 12)
      // конус обзора лежит вдоль +x: вершина у объектива, раструб вперёд
      const cone = new ConeGeometry(0.5, 1, 24, 1, true)
      cone.rotateZ(Math.PI / 2)
      cone.translate(0.5, 0, 0)
      disposables.push(sphere, cone)

      let o = 0
      part(geo.box, ground, { pos: [0, 0.02, 0], size: [16, 0.04, 11], order: o++, from: [0, -1, 0], glow: false })
      part(geo.box, asphalt, { pos: [2.2, 0.04, 2], size: [3, 0.03, 9], order: o++, from: [0, -1, 0], glow: false })

      // забор из секций по обе стороны от въезда
      ;[-7, -5.2, -3.4, -1.6, 5.4, 7.2].forEach((x, i) => {
        part(geo.box, fence, { pos: [x - 0.9, 1.1, 0], size: [0.12, 2.2, 0.12], order: o + i * 0.3, from: [0, 3, 0], glow: false })
        part(geo.box, mesh, { pos: [x, 1.1, 0], size: [1.7, 1.9, 0.04], order: o + i * 0.3, from: [0, 3, 0], glow: false })
        part(geo.box, fence, { pos: [x, 2.1, 0], size: [1.8, 0.08, 0.08], order: o + i * 0.3, from: [0, 3, 0], glow: false })
      })
      o += 3

      // будка охраны с маячком
      part(geo.box, booth, { pos: [-0.2, 1.3, 1.4], size: [1.8, 2.6, 1.8], order: o++, from: [0, 4, 0], flash: true })
      part(geo.box, glass, { pos: [-0.2, 1.75, 2.31], size: [1.4, 0.9, 0.02], order: o, from: [0, 4, 0], glow: false })
      part(geo.box, glass, { pos: [0.71, 1.75, 1.4], size: [0.02, 0.9, 1.4], order: o++, from: [0, 4, 0], glow: false })
      part(geo.box, red, { pos: [-0.2, 2.7, 1.4], size: [2.1, 0.2, 2.1], order: o++, from: [0, 4, 0] })
      part(sphere, beacon, { pos: [-0.2, 2.95, 1.4], size: [0.36, 0.36, 0.36], order: o++, from: [0, 4, 0], glow: false })

      // шлагбаум
      part(geo.box, red, { pos: [0.9, 0.6, 0.4], size: [0.4, 1.2, 0.4], order: o++, from: [0, 3, 0] })
      const arm = new Group()
      arm.position.set(0.9, 1.05, 0.4)
      scene.add(arm)
      for (let i = 0; i < 6; i++) part(geo.box, i % 2 ? red : white, { pos: [0.4 + i * 0.5, 0, 0], size: [0.5, 0.14, 0.1], order: o + i * 0.15, parent: arm, from: [0, 0, 2], glow: false })
      o++

      // мачта с двумя камерами и лучами обзора
      part(geo.cyl, fence, { pos: [-2.6, 2.4, 1.2], size: [0.18, 4.8, 0.18], order: o++, from: [0, 5, 0] })
      const cams = [0, 1].map((i) => {
        const g = new Group()
        g.position.set(-2.6 + (i ? 0.3 : -0.3), 4.6, 1.2)
        g.rotation.y = i ? -0.9 : -2.6
        scene.add(g)
        part(geo.box, cam, { pos: [0.3, 0, 0], size: [0.75, 0.3, 0.3], order: o + i * 0.5, parent: g, from: [0, 3, 0], flash: i === 0 })
        part(geo.cyl, lens, { pos: [0.69, 0, 0], size: [0.22, 0.04, 0.22], rot: [0, 0, Math.PI / 2], order: o + i * 0.5, parent: g, from: [0, 3, 0], glow: false })
        const beam = material(options.accent, { transparent: true, opacity: 0, depthWrite: false, blending: AdditiveBlending, side: DoubleSide, emissiveIntensity: 1, roughness: 1 })
        part(cone, beam, { pos: [0.7, 0, 0], size: [5.5, 2.2, 2.2], rot: [0, 0, -0.5], order: o + i * 0.5, parent: g, from: [0, 0, 0], glow: false })
        return { g, beam, base: g.rotation.y, i }
      })

      return {
        target: new Vector3(0, 1.8, 1),
        radius: 26,
        height: 8,
        angle: 1.05,
        sway: 0.4,
        spin: 0.18,
        step: 0.04,
        fog: [24, 54],
        update({ elapsed, done, assembled }) {
          if (!done) return
          const t = elapsed - assembled
          cams.forEach(({ g, beam, base, i }) => {
            beam.opacity = Math.min(0.12, t * 0.08)
            g.rotation.y = base + Math.sin(t * 0.6 + i * 2) * 0.55
          })
          beacon.emissiveIntensity = t % 1 < 0.5 ? 1.6 : 0.2
          // шлагбаум: цикл 8 с
          const c = t % 8
          const k = c < 1.2 ? c / 1.2 : c < 4 ? 1 : c < 5.2 ? 1 - (c - 4) / 1.2 : 0
          arm.rotation.z = k * k * (3 - 2 * k) * 1.35
        },
      }
    },
  })
}
