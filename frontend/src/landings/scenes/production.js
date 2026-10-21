import { ExtrudeGeometry, Mesh, Shape } from 'three'
import { mountScene } from './engine'

/** Плоская шестерня: зубья по окружности, отверстие под вал */
function gearGeometry(radius, teeth, depth) {
  const shape = new Shape()
  const inner = radius * 0.84
  const steps = teeth * 4
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2
    const r = i % 4 === 1 || i % 4 === 2 ? radius : inner
    if (i === 0) shape.moveTo(Math.cos(a) * r, Math.sin(a) * r)
    else shape.lineTo(Math.cos(a) * r, Math.sin(a) * r)
  }
  const hole = new Shape()
  hole.absarc(0, 0, radius * 0.22, 0, Math.PI * 2, true)
  shape.holes.push(hole)
  const g = new ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 8 })
  g.translate(0, 0, -depth / 2)
  return g
}

/**
 * Производство: цех собирается — станина станка, шестерни, конвейер и портал
 * с контрольной рамкой. Потом по ленте идут изделия; на рамке каждое вспыхивает —
 * «ни одна заявка не потерялась».
 */
export function mountProduction(canvas, options) {
  return mountScene(canvas, {
    ...options,
    build({ scene, geo, material, part, grid, disposables, Vector3 }) {
      grid(40, 0.5)
      const steel = material(0x7d8794, { metalness: 0.5, roughness: 0.4 })
      const dark = material(0x3a4048, { metalness: 0.4, roughness: 0.5 })
      const belt = material(0x1d2125, { roughness: 0.9 })
      const accentMat = material(options.accent, { emissiveIntensity: 0.6, metalness: 0.3, roughness: 0.35 })

      let o = 0
      // станина станка
      part(geo.box, dark, { pos: [-6, 1.3, 0], size: [3, 2.6, 2.6], order: o++, flash: true })
      part(geo.box, steel, { pos: [-6, 2.75, 0], size: [3.2, 0.3, 2.8], order: o++ })
      part(geo.box, steel, { pos: [-6.9, 3.6, 0], size: [0.6, 1.4, 1.2], order: o++ })

      // шестерни на торце станины
      const gears = []
      ;[
        [1.0, 14, -6.6, 1.5, 1],
        [0.62, 9, -5.08, 1.95, -1],
        [0.62, 9, -5.4, 0.62, -1],
      ].forEach(([r, teeth, x, y, dir]) => {
        const g = gearGeometry(r, teeth, 0.22)
        disposables.push(g)
        gears.push({ mesh: part(g, r > 0.8 ? accentMat : steel, { pos: [x, y, 1.42], from: [0, 0, 3], order: o++, flash: true, glow: r <= 0.8 }), speed: dir / r })
      })

      // конвейер: ноги, рама, лента, ролики
      const length = 12
      const x0 = -4.2
      for (let i = 0; i <= 4; i++) {
        const x = x0 + (i / 4) * length
        part(geo.box, dark, { pos: [x, 0.5, -0.75], size: [0.16, 1, 0.16], order: o++ })
        part(geo.box, dark, { pos: [x, 0.5, 0.75], size: [0.16, 1, 0.16], order: o++ })
      }
      part(geo.box, steel, { pos: [x0 + length / 2, 1.05, -0.85], size: [length, 0.18, 0.12], from: [-6, 0, 0], order: o++ })
      part(geo.box, steel, { pos: [x0 + length / 2, 1.05, 0.85], size: [length, 0.18, 0.12], from: [-6, 0, 0], order: o++ })
      part(geo.box, belt, { pos: [x0 + length / 2, 1.08, 0], size: [length, 0.06, 1.6], from: [-6, 0, 0], order: o++ })
      const rollers = []
      for (let i = 0; i <= 12; i++) {
        const m = part(geo.cyl, steel, { pos: [x0 + i, 0.96, 0], size: [0.2, 1.62, 0.2], rot: [Math.PI / 2, 0, 0], from: [0, -1, 0], order: o + i * 0.3 })
        rollers.push(m)
      }
      o += 5

      // портал с контрольной рамкой
      const gx = 3
      part(geo.box, steel, { pos: [gx, 1.6, -1.3], size: [0.24, 3.2, 0.24], order: o++, flash: true })
      part(geo.box, steel, { pos: [gx, 1.6, 1.3], size: [0.24, 3.2, 0.24], order: o++ })
      part(geo.box, steel, { pos: [gx, 3.25, 0], size: [0.36, 0.3, 2.84], order: o++ })
      const scanMat = material(options.accent, { emissiveIntensity: 0.4 })
      part(geo.box, scanMat, { pos: [gx, 2.9, 0], size: [0.12, 0.08, 2.4], order: o++, glow: false })

      // изделия на ленте — появляются, когда цех собран
      const crateMat = []
      const crates = []
      for (let i = 0; i < 5; i++) {
        const m = material(0xb7a58a, { roughness: 0.75 })
        crateMat.push(m)
        const mesh = new Mesh(geo.box, m)
        mesh.scale.set(0.8, 0.7, 0.8)
        mesh.visible = false
        scene.add(mesh)
        crates.push({ mesh, offset: i / 5 })
      }

      return {
        target: new Vector3(-2.5, 1.6, 0),
        radius: 23,
        height: 8.5,
        angle: 0.9,
        step: 0.05,
        update({ elapsed, dt, done }) {
          if (!done) return
          gears.forEach((g) => (g.mesh.rotation.z += dt * g.speed * 1.2))
          rollers.forEach((r) => (r.rotation.y += dt * 4))
          const span = length - 0.8
          crates.forEach((c) => {
            const k = (elapsed * 0.08 + c.offset) % 1
            const x = x0 + 0.4 + k * span
            c.mesh.visible = true
            c.mesh.position.set(x, 1.47, 0)
            // вспышка при проходе рамки
            const d = Math.abs(x - gx)
            c.mesh.material.emissiveIntensity = d < 0.9 ? (0.9 - d) * 1.6 : Math.max(0, c.mesh.material.emissiveIntensity - dt * 1.5)
          })
          scanMat.emissiveIntensity = 0.5 + Math.sin(elapsed * 6) * 0.25
        },
      }
    },
  })
}
