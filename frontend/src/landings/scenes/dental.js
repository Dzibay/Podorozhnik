import { CylinderGeometry, Group, SphereGeometry } from 'three'
import { mountScene } from './engine'

/**
 * Стоматология: собирается кабинет — кресло, светильник на кронштейне,
 * столик с инструментом и мойка. Потом спинка опускается, лампа загорается
 * над пациентом, и кресло снова поднимается.
 */
export function mountDental(canvas, options) {
  return mountScene(canvas, {
    ...options,
    build({ scene, geo, material, part, disposables, Vector3 }) {
      const floor = material(0x1a2530, { roughness: 0.9 })
      const wall = material(0x22303d, { roughness: 0.85 })
      const white = material(0xe9eef2, { roughness: 0.45 })
      const chrome = material(0xc3cbd3, { metalness: 0.85, roughness: 0.25 })
      const seat = material(options.accent, { roughness: 0.45, emissiveIntensity: 0.1 })
      const lamp = material(0xf4f8fb, { roughness: 0.3, emissive: 0xffffff, emissiveIntensity: 0.1 })
      const tooth = material(0xf3f6f8, { roughness: 0.35, emissive: 0xffffff, emissiveIntensity: 0.05 })
      const sphere = new SphereGeometry(0.5, 24, 16)
      const root = new CylinderGeometry(0.5, 0.24, 1, 16)
      disposables.push(sphere, root)

      let o = 0
      part(geo.box, floor, { pos: [0, 0.02, 0], size: [11, 0.04, 7], order: o++, from: [0, -1, 0], glow: false })
      part(geo.box, wall, { pos: [0, 3, -2.6], size: [11, 6, 0.2], order: o++, from: [0, -6, 0], glow: false })

      // кресло: основание, колонна, сиденье, подножка
      part(geo.cyl, chrome, { pos: [0, 0.08, 0.3], size: [1.7, 0.16, 1.7], order: o++, from: [0, 3, 0] })
      part(geo.cyl, chrome, { pos: [0, 0.55, 0.3], size: [0.38, 0.8, 0.38], order: o++, from: [0, 3, 0] })
      part(geo.box, seat, { pos: [0.1, 1.05, 0.3], size: [1.9, 0.3, 1.1], order: o++, from: [0, 3, 0], flash: true })
      part(geo.box, seat, { pos: [1.75, 0.82, 0.3], size: [1.5, 0.26, 1.0], rot: [0, 0, -0.35], order: o++, from: [3, 0, 0] })

      // спинка с подголовником на шарнире — потом откидывается
      const back = new Group()
      back.position.set(-0.85, 1.15, 0.3)
      back.rotation.z = -0.95
      scene.add(back)
      part(geo.box, seat, { pos: [-0.9, 0.1, 0], size: [1.8, 0.26, 1.05], order: o++, parent: back, from: [-3, 0, 0] })
      part(geo.box, seat, { pos: [-2.0, 0.16, 0], size: [0.5, 0.22, 0.72], order: o++, parent: back, from: [-3, 0, 0] })

      // светильник на кронштейне от стены
      part(geo.box, white, { pos: [-1.3, 4.8, -2.4], size: [0.5, 0.5, 0.3], order: o++, from: [0, 0, -2] })
      part(geo.box, chrome, { pos: [-1.3, 4.8, -1.2], size: [0.16, 0.16, 2.4], order: o++, from: [0, 0, -3] })
      part(geo.box, chrome, { pos: [-1.3, 4.25, 0.0], size: [0.12, 1.1, 0.12], order: o++, from: [0, 3, 0] })
      part(geo.box, white, { pos: [-1.3, 3.62, 0.3], size: [1.2, 0.32, 0.7], order: o++, from: [0, 3, 0], flash: true })
      part(geo.box, lamp, { pos: [-1.3, 3.45, 0.3], size: [0.95, 0.04, 0.5], order: o++, from: [0, 3, 0], glow: false })

      // столик с инструментом
      part(geo.cyl, chrome, { pos: [1.9, 1.2, -1.3], size: [0.12, 2.4, 0.12], order: o++, from: [0, 3, 0] })
      part(geo.box, white, { pos: [1.7, 2.42, -0.8], size: [1.4, 0.07, 0.9], order: o++, from: [0, 3, 0] })
      ;[-0.25, -0.05, 0.15].forEach((dz, i) =>
        part(geo.box, chrome, { pos: [1.7, 2.48, -0.8 + dz * 1.4], size: [0.95, 0.04, 0.06], order: o + i * 0.3, from: [0, 2, 0], glow: false }),
      )
      o += 2

      // тумба с мойкой и табурет врача
      part(geo.box, white, { pos: [3.7, 0.9, -1.9], size: [2.4, 1.8, 1.1], order: o++, from: [0, 3, 0] })
      part(geo.box, wall, { pos: [3.7, 1.84, -1.9], size: [2.5, 0.08, 1.2], order: o++, from: [0, 3, 0] })
      part(geo.cyl, chrome, { pos: [3.3, 1.9, -1.9], size: [0.7, 0.08, 0.7], order: o++, from: [0, 3, 0], glow: false })
      part(geo.cyl, chrome, { pos: [-1.8, 0.05, 1.9], size: [0.9, 0.1, 0.9], order: o++, from: [0, 3, 0] })
      part(geo.cyl, chrome, { pos: [-1.8, 0.5, 1.9], size: [0.14, 0.9, 0.14], order: o++, from: [0, 3, 0] })
      part(geo.cyl, seat, { pos: [-1.8, 1.0, 1.9], size: [0.85, 0.18, 0.85], order: o++, from: [0, 3, 0] })

      // зуб-вывеска на стене
      part(sphere, tooth, { pos: [3.7, 4.3, -2.45], size: [1.4, 1.1, 0.35], order: o++, from: [0, 0, 2], flash: true })
      ;[-0.3, 0.3].forEach((dx) =>
        part(root, tooth, { pos: [3.7 + dx, 3.7, -2.45], size: [0.55, 0.75, 0.3], rot: [0, 0, dx * 0.35], order: o, from: [0, 0, 2], glow: false }),
      )

      return {
        target: new Vector3(0.6, 2.2, 0),
        radius: 19,
        height: 5.4,
        angle: 1.1,
        sway: 0.35,
        spin: 0.2,
        step: 0.06,
        fog: [20, 44],
        update({ elapsed, done, assembled }) {
          if (!done) return
          // цикл 9 с: спинка опускается, лампа горит над пациентом, кресло поднимается
          const t = (elapsed - assembled) % 9
          const k = t < 2 ? t / 2 : t < 6.5 ? 1 : t < 8.5 ? 1 - (t - 6.5) / 2 : 0
          const ease = k * k * (3 - 2 * k)
          back.rotation.z = -0.95 + ease * 0.75
          lamp.emissiveIntensity = 0.1 + ease * 1.3
        },
      }
    },
  })
}
