import { PointLight } from 'three'
import { mountScene } from './engine'

/**
 * Мебель на заказ: кухня собирается по модулям — корпуса, фасады, столешница,
 * верхние шкафы, колонна и остров. Потом над островом загораются подвесные
 * лампы, а ящик то выдвигается, то задвигается.
 */
export function mountMebel(canvas, options) {
  return mountScene(canvas, {
    ...options,
    build({ scene, geo, material, part, Vector3 }) {
      const floor = material(0x2a211b, { roughness: 0.8 })
      const wall = material(0x221c18, { roughness: 0.95 })
      const carcass = material(0x3b302a, { roughness: 0.7 })
      const front = material(0x2f3b35, { roughness: 0.55 })
      const oak = material(0xb98a5a, { roughness: 0.5 })
      const stone = material(0xe9e3da, { roughness: 0.25, metalness: 0.05 })
      const brass = material(options.accent, { roughness: 0.3, metalness: 0.8, emissiveIntensity: 0.1 })
      const shade = material(0x1a1512, { roughness: 0.4, metalness: 0.5 })
      const bulb = material(0xfff1d6, { emissiveIntensity: 0 })

      part(geo.box, floor, { pos: [0, -0.05, 0], size: [14, 0.1, 9], order: -10, from: [0, -1, 0], glow: false })
      part(geo.box, wall, { pos: [0, 2.6, -3.1], size: [14, 5.2, 0.2], order: -9, from: [0, -6, 0], glow: false })
      part(geo.box, wall, { pos: [-7, 2.6, 1.4], size: [0.2, 5.2, 9], order: -8, from: [0, -6, 0], glow: false })

      const N = 6
      const w = 1
      const x0 = -3.5
      const z = -2.6
      const drawers = []
      let o = 0
      // нижние модули: корпус → фасад → ручка
      for (let i = 0; i < N; i++) {
        const x = x0 + i * w
        part(geo.box, carcass, { pos: [x, 0.5, z + 0.25], size: [w - 0.02, 0.9, 0.6], order: o + i, from: [0, 2.5, 0] })
      }
      o += N
      for (let i = 0; i < N; i++) {
        const x = x0 + i * w
        if (i % 2) {
          // модуль с ящиками
          ;[0.25, 0.55, 0.8].forEach((y, k) => {
            const mat = k === 0 ? oak : front
            const d = part(geo.box, mat, { pos: [x, y, z + 0.57], size: [w - 0.04, k === 0 ? 0.36 : 0.24, 0.04], order: o + i + k * 0.1, from: [0, 0, 2] })
            if (k === 1) drawers.push({ mesh: d, home: d.position.clone(), phase: i })
          })
        } else {
          part(geo.box, front, { pos: [x, 0.5, z + 0.57], size: [w - 0.04, 0.86, 0.04], order: o + i, from: [0, 0, 2] })
        }
        part(geo.box, brass, { pos: [x, 0.82, z + 0.61], size: [0.42, 0.03, 0.03], order: o + i + 0.5, from: [0, 0, 1] })
      }
      o += N + 1
      part(geo.box, stone, { pos: [x0 + (N - 1) / 2, 0.99, z + 0.28], size: [N * w + 0.08, 0.08, 0.7], order: o++, from: [0, 3, 0], flash: true })

      // фартук и верхние шкафы
      part(geo.box, oak, { pos: [x0 + (N - 1) / 2, 1.5, z - 0.04], size: [N * w, 0.9, 0.04], order: o++, from: [0, 0, 1] })
      for (let i = 0; i < N; i++) {
        const x = x0 + i * w
        part(geo.box, front, { pos: [x, 2.45, z + 0.2], size: [w - 0.03, 0.95, 0.38], order: o + i * 0.6, from: [0, 2, 0] })
      }
      o += N
      // колонна под технику
      part(geo.box, front, { pos: [x0 + N * w + 0.15, 1.45, z + 0.3], size: [1.2, 2.9, 0.7], order: o++, from: [0, 4, 0], flash: true })
      part(geo.box, brass, { pos: [x0 + N * w - 0.3, 1.5, z + 0.67], size: [0.03, 1.2, 0.03], order: o++, from: [0, 0, 1] })

      // остров
      part(geo.box, oak, { pos: [0, 0.45, 0.6], size: [3.2, 0.9, 1.1], order: o++, from: [0, 3, 0] })
      part(geo.box, stone, { pos: [0, 0.94, 0.75], size: [3.5, 0.08, 1.5], order: o++, from: [0, 3, 0], flash: true })

      // подвесные лампы
      const lamps = []
      ;[-1.1, 0, 1.1].forEach((x, i) => {
        part(geo.box, shade, { pos: [x, 3.5, 0.75], size: [0.02, 1.6, 0.02], order: o + i, from: [0, 3, 0], glow: false })
        part(geo.cyl, shade, { pos: [x, 2.62, 0.75], size: [0.5, 0.35, 0.5], order: o + i + 0.2, from: [0, 3, 0], glow: false })
        part(geo.cyl, bulb, { pos: [x, 2.43, 0.75], size: [0.3, 0.04, 0.3], order: o + i + 0.3, from: [0, 3, 0], glow: false })
        const light = new PointLight(0xffd59a, 0, 5, 1.8)
        light.position.set(x, 2.3, 0.75)
        scene.add(light)
        lamps.push(light)
      })

      return {
        target: new Vector3(0, 1.3, -0.6),
        radius: 13,
        height: 5.2,
        angle: 1.25,
        sway: 0.45,
        spin: 0.22,
        step: 0.07,
        fog: [16, 34],
        update({ elapsed, done, assembled }) {
          if (!done) return
          // лампы разгораются после сборки
          const k = Math.min(1, (elapsed - assembled) / 1.2)
          lamps.forEach((l) => (l.intensity = k * 3.2))
          bulb.emissiveIntensity = k * 1.6
          bulb.emissive.setHex(0xffd59a)
          // ящики по очереди выдвигаются
          drawers.forEach((d) => {
            const s = Math.max(0, Math.sin(elapsed * 0.7 - d.phase * 0.9))
            d.mesh.position.z = d.home.z + Math.pow(s, 3) * 0.45
          })
        },
      }
    },
  })
}
