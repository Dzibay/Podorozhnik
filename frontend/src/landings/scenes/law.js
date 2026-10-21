import { ExtrudeGeometry, Group, Shape } from 'three'
import { mountScene } from './engine'

/**
 * Юристы: по ступеням собирается портик с колоннами и фронтоном,
 * рядом встают весы. Чаши покачиваются и выравниваются.
 */
export function mountLaw(canvas, options) {
  return mountScene(canvas, {
    ...options,
    build({ scene, geo, material, part, grid, disposables, Vector3 }) {
      grid(40, 0.4)
      const stone = material(0xd9d4ca, { roughness: 0.7 })
      const stoneDark = material(0xa9a398, { roughness: 0.8 })
      const wall = material(0x2a3242, { roughness: 0.8 })
      const gold = material(options.accent, { roughness: 0.3, metalness: 0.85, emissiveIntensity: 0.12 })

      let o = 0
      // ступени
      ;[
        [10, 5.2, 0.15],
        [9.2, 4.6, 0.45],
        [8.4, 4, 0.75],
      ].forEach(([w, d, y]) => part(geo.box, stoneDark, { pos: [0, y, 0.4], size: [w, 0.3, d], order: o++, from: [0, -1.5, 0], flash: o === 1 }))

      // задняя стена и колонны
      part(geo.box, wall, { pos: [0, 2.9, -1.2], size: [7.8, 4, 0.3], order: o++, from: [0, -4, 0], glow: false })
      for (let i = 0; i < 6; i++) {
        const x = -3.5 + i * 1.4
        part(geo.box, stone, { pos: [x, 1.0, 1.4], size: [0.9, 0.2, 0.9], order: o + i * 0.5 })
        part(geo.cyl, stone, { pos: [x, 2.9, 1.4], size: [0.66, 3.6, 0.66], order: o + i * 0.5 + 0.2, from: [0, 5, 0] })
        part(geo.box, stone, { pos: [x, 4.8, 1.4], size: [0.9, 0.2, 0.9], order: o + i * 0.5 + 0.4 })
      }
      o += 4

      // антаблемент и фронтон
      part(geo.box, stone, { pos: [0, 5.15, 0.2], size: [8.6, 0.5, 3.4], order: o++, from: [0, 3, 0], flash: true })
      part(geo.box, gold, { pos: [0, 5.15, 1.92], size: [8.6, 0.12, 0.04], order: o++, from: [0, 3, 0], glow: false })
      const tri = new Shape()
      tri.moveTo(-4.4, 0)
      tri.lineTo(4.4, 0)
      tri.lineTo(0, 1.5)
      tri.closePath()
      const pediment = new ExtrudeGeometry(tri, { depth: 3.4, bevelEnabled: false })
      pediment.translate(0, 0, -1.7)
      disposables.push(pediment)
      part(pediment, stone, { pos: [0, 5.4, 0.2], order: o++, from: [0, 3, 0], flash: true })

      // весы справа от портика
      const sx = 7
      const sz = 2.6
      part(geo.cyl, wall, { pos: [sx, 0.08, sz], size: [1.6, 0.16, 1.6], order: o++ })
      part(geo.cyl, gold, { pos: [sx, 1.7, sz], size: [0.14, 3.2, 0.14], order: o++, from: [0, 4, 0] })
      part(geo.cyl, gold, { pos: [sx, 3.35, sz], size: [0.35, 0.2, 0.35], order: o++ })
      const beam = new Group()
      beam.position.set(sx, 3.45, sz)
      scene.add(beam)
      part(geo.box, gold, { pos: [0, 0, 0], size: [3.2, 0.09, 0.09], order: o++, parent: beam, from: [0, 2, 0] })
      const pans = [-1.5, 1.5].map((x) => {
        const pan = new Group()
        pan.position.set(x, 0, 0)
        beam.add(pan)
        part(geo.box, gold, { pos: [-0.3, -0.6, 0], size: [0.02, 1.25, 0.02], rot: [0, 0, -0.45], order: o, parent: pan, from: [0, 2, 0], glow: false })
        part(geo.box, gold, { pos: [0.3, -0.6, 0], size: [0.02, 1.25, 0.02], rot: [0, 0, 0.45], order: o, parent: pan, from: [0, 2, 0], glow: false })
        part(geo.cyl, gold, { pos: [0, -1.2, 0], size: [1.3, 0.06, 1.3], order: o + 0.5, parent: pan, from: [0, 2, 0], flash: true })
        return pan
      })

      return {
        target: new Vector3(1.8, 2.9, 0.4),
        radius: 25,
        height: 7.5,
        angle: 1.15,
        sway: 0.35,
        spin: 0.16,
        step: 0.07,
        fog: [24, 52],
        update({ elapsed, done, assembled }) {
          if (!done) return
          // чаши качаются и успокаиваются; раз в несколько секунд — новый «довод»
          const t = (elapsed - assembled) % 9
          const tilt = Math.sin(t * 2.4) * 0.16 * Math.exp(-t * 0.45)
          beam.rotation.z = tilt
          pans.forEach((p) => (p.rotation.z = -tilt))
        },
      }
    },
  })
}
