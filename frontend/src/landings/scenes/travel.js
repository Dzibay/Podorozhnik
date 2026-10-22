import { ConeGeometry, Group, SphereGeometry } from 'three'
import { mountScene } from './engine'

/**
 * Туризм: из воды поднимается остров — пальма, зонт, шезлонг и чемодан.
 * Над островом кружит самолёт, листья пальмы качаются на ветру.
 */
export function mountTravel(canvas, options) {
  return mountScene(canvas, {
    ...options,
    build({ scene, geo, material, part, disposables, Vector3 }) {
      const water = material(0x1d4c52, { roughness: 0.25, metalness: 0.3 })
      const shallow = material(0x2f7a76, { roughness: 0.3, metalness: 0.2 })
      const sand = material(0xe3c592, { roughness: 0.9 })
      const trunk = material(0x8a6342, { roughness: 0.85 })
      const leaf = material(0x4f9a5e, { roughness: 0.7 })
      const accent = material(options.accent, { roughness: 0.5, emissiveIntensity: 0.1 })
      const white = material(0xf2f2ee, { roughness: 0.5 })
      const dark = material(0x26313a, { roughness: 0.6 })
      const sphere = new SphereGeometry(0.5, 20, 14)
      const cone = new ConeGeometry(0.5, 1, 20)
      disposables.push(sphere, cone)

      let o = 0
      part(geo.cyl, water, { pos: [0, -0.05, 0], size: [22, 0.1, 22], order: o++, from: [0, -1, 0], glow: false })
      part(geo.cyl, shallow, { pos: [0, 0.0, 0], size: [10.5, 0.1, 10.5], order: o++, from: [0, -1, 0], glow: false })
      part(sphere, sand, { pos: [0, -0.2, 0], size: [8.5, 1.4, 8.5], order: o++, from: [0, -2, 0], glow: false })

      // пальма: ствол из наклонённых сегментов и веер листьев
      const palm = new Group()
      palm.position.set(-1.8, 0.3, -1.2)
      scene.add(palm)
      for (let i = 0; i < 7; i++) {
        part(geo.cyl, trunk, { pos: [i * 0.12, 0.25 + i * 0.6, 0], size: [0.42 - i * 0.03, 0.64, 0.42 - i * 0.03], rot: [0, 0, -0.2], order: o + i * 0.3, from: [0, 3, 0], glow: false })
      }
      o += 3
      const crown = new Group()
      crown.position.set(0.85, 4.15, 0)
      palm.add(crown)
      const leaves = []
      for (let i = 0; i < 7; i++) {
        const g = new Group()
        g.rotation.y = (i / 7) * Math.PI * 2
        crown.add(g)
        part(geo.box, leaf, { pos: [0.95, -0.25, 0], size: [2.0, 0.06, 0.55], rot: [0, 0, -0.35], order: o + i * 0.2, parent: g, from: [0, 2, 0], flash: i === 0 })
        leaves.push(g)
      }
      o += 2
      ;[[0.25, 0.1], [-0.1, 0.25], [0.05, -0.25]].forEach(([x, z]) => part(sphere, trunk, { pos: [x, -0.25, z], size: [0.32, 0.32, 0.32], parent: crown, order: o, from: [0, 2, 0], glow: false }))
      o++

      // зонт, шезлонг и чемодан
      part(geo.cyl, white, { pos: [1.6, 1.5, 0.6], size: [0.08, 2.8, 0.08], order: o++, from: [0, 4, 0] })
      part(cone, accent, { pos: [1.6, 3.0, 0.6], size: [3.2, 0.8, 3.2], order: o++, from: [0, 4, 0], flash: true })
      part(geo.box, white, { pos: [1.1, 0.75, 1.9], size: [2.2, 0.1, 0.8], order: o++, from: [0, 3, 0] })
      part(geo.box, white, { pos: [2.35, 1.05, 1.9], size: [0.9, 0.1, 0.8], rot: [0, 0, 0.6], order: o++, from: [0, 3, 0] })
      ;[0.2, 2.0].forEach((x) => part(geo.box, dark, { pos: [x, 0.5, 1.9], size: [0.08, 0.45, 0.7], order: o, from: [0, 3, 0], glow: false }))
      o++
      part(geo.box, accent, { pos: [-0.4, 0.95, 2.4], size: [0.9, 1.2, 0.45], rot: [0, 0.3, 0], order: o++, from: [0, 4, 0] })
      part(geo.box, white, { pos: [-0.4, 0.95, 2.4], size: [0.92, 0.12, 0.47], rot: [0, 0.3, 0], order: o, from: [0, 4, 0], glow: false })
      part(geo.box, dark, { pos: [-0.4, 1.65, 2.4], size: [0.4, 0.12, 0.12], rot: [0, 0.3, 0], order: o++, from: [0, 4, 0], glow: false })

      // самолёт на круговом маршруте
      const orbit = new Group()
      scene.add(orbit)
      const plane = new Group()
      plane.position.set(5, 5.4, 0)
      plane.rotation.z = 0.25
      orbit.add(plane)
      part(geo.cyl, white, { pos: [0, 0, 0], size: [0.55, 2.8, 0.55], rot: [Math.PI / 2, 0, 0], order: o++, parent: plane, from: [0, 4, 0], flash: true })
      part(cone, white, { pos: [0, 0, -1.65], size: [0.55, 0.5, 0.55], rot: [-Math.PI / 2, 0, 0], order: o, parent: plane, from: [0, 4, 0], glow: false })
      part(geo.box, accent, { pos: [0, 0, -0.1], size: [3.4, 0.07, 0.7], order: o, parent: plane, from: [0, 4, 0] })
      part(geo.box, accent, { pos: [0, 0.4, 1.2], size: [0.07, 0.7, 0.45], order: o, parent: plane, from: [0, 4, 0], glow: false })
      part(geo.box, white, { pos: [0, 0.05, 1.25], size: [1.3, 0.05, 0.35], order: o++, parent: plane, from: [0, 4, 0], glow: false })

      return {
        target: new Vector3(0, 1.4, 0),
        radius: 27,
        height: 9,
        angle: 0.95,
        sway: 0.4,
        spin: 0.18,
        step: 0.05,
        fog: [22, 50],
        update({ elapsed, done, assembled }) {
          const t = elapsed
          leaves.forEach((g, i) => (g.rotation.z = Math.sin(t * 1.8 + i) * 0.08))
          if (!done) return
          orbit.rotation.y = (elapsed - assembled) * 0.35
          plane.position.y = 5.4 + Math.sin((elapsed - assembled) * 0.9) * 0.3
        },
      }
    },
  })
}
