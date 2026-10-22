import { SphereGeometry, TorusGeometry } from 'three'
import { mountScene } from './engine'

/**
 * Детский центр: на ковре собирается горка, башня из кубиков
 * и пирамидка из колец. Потом по ковру прыгают мячи.
 */
export function mountKids(canvas, options) {
  return mountScene(canvas, {
    ...options,
    build({ geo, material, part, disposables, Vector3 }) {
      const floor = material(0x161a33, { roughness: 0.9 })
      const rug = material(0x262c52, { roughness: 0.95 })
      const colors = [options.accent, 0x7fd0ff, 0x7ed67a, 0xff7aa8, 0xffd35a, 0xb59cff]
      const toys = colors.map((c, i) => material(c, { roughness: 0.45, emissiveIntensity: i ? 0 : 0.1 }))
      const white = material(0xeef0f8, { roughness: 0.5 })
      const sphere = new SphereGeometry(0.5, 24, 16)
      const ring = new TorusGeometry(0.5, 0.2, 12, 28)
      disposables.push(sphere, ring)

      let o = 0
      part(geo.box, floor, { pos: [0, 0.02, 0], size: [13, 0.04, 8], order: o++, from: [0, -1, 0], glow: false })
      part(geo.cyl, rug, { pos: [0, 0.06, 0.3], size: [8.5, 0.05, 6.5], order: o++, from: [0, -1, 0], glow: false })

      // горка: площадка, лесенка, скат и бортики
      ;[-0.8, 0.8].forEach((z) =>
        [-3.8, -2.4].forEach((x) => part(geo.box, white, { pos: [x, 1.1, z - 0.8], size: [0.18, 2.2, 0.18], order: o, from: [0, 4, 0] })),
      )
      o++
      part(geo.box, toys[1], { pos: [-3.1, 2.25, -0.8], size: [1.7, 0.16, 1.8], order: o++, from: [0, 4, 0], flash: true })
      for (let i = 0; i < 5; i++) part(geo.box, toys[4], { pos: [-4.15, 0.35 + i * 0.4, -0.8], size: [0.5, 0.08, 1.2], order: o + i * 0.2, from: [-2, 0, 0], glow: false })
      o += 2
      part(geo.box, toys[0], { pos: [-1.35, 1.2, -0.8], size: [2.6, 0.12, 1.3], rot: [0, 0, -0.72], order: o++, from: [3, 3, 0], flash: true })
      ;[-0.62, 0.62].forEach((dz) =>
        part(geo.box, toys[0], { pos: [-1.35, 1.38, -0.8 + dz], size: [2.6, 0.3, 0.08], rot: [0, 0, -0.72], order: o, from: [3, 3, 0], glow: false }),
      )
      o++
      part(geo.box, toys[3], { pos: [-3.1, 2.85, -1.68], size: [1.7, 1.0, 0.08], order: o++, from: [0, 3, 0] })

      // башня из кубиков, каждый следующий чуть повёрнут
      ;[[0, 0], [0.9, 0], [0.45, 1], [0.45, 2], [0.9, 3]].forEach(([dx, level], i) =>
        part(geo.box, toys[(i + 2) % 6], {
          pos: [1.3 + dx, 0.5 + level * 0.88, -1.4],
          size: [0.85, 0.85, 0.85],
          rot: [0, i * 0.25, 0],
          order: o + i * 0.5,
          from: [0, 4, 0],
          flash: i === 4,
        }),
      )
      o += 3

      // пирамидка: стержень и кольца от большого к маленькому
      part(geo.cyl, white, { pos: [3.6, 0.1, 0.4], size: [1.6, 0.2, 1.6], order: o++, from: [0, 3, 0] })
      part(geo.cyl, white, { pos: [3.6, 1.2, 0.4], size: [0.18, 2.2, 0.18], order: o++, from: [0, 4, 0], glow: false })
      for (let i = 0; i < 5; i++) {
        const s = 1.5 - i * 0.22
        part(ring, toys[(i + 1) % 6], { pos: [3.6, 0.38 + i * 0.36, 0.4], size: [s, s, 1.1], rot: [Math.PI / 2, 0, 0], order: o + i * 0.4, from: [0, 4, 0], glow: false })
      }
      o += 3

      // мячи — прыгают по ковру после сборки
      const balls = [[-0.2, 1.6, 0.9, 0], [1.4, 1.2, 0.7, 1.3], [0.4, 2.4, 0.6, 2.1]].map(([x, z, s, phase], i) => ({
        mesh: part(sphere, toys[(i * 2 + 3) % 6], { pos: [x, s / 2 + 0.08, z], size: [s, s, s], order: o + i * 0.4, from: [0, 4, 0] }),
        s,
        phase,
      }))

      return {
        target: new Vector3(0.3, 1.6, 0),
        radius: 23,
        height: 6.2,
        angle: 1.0,
        sway: 0.4,
        spin: 0.2,
        step: 0.05,
        fog: [20, 46],
        update({ elapsed, done, assembled }) {
          if (!done) return
          const t = elapsed - assembled
          balls.forEach((b) => {
            const k = Math.abs(Math.sin(t * 2.6 + b.phase))
            b.mesh.position.y = b.s / 2 + 0.08 + k * 1.3
            // в момент касания мяч чуть сплющивается
            const squash = k < 0.12 ? 0.85 + k : 1
            b.mesh.scale.set(b.s * (2 - squash), b.s * squash, b.s * (2 - squash))
          })
        },
      }
    },
  })
}
