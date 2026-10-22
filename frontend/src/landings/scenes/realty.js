import { ConeGeometry, SphereGeometry } from 'three'
import { mountScene } from './engine'

/**
 * Агентство недвижимости: из кварталов вырастают дома, вокруг дороги и деревья.
 * Над одним домом висит метка объекта, а в окнах вечером загорается свет.
 */
export function mountRealty(canvas, options) {
  return mountScene(canvas, {
    ...options,
    build({ geo, material, part, disposables, Vector3 }) {
      const ground = material(0x161a22, { roughness: 0.95 })
      const road = material(0x232833, { roughness: 0.9 })
      const paint = material(0x4a5160, { roughness: 0.8 })
      const walls = [0x3a4252, 0x4b5366, 0x313846, 0x575f70].map((c) => material(c, { roughness: 0.75 }))
      const roof = material(0x272d38, { roughness: 0.7 })
      const pin = material(options.accent, { roughness: 0.35, emissiveIntensity: 0.3 })
      const tree = material(0x3f6b4f, { roughness: 0.85 })
      const trunk = material(0x5b4636, { roughness: 0.9 })
      // окна разбиты на группы — каждая загорается в свой момент
      const lights = Array.from({ length: 5 }, () => material(0xf6c66b, { roughness: 0.4, emissive: 0xffc56b, emissiveIntensity: 0 }))
      const sphere = new SphereGeometry(0.5, 20, 14)
      const cone = new ConeGeometry(0.5, 1, 20)
      disposables.push(sphere, cone)

      let o = 0
      part(geo.box, ground, { pos: [0, 0.02, 0], size: [16, 0.04, 12], order: o++, from: [0, -1, 0], glow: false })
      part(geo.box, road, { pos: [0, 0.05, 2.6], size: [16, 0.03, 1.6], order: o, from: [0, -1, 0], glow: false })
      part(geo.box, road, { pos: [0.4, 0.05, 0], size: [1.6, 0.03, 12], order: o++, from: [0, -1, 0], glow: false })
      for (let i = 0; i < 6; i++) part(geo.box, paint, { pos: [-7 + i * 2.6, 0.07, 2.6], size: [1.0, 0.02, 0.1], order: o, from: [0, -1, 0], glow: false })
      o++

      // дома: [x, z, ширина, глубина, этажи]; окна на двух видимых фасадах
      const houses = [
        [-3.2, -0.5, 2.4, 2.4, 7],
        [-5.8, -0.2, 1.8, 2.0, 4],
        [3.0, -0.6, 2.2, 2.6, 9],
        [5.6, -0.4, 1.8, 1.8, 5],
        [-2.2, 5.0, 2.6, 1.8, 3],
        [3.4, 5.0, 2.0, 1.8, 4],
      ]
      let w = 0
      houses.forEach(([x, z, sx, sz, floors], i) => {
        const h = floors * 0.62 + 0.3
        part(geo.box, walls[i % 4], { pos: [x, h / 2, z], size: [sx, h, sz], order: o, from: [0, -h, 0], flash: i === 2 })
        part(geo.box, roof, { pos: [x, h + 0.08, z], size: [sx + 0.12, 0.16, sz + 0.12], order: o + 0.5, from: [0, 2, 0], glow: false })
        const cols = Math.max(2, Math.round(sx / 0.7))
        for (let f = 0; f < floors; f++) {
          for (let c = 0; c < cols; c++) {
            const y = 0.55 + f * 0.62
            const wx = x - sx / 2 + (c + 0.5) * (sx / cols)
            part(geo.box, lights[w++ % 5], { pos: [wx, y, z + sz / 2 + 0.02], size: [0.28, 0.34, 0.04], order: o + 0.7, from: [0, 0, 0], glow: false })
          }
          const wz = z - sz / 2 + sz * 0.5
          part(geo.box, lights[w++ % 5], { pos: [x + sx / 2 + 0.02, 0.55 + f * 0.62, wz], size: [0.04, 0.34, 0.28], order: o + 0.7, from: [0, 0, 0], glow: false })
        }
        o += 1
      })

      // деревья вдоль дороги
      ;[-6.5, -4.6, -1, 1.8, 4.6, 6.6].forEach((x, i) => {
        part(geo.cyl, trunk, { pos: [x, 0.35, 3.8], size: [0.14, 0.7, 0.14], order: o + i * 0.2, from: [0, 2, 0], glow: false })
        part(sphere, tree, { pos: [x, 1.0, 3.8], size: [0.8, 0.9, 0.8], order: o + i * 0.2, from: [0, 2, 0], glow: false })
      })
      o += 2

      // метка объекта над высоткой
      const top = 9 * 0.62 + 0.3
      const marker = part(sphere, pin, { pos: [3.0, top + 1.6, -0.6], size: [0.9, 0.9, 0.9], order: o++, from: [0, 5, 0], flash: true })
      const tip = part(cone, pin, { pos: [3.0, top + 0.95, -0.6], size: [0.62, 0.9, 0.62], rot: [Math.PI, 0, 0], order: o - 0.5, from: [0, 5, 0], glow: false })

      return {
        target: new Vector3(0, 1.8, 1),
        radius: 31,
        height: 11,
        angle: 0.95,
        sway: 0.45,
        spin: 0.17,
        step: 0.012,
        fog: [26, 58],
        update({ elapsed, done, assembled }) {
          if (!done) return
          const t = elapsed - assembled
          const bob = Math.sin(t * 2) * 0.18
          marker.position.y = top + 1.6 + bob
          tip.position.y = top + 0.95 + bob
          // окна загораются группами по очереди и держат свет
          lights.forEach((m, i) => {
            const on = Math.min(1, Math.max(0, (t - i * 0.6) * 2))
            m.emissiveIntensity = on * (0.75 + Math.sin(t * 0.8 + i * 2) * 0.15)
          })
        },
      }
    },
  })
}
