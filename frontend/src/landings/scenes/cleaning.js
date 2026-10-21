import { Color, Group } from 'three'
import { mountScene } from './engine'

/**
 * Клининг: собирается комната — пол из плитки, диван, ведро и распылитель.
 * Потом робот змейкой проезжает пол, и плитка за ним становится чистой.
 */
export function mountCleaning(canvas, options) {
  return mountScene(canvas, {
    ...options,
    build({ scene, geo, material, part, accentColor, Vector3 }) {
      const wall = material(0x23303a, { roughness: 0.85 })
      const sofa = material(0x5b6b7a, { roughness: 0.9 })
      const pillow = material(0xd9dee3, { roughness: 0.9 })
      const bucket = material(options.accent, { roughness: 0.45, emissiveIntensity: 0.1 })
      const white = material(0xf2f5f7, { roughness: 0.35 })
      const dark = material(0x1b1f24, { roughness: 0.5 })

      let o = 0
      part(geo.box, wall, { pos: [0, 2.2, -3.3], size: [8.4, 4.4, 0.2], order: o++, from: [0, -5, 0], glow: false })
      part(geo.box, wall, { pos: [-4.1, 2.2, 0], size: [0.2, 4.4, 6.6], order: o++, from: [0, -5, 0], glow: false })

      // плитка 8×6: у каждой свой материал, чтобы «отмывать» по одной
      const dirty = new Color(0x4a4842)
      const clean = new Color(0xdfe7ec)
      const tiles = []
      for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 8; c++) {
          const m = material(dirty, { roughness: 0.6 })
          part(geo.box, m, { pos: [-3.5 + c, 0, -2.7 + r * 1.05], size: [0.96, 0.08, 1.0], order: o + (c + r) * 0.25, from: [0, -2, 0], glow: false })
          // путь робота змейкой: ряд за рядом, через ряд в обратную сторону
          tiles.push({ m, c, r, at: r * 8 + (r % 2 ? 7 - c : c), v: 0 })
        }
      }
      o += 5

      // диван у задней стены
      part(geo.box, sofa, { pos: [-0.6, 0.45, -2.6], size: [3.6, 0.7, 1.1], order: o++, from: [0, 4, 0], flash: true })
      part(geo.box, sofa, { pos: [-0.6, 1.1, -3.05], size: [3.6, 0.9, 0.3], order: o++, from: [0, 4, 0] })
      ;[-2.6, 1.4].forEach((x) => part(geo.box, sofa, { pos: [x, 0.75, -2.6], size: [0.4, 0.9, 1.1], order: o, from: [0, 4, 0] }))
      o++
      part(geo.box, pillow, { pos: [-1.6, 1.0, -2.75], size: [0.8, 0.6, 0.2], rot: [-0.2, 0.15, 0], order: o++, from: [0, 3, 0], glow: false })

      // ведро и распылитель
      part(geo.cyl, bucket, { pos: [3.9, 0.45, 2.4], size: [0.9, 0.8, 0.9], order: o++, from: [0, 4, 0], flash: true })
      part(geo.cyl, white, { pos: [3.9, 0.84, 2.4], size: [0.8, 0.04, 0.8], order: o++, from: [0, 4, 0], glow: false })
      part(geo.box, white, { pos: [3.0, 0.5, 2.9], size: [0.4, 0.9, 0.3], order: o++, from: [0, 4, 0] })
      part(geo.box, bucket, { pos: [3.0, 1.08, 2.9], size: [0.22, 0.26, 0.22], order: o++, from: [0, 4, 0] })
      part(geo.box, bucket, { pos: [3.0, 1.18, 2.72], size: [0.08, 0.08, 0.3], order: o++, from: [0, 4, 0], glow: false })

      // робот-пылесос
      const robot = new Group()
      scene.add(robot)
      part(geo.cyl, white, { pos: [0, 0.16, 0], size: [0.8, 0.18, 0.8], order: o++, parent: robot, from: [0, 3, 0], flash: true })
      part(geo.cyl, dark, { pos: [0, 0.27, 0], size: [0.45, 0.06, 0.45], order: o, parent: robot, from: [0, 3, 0], glow: false })
      robot.position.set(-3.5, 0, -2.7)

      const tmp = new Color()
      const total = tiles.length
      return {
        target: new Vector3(-1.1, 1.1, 0.8),
        radius: 19,
        height: 8,
        angle: 1.0,
        sway: 0.4,
        spin: 0.18,
        step: 0.03,
        fog: [18, 42],
        update({ elapsed, dt, done, assembled }) {
          if (!done) return
          // 0,25 с на плитку, после уборки пауза и пол снова «пачкается»
          const cycle = total * 0.25 + 3
          const t = (elapsed - assembled) % cycle
          const pos = Math.min(total - 1, t / 0.25)
          const i = Math.floor(pos)
          const r = Math.floor(i / 8)
          const cr = i % 8
          const c = r % 2 ? 7 - cr : cr
          const dir = r % 2 ? -1 : 1
          const f = pos - i
          robot.position.set(-3.5 + c + dir * f * (cr < 7 ? 1 : 0), 0, -2.7 + r * 1.05 + (cr === 7 ? f * 1.05 : 0))
          robot.rotation.y = elapsed * 2
          tiles.forEach((tile) => {
            const target = t > total * 0.25 + 2.4 ? 0 : tile.at <= pos ? 1 : 0
            tile.v += (target - tile.v) * (dt ? Math.min(1, dt * 6) : 1)
            tile.m.color.copy(tmp.copy(dirty).lerp(clean, tile.v))
            tile.m.emissive.copy(accentColor)
            tile.m.emissiveIntensity = tile.v * (1 - Math.min(1, Math.abs(tile.at - pos) / 3)) * 0.5
          })
        },
      }
    },
  })
}
