import { CylinderGeometry, Group, SphereGeometry } from 'three'
import { mountScene } from './engine'

/**
 * Цветы: собирается прилавок — ваза с букетом, горшки и подарочная
 * коробка. Потом стебли покачиваются, а большой бутон раскрывает лепестки.
 */
export function mountFlowers(canvas, options) {
  return mountScene(canvas, {
    ...options,
    build({ scene, geo, material, part, grid, disposables, Vector3 }) {
      grid(40, 0.3)
      const counter = material(0xe9dfd6, { roughness: 0.7 })
      const wood = material(0x6a4b3a, { roughness: 0.8 })
      const vase = material(0xbfd9e6, { roughness: 0.1, metalness: 0.2, transparent: true, opacity: 0.55 })
      const stem = material(0x5f9a58, { roughness: 0.7 })
      const leaf = material(0x9fdc8c, { roughness: 0.6 })
      const petals = [options.accent, 0xffc2d1, 0xffffff, 0xffa65c].map((c) => material(c, { roughness: 0.55 }))
      const heart = material(0xffd36b, { roughness: 0.5, emissive: 0xffc04d, emissiveIntensity: 0.2 })
      const pot = material(0xc0704d, { roughness: 0.85 })
      const soil = material(0x3a2a22, { roughness: 1 })
      const giftM = material(options.accent, { roughness: 0.5, emissiveIntensity: 0.1 })
      const ribbon = material(0xfff1e0, { roughness: 0.5 })
      const sphere = new SphereGeometry(0.5, 16, 12)
      const vaseGeo = new CylinderGeometry(0.5, 0.36, 1, 28, 1, true)
      const potGeo = new CylinderGeometry(0.5, 0.38, 1, 24)
      // лепесток: сплюснутый шар, сдвинутый так, чтобы основание было в начале координат
      const petalGeo = new SphereGeometry(0.5, 14, 10)
      petalGeo.translate(0, 0.5, 0)
      disposables.push(sphere, vaseGeo, potGeo, petalGeo)

      let o = 0
      part(geo.box, counter, { pos: [0, 0.9, 0], size: [9, 1.8, 3.4], order: o++, from: [0, -3, 0], flash: true })
      part(geo.box, wood, { pos: [0, 1.84, 0], size: [9.2, 0.08, 3.6], order: o++, from: [0, -3, 0], glow: false })

      // ваза с букетом: стебли в группах, чтобы качаться от основания
      part(vaseGeo, vase, { pos: [-1.6, 2.9, 0], size: [1.3, 2.1, 1.3], order: o++, from: [0, 4, 0], glow: false })
      const stems = []
      const bouquet = [
        [-0.25, -0.1, 0.12, 3.4, 0],
        [0.2, 0.15, -0.14, 3.1, 1],
        [0.05, 0.25, 0.05, 3.7, 2],
        [-0.15, 0.2, -0.2, 2.9, 3],
        [0.3, -0.2, 0.22, 3.3, 1],
        [-0.3, 0.05, -0.05, 3.0, 2],
        [0.1, -0.25, -0.08, 3.55, 0],
      ]
      bouquet.forEach(([dx, dz, tilt, h, c], i) => {
        const g = new Group()
        g.position.set(-1.6 + dx * 0.5, 2.0, dz * 0.5)
        g.rotation.set(dz * 0.8, 0, -dx * 0.9 - tilt)
        scene.add(g)
        part(geo.cyl, stem, { pos: [0, h / 2, 0], size: [0.06, h, 0.06], order: o + i * 0.2, parent: g, from: [0, 4, 0], glow: false })
        part(sphere, leaf, { pos: [0.14, h * 0.45, 0], size: [0.32, 0.1, 0.16], rot: [0, 0, 0.6], order: o + i * 0.2, parent: g, from: [0, 4, 0], glow: false })
        for (let p = 0; p < 6; p++) {
          const a = (p / 6) * Math.PI * 2
          part(sphere, petals[c], { pos: [Math.cos(a) * 0.2, h + 0.05, Math.sin(a) * 0.2], size: [0.34, 0.14, 0.34], order: o + i * 0.2 + 0.1, parent: g, from: [0, 4, 0], glow: false })
        }
        part(sphere, heart, { pos: [0, h + 0.1, 0], size: [0.2, 0.16, 0.2], order: o + i * 0.2 + 0.1, parent: g, from: [0, 4, 0], glow: false })
        stems.push({ g, base: g.rotation.z, i })
      })
      o += 3

      // большой бутон, который раскрывается
      const bud = new Group()
      bud.position.set(1.6, 1.88, 0.2)
      scene.add(bud)
      part(potGeo, pot, { pos: [0, 0.5, 0], size: [1.2, 1.0, 1.2], order: o, parent: bud, from: [0, 4, 0], glow: false })
      part(geo.cyl, soil, { pos: [0, 0.98, 0], size: [1.1, 0.04, 1.1], order: o, parent: bud, from: [0, 4, 0], glow: false })
      part(geo.cyl, stem, { pos: [0, 1.9, 0], size: [0.09, 1.8, 0.09], order: o, parent: bud, from: [0, 4, 0], glow: false })
      ;[-1, 1].forEach((s) => part(sphere, leaf, { pos: [s * 0.32, 1.6, 0], size: [0.6, 0.12, 0.28], rot: [0, 0, s * 0.5], order: o, parent: bud, from: [0, 4, 0], glow: false }))
      o++
      const open = []
      for (let p = 0; p < 8; p++) {
        const hinge = new Group()
        hinge.position.set(0, 2.8, 0)
        hinge.rotation.y = (p / 8) * Math.PI * 2
        bud.add(hinge)
        const tilt = new Group()
        hinge.add(tilt)
        part(petalGeo, petals[0], { pos: [0, 0, 0.06], size: [0.5, 0.9, 0.18], order: o + p * 0.05, parent: tilt, from: [0, 4, 0], flash: p === 0, glow: false })
        open.push(tilt)
      }
      part(sphere, heart, { pos: [0, 2.95, 0], size: [0.3, 0.26, 0.3], order: o + 0.4, parent: bud, from: [0, 4, 0], glow: false })
      o++

      // горшки и подарочная коробка
      ;[[3.6, -0.8, 3], [-3.8, 0.6, 1]].forEach(([x, z, c], i) => {
        part(potGeo, pot, { pos: [x, 2.25, z], size: [0.8, 0.7, 0.8], order: o + i * 0.3, from: [0, 4, 0], glow: false })
        part(sphere, leaf, { pos: [x, 2.85, z], size: [0.9, 0.6, 0.9], order: o + i * 0.3, from: [0, 4, 0], glow: false })
        ;[[0.2, 0.15], [-0.22, -0.1], [0.05, -0.25]].forEach(([dx, dz]) =>
          part(sphere, petals[c], { pos: [x + dx, 3.15, z + dz], size: [0.22, 0.18, 0.22], order: o + i * 0.3 + 0.1, from: [0, 4, 0], glow: false }),
        )
      })
      o++
      part(geo.box, giftM, { pos: [3.4, 2.3, 1.1], size: [1.0, 0.8, 1.0], rot: [0, 0.3, 0], order: o, from: [0, 4, 0] })
      part(geo.box, ribbon, { pos: [3.4, 2.3, 1.1], size: [1.02, 0.82, 0.16], rot: [0, 0.3, 0], order: o, from: [0, 4, 0], glow: false })
      part(geo.box, ribbon, { pos: [3.4, 2.3, 1.1], size: [0.16, 0.82, 1.02], rot: [0, 0.3, 0], order: o, from: [0, 4, 0], glow: false })
      part(sphere, ribbon, { pos: [3.4, 2.76, 1.1], size: [0.4, 0.2, 0.25], rot: [0, 0.3, 0], order: o++, from: [0, 4, 0], glow: false })

      const closed = 0.15
      open.forEach((g) => (g.rotation.x = closed))

      return {
        target: new Vector3(0, 3.0, 0),
        radius: 18,
        height: 6.5,
        angle: 1.2,
        sway: 0.4,
        spin: 0.2,
        step: 0.012,
        fog: [18, 42],
        update({ elapsed, done, assembled }) {
          if (!done) return
          const t = elapsed - assembled
          stems.forEach(({ g, base, i }) => (g.rotation.z = base + Math.sin(t * 1.1 + i) * 0.04))
          // бутон раскрывается за 3 с и держится раскрытым, потом медленно закрывается и снова раскрывается
          const c = t % 10
          const k = c < 3 ? c / 3 : c < 7.5 ? 1 : c < 9.5 ? 1 - (c - 7.5) / 2 : 0
          const e = k * k * (3 - 2 * k)
          open.forEach((g) => (g.rotation.x = closed + e * 1.0))
          heart.emissiveIntensity = 0.2 + e * 0.4
        },
      }
    },
  })
}
