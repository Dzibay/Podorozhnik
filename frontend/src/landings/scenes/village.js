import { Color, CylinderGeometry } from 'three'
import { mountScene } from './engine'

/**
 * Загородный посёлок: собирается генплан — участки, дороги, дома.
 * Потом участки по одному «бронируются» и подсвечиваются акцентом.
 */
export function mountVillage(canvas, options) {
  return mountScene(canvas, {
    ...options,
    build({ geo, material, part, accentColor, disposables, Vector3 }) {
      const ground = material(0x1d2a22, { roughness: 0.95 })
      const road = material(0x3a3f44, { roughness: 0.9 })
      const wall = material(0xe9e2d4, { roughness: 0.7 })
      const wood = material(0x9a7452, { roughness: 0.8 })
      const roofMat = material(0x3b4148, { roughness: 0.6 })
      const tree = material(0x2f5a3c, { roughness: 0.9 })
      const roof = new CylinderGeometry(0, 0.72, 1, 4)
      roof.rotateY(Math.PI / 4)
      const crown = new CylinderGeometry(0, 0.5, 1, 7)
      disposables.push(roof, crown)

      let o = 0
      part(geo.box, ground, { pos: [0, -0.1, 0], size: [20, 0.2, 14], order: o++, from: [0, -2, 0], glow: false })
      part(geo.box, road, { pos: [0, 0.01, 0], size: [20, 0.04, 1.2], order: o++, from: [0, -1, 0], glow: false })
      part(geo.box, road, { pos: [0, 0.01, 0], size: [1.2, 0.04, 14], order: o++, from: [0, -1, 0], glow: false })

      // участки 4×2 с каждой стороны центральной дороги
      const free = new Color(0x2c3a30)
      const plots = []
      let n = 0
      for (const sx of [-1, 1]) {
        for (const sz of [-1, 1]) {
          for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 2; j++) {
              const x = sx * (2.6 + i * 3.6)
              const z = sz * (2.2 + j * 2.9)
              const m = material(free, { roughness: 0.8 })
              part(geo.box, m, { pos: [x, 0.03, z], size: [3.2, 0.06, 2.5], order: o + n * 0.3, from: [0, 2, 0], glow: false })
              plots.push({ m, x, z, rank: ((n * 7) % 16) / 16, v: 0 })
              n++
            }
          }
        }
      }
      o += 6

      // дома стоят на половине участков — остальные «свободны»
      plots.forEach((p, i) => {
        if (i % 3 === 1) {
          part(crown, tree, { pos: [p.x + 1, 0.9, p.z - 0.6], size: [0.9, 1.6, 0.9], order: o + i * 0.2, from: [0, 3, 0], glow: false })
          return
        }
        const w = i % 2 ? 1.6 : 1.9
        part(geo.box, i % 4 ? wall : wood, { pos: [p.x, 0.55, p.z], size: [w, 1, 1.4], order: o + i * 0.4, from: [0, 4, 0] })
        part(roof, roofMat, { pos: [p.x, 1.45, p.z], size: [w * 0.98, 0.8, 1.4 * 1.0], order: o + i * 0.4 + 0.2, from: [0, 4, 0], flash: i === 0 })
      })

      const tmp = new Color()
      return {
        target: new Vector3(-1.9, 0.6, 1.5),
        radius: 44,
        height: 15,
        angle: 0.9,
        spin: 0.05,
        step: 0.05,
        fog: [40, 88],
        update({ elapsed, dt, done, assembled }) {
          if (!done) return
          // участки бронируются по одному, через цикл посёлок «распродан» и всё сначала
          const k = ((elapsed - assembled) % 14) / 14
          plots.forEach((p) => {
            const sold = k < 0.88 && k * 1.15 > p.rank
            p.v += ((sold ? 1 : 0) - p.v) * (dt ? Math.min(1, dt * 4) : 1)
            p.m.color.copy(tmp.copy(free).lerp(accentColor, p.v * 0.85))
            p.m.emissiveIntensity = p.v * 0.3
          })
        },
      }
    },
  })
}
