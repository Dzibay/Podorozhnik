import { SphereGeometry } from 'three'
import { mountScene } from './engine'

/**
 * Инженерные системы: на стене собирается котельная — котёл, бак, насос,
 * трубы подачи и обратки и радиатор. Потом по трубам бежит теплоноситель,
 * а радиатор прогревается.
 */
export function mountEngineering(canvas, options) {
  return mountScene(canvas, {
    ...options,
    build({ geo, material, part, disposables, Vector3 }) {
      const floor = material(0x162026, { roughness: 0.9 })
      const wall = material(0x1f2b33, { roughness: 0.9 })
      const white = material(0xe9edf0, { roughness: 0.4 })
      const hot = material(options.accent, { roughness: 0.35, metalness: 0.3, emissiveIntensity: 0.1 })
      const cold = material(0x5fc8ff, { roughness: 0.35, metalness: 0.3 })
      const steel = material(0x9aa6ae, { metalness: 0.7, roughness: 0.3 })
      const red = material(0xc8413a, { roughness: 0.45 })
      const display = material(0x0b1418, { roughness: 0.3, emissive: 0x5fc8ff, emissiveIntensity: 0.6 })
      const radiator = material(0xdfe3e6, { roughness: 0.4, emissive: options.accent, emissiveIntensity: 0 })
      const sphere = new SphereGeometry(0.5, 12, 8)
      disposables.push(sphere)
      const Z = -1.15
      const pipe = 0.16

      let o = 0
      part(geo.box, floor, { pos: [0, 0.02, 0], size: [13, 0.04, 7], order: o++, from: [0, -1, 0], glow: false })
      part(geo.box, wall, { pos: [0, 3, -1.6], size: [13, 6, 0.2], order: o++, from: [0, -6, 0], glow: false })

      // котёл с дисплеем
      part(geo.box, white, { pos: [-3.2, 3.1, -1.1], size: [1.5, 2.3, 0.8], order: o++, from: [0, 0, 3], flash: true })
      part(geo.box, display, { pos: [-3.2, 3.4, -0.69], size: [0.7, 0.35, 0.02], order: o++, from: [0, 0, 3], glow: false })
      part(geo.cyl, steel, { pos: [-3.2, 2.7, -0.69], size: [0.22, 0.04, 0.22], rot: [Math.PI / 2, 0, 0], order: o, from: [0, 0, 3], glow: false })
      o++

      // бак и насос
      part(geo.cyl, red, { pos: [-5.0, 1.1, -0.9], size: [0.9, 1.6, 0.9], order: o++, from: [0, 3, 0] })
      part(sphere, red, { pos: [-5.0, 1.9, -0.9], size: [0.9, 0.4, 0.9], order: o, from: [0, 3, 0], glow: false })
      part(geo.box, steel, { pos: [-1.6, 0.42, Z], size: [0.5, 0.5, 0.45], order: o++, from: [0, 3, 0] })

      // трубы: подача сверху, обратка снизу — маршруты нужны и для частиц
      const supply = [[-2.45, 2.3], [1.0, 2.3], [1.0, 1.75]]
      const ret = [[4.15, 0.6], [4.15, 0.42], [-3.6, 0.42], [-3.6, 1.95]]
      const run = (points, mat) => {
        for (let i = 0; i < points.length - 1; i++) {
          const [x0, y0] = points[i]
          const [x1, y1] = points[i + 1]
          const len = Math.hypot(x1 - x0, y1 - y0) + pipe
          const horizontal = y0 === y1
          part(geo.box, mat, {
            pos: [(x0 + x1) / 2, (y0 + y1) / 2, Z],
            size: horizontal ? [len, pipe, pipe] : [pipe, len, pipe],
            order: o + i * 0.4,
            from: horizontal ? [0, 0, 2] : [0, 2, 0],
            glow: false,
          })
        }
        o += 2
      }
      run(supply, hot)
      run(ret, cold)
      // манометр на подаче
      part(geo.cyl, white, { pos: [-0.6, 2.62, Z], size: [0.38, 0.08, 0.38], rot: [Math.PI / 2, 0, 0], order: o++, from: [0, 2, 0] })
      part(geo.box, steel, { pos: [-0.6, 2.42, Z], size: [0.06, 0.3, 0.06], order: o, from: [0, 2, 0], glow: false })

      // радиатор из секций
      for (let i = 0; i < 10; i++) {
        part(geo.box, radiator, { pos: [1.15 + i * 0.32, 1.12, Z + 0.1], size: [0.24, 1.2, 0.32], order: o + i * 0.2, from: [0, 0, 2], glow: false })
      }
      o += 2
      part(geo.box, radiator, { pos: [2.6, 1.7, Z + 0.1], size: [3.3, 0.1, 0.2], order: o, from: [0, 0, 2], glow: false })
      part(geo.box, radiator, { pos: [2.6, 0.55, Z + 0.1], size: [3.3, 0.1, 0.2], order: o++, from: [0, 0, 2], glow: false })

      // частицы теплоносителя
      const length = (pts) => pts.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0)
      const at = (pts, d) => {
        for (let i = 0; i < pts.length - 1; i++) {
          const seg = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1])
          if (d <= seg) {
            const k = d / seg
            return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k]
          }
          d -= seg
        }
        return pts[pts.length - 1]
      }
      const dropMat = material(0xffffff, { roughness: 0.3, emissive: options.accent, emissiveIntensity: 1.2 })
      const coolMat = material(0xffffff, { roughness: 0.3, emissive: 0x5fc8ff, emissiveIntensity: 1.2 })
      const flows = [
        [supply, dropMat],
        [ret, coolMat],
      ].flatMap(([pts, m]) => {
        const total = length(pts)
        return Array.from({ length: 6 }, (_, i) => ({
          mesh: part(sphere, m, { pos: [...at(pts, 0), Z + 0.12], size: [0.16, 0.16, 0.16], order: o, from: [0, 0, 0], glow: false }),
          pts,
          total,
          offset: i / 6,
        }))
      })

      return {
        target: new Vector3(-0.4, 2.0, 0),
        radius: 20,
        height: 4.8,
        angle: 1.2,
        sway: 0.35,
        spin: 0.2,
        step: 0.045,
        fog: [20, 46],
        update({ elapsed, done, assembled }) {
          const t = done ? elapsed - assembled : 0
          flows.forEach((f) => {
            f.mesh.visible = done
            const [x, y] = at(f.pts, ((t * 0.18 + f.offset) % 1) * f.total)
            f.mesh.position.set(x, y, Z + 0.12)
          })
          radiator.emissiveIntensity = Math.min(0.35, t * 0.08)
        },
      }
    },
  })
}
