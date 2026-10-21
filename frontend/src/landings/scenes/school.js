import { CylinderGeometry, Group } from 'three'
import { mountScene } from './engine'

/**
 * Образование: на столе собирается стопка учебников, рядом пирамида
 * из кубиков, карандаш и шапочка выпускника. Верхний кубик подпрыгивает,
 * шапочка медленно поворачивается.
 */
export function mountSchool(canvas, options) {
  return mountScene(canvas, {
    ...options,
    build({ scene, geo, material, part, disposables, Vector3 }) {
      const desk = material(0x2a2540, { roughness: 0.75 })
      const pages = material(0xf3efe4, { roughness: 0.8 })
      const covers = [0x5b4bd6, 0x2f8f83, 0xd9604c, 0x3b5aa8, 0xe0a63c].map((c) => material(c, { roughness: 0.55 }))
      const accent = material(options.accent, { roughness: 0.45, emissiveIntensity: 0.15 })
      const accent2 = material(0xffc35c, { roughness: 0.45 })
      const white = material(0xf1effa, { roughness: 0.5 })
      const black = material(0x15131f, { roughness: 0.6 })
      const wood = material(0xe8c48c, { roughness: 0.7 })
      const hex = new CylinderGeometry(0.5, 0.5, 1, 6)
      const cone = new CylinderGeometry(0, 0.5, 1, 6)
      disposables.push(hex, cone)

      let o = 0
      part(geo.box, desk, { pos: [0, -0.15, 0], size: [18, 0.3, 10], order: -10, from: [0, -2, 0], glow: false })

      // стопка книг: обложка и блок страниц
      const bx = -4
      ;[
        [3.4, 0.55, 2.5, 0.05],
        [3.1, 0.5, 2.3, -0.12],
        [3.3, 0.6, 2.4, 0.18],
        [2.9, 0.45, 2.1, -0.05],
        [3, 0.5, 2.2, 0.22],
      ].reduce((y, [w, h, d, r], i) => {
        part(geo.box, covers[i], { pos: [bx, y + h / 2, 0], size: [w, h, d], rot: [0, r, 0], order: o, from: [0, 4, 0], flash: i === 0 })
        part(geo.box, pages, { pos: [bx + 0.06 * Math.cos(r), y + h / 2, 0], size: [w - 0.1, h - 0.12, d + 0.04], rot: [0, r, 0], order: o + 0.3, from: [0, 4, 0], glow: false })
        o++
        return y + h
      }, 0)

      // шапочка выпускника на книгах
      const cap = new Group()
      cap.position.set(bx, 2.6 + 0.35, 0)
      scene.add(cap)
      part(geo.cyl, black, { pos: [0, 0, 0], size: [1.3, 0.5, 1.3], order: o++, parent: cap, from: [0, 3, 0] })
      part(geo.box, black, { pos: [0, 0.3, 0], size: [2.2, 0.08, 2.2], rot: [0, Math.PI / 4, 0], order: o++, parent: cap, from: [0, 3, 0], flash: true })
      part(geo.box, accent2, { pos: [0.75, -0.05, 0.75], size: [0.05, 0.7, 0.05], order: o++, parent: cap, from: [0, 3, 0], glow: false })

      // пирамида кубиков 3-2-1
      const mats = [accent, white, accent2, white, accent, accent2]
      let k = 0
      let top = null
      ;[3, 2, 1].forEach((n, level) => {
        for (let i = 0; i < n; i++) {
          const x = 2.2 + (i - (n - 1) / 2) * 1.25
          const m = part(geo.box, mats[k++], { pos: [x, 0.6 + level * 1.2, 0.2], size: [1.15, 1.15, 1.15], rot: [0, (i - 1) * 0.08, 0], order: o++, from: [0, 5, 0], flash: level === 2 })
          if (level === 2) top = { mesh: m, y: m.position.y }
        }
      })

      // карандаш
      const pencil = new Group()
      pencil.position.set(0, 0.22, 3)
      pencil.rotation.y = -0.35
      scene.add(pencil)
      part(hex, accent2, { pos: [0, 0, 0], size: [0.42, 4.4, 0.42], rot: [0, 0, Math.PI / 2], order: o++, parent: pencil, from: [-4, 0, 0] })
      part(cone, wood, { pos: [2.55, 0, 0], size: [0.42, 0.7, 0.42], rot: [0, 0, -Math.PI / 2], order: o++, parent: pencil, from: [-4, 0, 0], glow: false })
      part(geo.cyl, white, { pos: [-2.35, 0, 0], size: [0.44, 0.3, 0.44], rot: [0, 0, Math.PI / 2], order: o++, parent: pencil, from: [-4, 0, 0], glow: false })

      return {
        target: new Vector3(-1.7, 1.3, 0.4),
        radius: 20,
        height: 6.8,
        angle: 1.05,
        sway: 0.45,
        spin: 0.2,
        step: 0.09,
        fog: [20, 44],
        update({ elapsed, done, assembled }) {
          if (!done) return
          const t = elapsed - assembled
          cap.rotation.y = t * 0.35
          // кубик подпрыгивает раз в пару секунд и делает четверть оборота
          const hop = (t % 2.4) / 2.4
          const lift = hop < 0.35 ? Math.sin((hop / 0.35) * Math.PI) : 0
          top.mesh.position.y = top.y + lift * 0.7
          top.mesh.rotation.y = Math.floor(t / 2.4) * (Math.PI / 2) + (hop < 0.35 ? (hop / 0.35) * (Math.PI / 2) : Math.PI / 2)
        },
      }
    },
  })
}
