import { SphereGeometry } from 'three'
import { mountScene } from './engine'

/**
 * Деревянные дома: сруб собирается венец за венцом, сверху встают
 * фронтоны и крыша. Потом в окнах тёплый свет, из трубы идёт дым.
 */
export function mountLoghouse(canvas, options) {
  return mountScene(canvas, {
    ...options,
    build({ geo, material, part, disposables, Vector3 }) {
      const grass = material(0x1f2a1c, { roughness: 0.95 })
      const path = material(0x5a4a3a, { roughness: 0.95 })
      const logs = [0xb98552, 0x9c6e43].map((c) => material(c, { roughness: 0.85 }))
      const roof = material(0x7a4a32, { roughness: 0.75, metalness: 0.1 })
      const door = material(options.accent, { roughness: 0.6, emissiveIntensity: 0.1 })
      const glow = material(0xffd59a, { roughness: 0.4, emissive: 0xffb45e, emissiveIntensity: 0.2 })
      const stone = material(0x6b6a66, { roughness: 0.9 })
      const sphere = new SphereGeometry(0.5, 14, 10)
      disposables.push(sphere)
      const along = [0, 0, Math.PI / 2]
      const across = [Math.PI / 2, 0, 0]

      let o = 0
      part(geo.box, grass, { pos: [0, 0.02, 0], size: [14, 0.04, 11], order: o++, from: [0, -1, 0], glow: false })
      part(geo.box, path, { pos: [0.6, 0.05, 4.2], size: [1.2, 0.03, 4], order: o++, from: [0, -1, 0], glow: false })

      // венцы: брёвна вдоль x на передней и задней стене, вдоль z — на боковых, вперевязку
      const W = 3
      const D = 2.2
      const R = 0.42
      const rows = 9
      for (let i = 0; i < rows; i++) {
        const y = 0.22 + i * R
        const m = logs[i % 2]
        ;[-D, D].forEach((z) => part(geo.cyl, m, { pos: [0, y, z], size: [R, W * 2 + 0.9, R], rot: along, order: o, from: [0, 4, 0], glow: i === rows - 1 }))
        ;[-W, W].forEach((x) => part(geo.cyl, m, { pos: [x, y + R / 2, 0], size: [R, D * 2 + 0.9, R], rot: across, order: o + 0.5, from: [0, 4, 0], glow: false }))
        o++
      }
      const top = 0.22 + rows * R

      // фронтоны из укорачивающихся брёвен
      const rise = 1.9
      for (let k = 0; k < 4; k++) {
        const y = top + R / 2 + k * R
        const half = D * (1 - (k + 0.6) * R / rise)
        ;[-W, W].forEach((x) => part(geo.cyl, logs[k % 2], { pos: [x, y, 0], size: [R, half * 2, R], rot: across, order: o, from: [0, 4, 0], glow: false }))
        o++
      }

      // крыша двумя скатами
      const slope = Math.atan(rise / D)
      const len = Math.hypot(rise, D) + 0.5
      ;[1, -1].forEach((s) =>
        part(geo.box, roof, { pos: [0, top + rise / 2 + 0.35, (s * D) / 2], size: [W * 2 + 1.3, 0.16, len], rot: [s * slope, 0, 0], order: o, from: [0, 5, 0], flash: s > 0 }),
      )
      o++
      part(geo.box, stone, { pos: [1.6, top + 1.6, -0.9], size: [0.6, 2.2, 0.6], order: o++, from: [0, 4, 0] })

      // дверь, окна и крыльцо
      part(geo.box, door, { pos: [0.6, 1.15, D + 0.24], size: [1.1, 2.1, 0.08], order: o++, from: [0, 0, 3], flash: true })
      ;[-1.7, 2.1].forEach((x) => part(geo.box, glow, { pos: [x, 1.9, D + 0.24], size: [0.95, 0.85, 0.06], order: o, from: [0, 0, 3], glow: false }))
      part(geo.box, glow, { pos: [W + 0.24, 1.9, 0], size: [0.06, 0.85, 0.95], order: o++, from: [3, 0, 0], glow: false })
      part(geo.box, logs[1], { pos: [0.6, 0.12, D + 0.9], size: [2.2, 0.24, 1.0], order: o++, from: [0, 3, 0], glow: false })

      // дым: клубы поднимаются из трубы по кругу
      const smoke = Array.from({ length: 5 }, (_, i) => {
        const m = material(0xe9e5de, { roughness: 1, transparent: true, opacity: 0, depthWrite: false })
        return { mesh: part(sphere, m, { pos: [1.6, top + 2.9, -0.9], size: [0.5, 0.5, 0.5], order: o, from: [0, 0, 0], glow: false }), m, i }
      })

      return {
        target: new Vector3(0, 2.4, 0),
        radius: 30,
        height: 8,
        angle: 0.75,
        sway: 0.45,
        spin: 0.18,
        step: 0.04,
        fog: [24, 52],
        update({ elapsed, done, assembled }) {
          if (!done) return
          const t = elapsed - assembled
          glow.emissiveIntensity = Math.min(1, 0.2 + t * 0.3) * (0.9 + Math.sin(t * 3) * 0.05)
          smoke.forEach(({ mesh, m, i }) => {
            const k = ((t * 0.25 + i / 5) % 1 + 1) % 1
            const s = 0.4 + k * 0.9
            mesh.position.set(1.6 + k * 0.9, top + 2.8 + k * 2.6, -0.9 - k * 0.4)
            mesh.scale.set(s, s, s)
            m.opacity = Math.min(0.4, t * 0.3) * Math.sin(k * Math.PI)
          })
        },
      }
    },
  })
}
