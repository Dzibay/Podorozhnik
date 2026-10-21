import { Group } from 'three'
import { mountScene } from './engine'

/**
 * Автосервис: собирается бокс с двухстоечным подъёмником, на него заезжает машина.
 * Потом подъёмник поднимает её, колёса крутятся, и машина опускается обратно.
 */
export function mountGarage(canvas, options) {
  return mountScene(canvas, {
    ...options,
    build({ scene, geo, material, part, grid, Vector3 }) {
      grid(40, 0.35)
      const floor = material(0x23272d, { roughness: 0.9 })
      const stripe = material(0xe8c547, { roughness: 0.6 })
      const post = material(0x5d6670, { metalness: 0.6, roughness: 0.35 })
      const body = material(options.accent, { metalness: 0.45, roughness: 0.3, emissiveIntensity: 0.1 })
      const glass = material(0x0e1722, { metalness: 0.6, roughness: 0.15 })
      const tyre = material(0x111315, { roughness: 0.9 })
      const rim = material(0xb8c0c8, { metalness: 0.8, roughness: 0.25 })
      const red = material(0xb3362f, { roughness: 0.5 })
      const light = material(0xf6f1e3, { roughness: 0.3, emissive: 0xfff3d6, emissiveIntensity: 0.6 })

      let o = 0
      part(geo.box, floor, { pos: [0, 0.02, 0], size: [12, 0.04, 7], order: o++, from: [0, -1, 0], glow: false })
      ;[-3.5, 3.5].forEach((z) => part(geo.box, stripe, { pos: [0, 0.05, z], size: [12, 0.02, 0.14], order: o, from: [0, -1, 0], glow: false }))
      o++

      // стойки подъёмника и перекладина с лампой
      ;[-2.1, 2.1].forEach((z) => {
        part(geo.box, post, { pos: [0, 2.2, z], size: [0.45, 4.4, 0.45], order: o, from: [0, 5, 0], flash: z < 0 })
        part(geo.box, post, { pos: [0, 0.08, z], size: [1.1, 0.16, 0.9], order: o })
      })
      o++
      part(geo.box, post, { pos: [0, 4.45, 0], size: [0.4, 0.2, 4.6], order: o++, from: [0, 3, 0] })
      part(geo.box, light, { pos: [0, 4.3, 0], size: [0.25, 0.08, 3], order: o++, from: [0, 3, 0], glow: false })

      // машина и лапы подъёмника едут вместе
      const lift = new Group()
      scene.add(lift)
      ;[-1.2, 1.2].forEach((x) => part(geo.box, post, { pos: [x, 0.35, 0], size: [0.18, 0.12, 3.9], order: o, parent: lift, from: [0, 0, 0] }))
      o++
      part(geo.box, body, { pos: [0, 0.95, 0], size: [4.6, 0.75, 1.9], order: o++, parent: lift, from: [-8, 0, 0], flash: true })
      part(geo.box, body, { pos: [-0.3, 1.6, 0], size: [2.5, 0.6, 1.75], order: o++, parent: lift, from: [-8, 0, 0] })
      part(geo.box, glass, { pos: [-0.3, 1.62, 0], size: [2.3, 0.48, 1.8], order: o, parent: lift, from: [-8, 0, 0], glow: false })
      part(geo.box, glass, { pos: [1.0, 1.55, 0], size: [0.05, 0.45, 1.6], rot: [0, 0, -0.5], order: o++, parent: lift, from: [-8, 0, 0], glow: false })
      const wheels = []
      ;[-1.5, 1.5].forEach((x) =>
        [-0.85, 0.85].forEach((z) => {
          const w = new Group()
          w.position.set(x, 0.62, z)
          lift.add(w)
          part(geo.cyl, tyre, { pos: [0, 0, 0], size: [0.78, 0.32, 0.78], rot: [Math.PI / 2, 0, 0], order: o, parent: w, from: [-8, 0, 0], glow: false })
          part(geo.box, rim, { pos: [0, 0, z > 0 ? 0.17 : -0.17], size: [0.4, 0.4, 0.02], order: o, parent: w, from: [-8, 0, 0], glow: false })
          wheels.push(w)
        }),
      )
      o++

      // тумба с инструментом и стопка шин
      part(geo.box, red, { pos: [-4.6, 0.75, -2.4], size: [1.4, 1.5, 0.8], order: o++, from: [0, 3, 0] })
      for (let i = 0; i < 4; i++) part(geo.cyl, tyre, { pos: [4.4, 0.18 + i * 0.36, -2.3], size: [1, 0.34, 1], order: o + i * 0.5, from: [0, 3, 0], glow: false })

      return {
        target: new Vector3(0.4, 1.8, 0),
        radius: 24,
        height: 6.5,
        angle: 0.42,
        sway: 0.4,
        spin: 0.18,
        step: 0.06,
        fog: [22, 50],
        update({ elapsed, dt, done, assembled }) {
          if (!done) return
          // цикл 10 с: подъём, работа на высоте, спуск
          const t = (elapsed - assembled) % 10
          const up = t < 2 ? t / 2 : t < 6 ? 1 : t < 8 ? 1 - (t - 6) / 2 : 0
          const ease = up * up * (3 - 2 * up)
          lift.position.y = ease * 1.7
          if (t > 2 && t < 6) wheels.forEach((w) => (w.rotation.z -= dt * 6))
        },
      }
    },
  })
}
