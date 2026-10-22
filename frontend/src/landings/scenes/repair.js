import { Group, TorusGeometry } from 'three'
import { mountScene } from './engine'

/**
 * Ремонт техники: собирается верстак, ноутбук и стиральная машина.
 * Над столом смартфон разбирается на слои — корпус, плата, батарея,
 * экран — и собирается обратно; барабан машины крутится.
 */
export function mountRepair(canvas, options) {
  return mountScene(canvas, {
    ...options,
    build({ scene, geo, material, part, grid, disposables, Vector3 }) {
      grid(40, 0.3)
      const top = material(0x3b3530, { roughness: 0.8 })
      const leg = material(0x23272b, { roughness: 0.5, metalness: 0.5 })
      const mat = material(0x1d4a46, { roughness: 0.9 })
      const shell = material(0x2b2f35, { roughness: 0.4, metalness: 0.5 })
      const lcd = material(0x10181c, { roughness: 0.2, emissive: 0x5ad1c4, emissiveIntensity: 0.35 })
      const pcb = material(0x1f6b4a, { roughness: 0.6 })
      const chip = material(0x15171a, { roughness: 0.4 })
      const battery = material(options.accent, { roughness: 0.5, emissive: options.accent, emissiveIntensity: 0.15 })
      const glass = material(0x0d1216, { roughness: 0.05, metalness: 0.5, emissive: 0x5ad1c4, emissiveIntensity: 0.1 })
      const white = material(0xe8ecef, { roughness: 0.45 })
      const door = material(0x9fb3bd, { roughness: 0.1, metalness: 0.4, transparent: true, opacity: 0.45 })
      const drumM = material(0x8f989e, { roughness: 0.3, metalness: 0.7 })
      const tool = material(0xc9ced3, { roughness: 0.3, metalness: 0.8 })
      const grip = material(options.accent, { roughness: 0.5 })
      const ring = new TorusGeometry(0.5, 0.06, 10, 36)
      disposables.push(ring)

      let o = 0
      // верстак и коврик
      part(geo.box, top, { pos: [-1, 1.7, 0], size: [7, 0.18, 3.2], order: o++, from: [0, -3, 0], flash: true })
      ;[[-4.3, -1.4], [2.3, -1.4], [-4.3, 1.4], [2.3, 1.4]].forEach(([x, z]) => part(geo.box, leg, { pos: [x, 0.85, z], size: [0.14, 1.7, 0.14], order: o, from: [0, -3, 0], glow: false }))
      o++
      part(geo.box, mat, { pos: [-0.6, 1.8, 0.3], size: [3.0, 0.02, 2.0], order: o++, from: [0, 2, 0], glow: false })

      // ноутбук с открытой крышкой
      part(geo.box, shell, { pos: [-3.3, 1.83, -0.3], size: [2.0, 0.08, 1.4], order: o, from: [0, 3, 0] })
      const lid = new Group()
      lid.position.set(-3.3, 1.87, -1.0)
      lid.rotation.x = -0.25
      scene.add(lid)
      part(geo.box, shell, { pos: [0, 0.7, 0], size: [2.0, 1.4, 0.06], order: o, parent: lid, from: [0, 3, 0], glow: false })
      part(geo.box, lcd, { pos: [0, 0.72, 0.035], size: [1.8, 1.2, 0.01], order: o++, parent: lid, from: [0, 3, 0], glow: false })

      // инструменты: отвёртка и пинцет
      part(geo.cyl, grip, { pos: [0.9, 1.86, 1.0], size: [0.14, 0.6, 0.14], rot: [0, 0, Math.PI / 2], order: o, from: [0, 2, 0], glow: false })
      part(geo.cyl, tool, { pos: [1.45, 1.86, 1.0], size: [0.05, 0.6, 0.05], rot: [0, 0, Math.PI / 2], order: o, from: [0, 2, 0], glow: false })
      part(geo.box, tool, { pos: [0.9, 1.83, 0.4], size: [0.9, 0.03, 0.06], rot: [0, 0.3, 0], order: o++, from: [0, 2, 0], glow: false })

      // смартфон: слои, которые разъезжаются по вертикали
      const phone = new Group()
      phone.position.set(-0.6, 2.4, 0.3)
      phone.rotation.set(-0.35, 0.3, 0)
      scene.add(phone)
      const layers = []
      const layer = (build) => {
        const g = new Group()
        phone.add(g)
        build(g)
        layers.push(g)
      }
      layer((g) => part(geo.box, shell, { pos: [0, 0, 0], size: [1.0, 0.08, 2.0], order: o, parent: g, from: [0, 3, 0], glow: false }))
      layer((g) => {
        part(geo.box, pcb, { pos: [0, 0, -0.45], size: [0.9, 0.04, 1.0], order: o + 0.2, parent: g, from: [0, 3, 0], glow: false })
        part(geo.box, chip, { pos: [0.15, 0.04, -0.55], size: [0.3, 0.04, 0.3], order: o + 0.2, parent: g, from: [0, 3, 0], glow: false })
        part(geo.box, chip, { pos: [-0.22, 0.04, -0.2], size: [0.2, 0.04, 0.2], order: o + 0.2, parent: g, from: [0, 3, 0], glow: false })
      })
      layer((g) => part(geo.box, battery, { pos: [0, 0, 0.45], size: [0.8, 0.07, 0.9], order: o + 0.4, parent: g, from: [0, 3, 0], glow: false }))
      layer((g) => part(geo.box, glass, { pos: [0, 0, 0], size: [1.0, 0.04, 2.0], order: o + 0.6, parent: g, from: [0, 3, 0], flash: true, glow: false }))
      o += 2

      // стиральная машина рядом с верстаком
      part(geo.box, white, { pos: [4.6, 1.5, 0], size: [2.4, 3.0, 2.2], order: o++, from: [0, 5, 0], flash: true })
      part(geo.box, leg, { pos: [4.6, 2.75, 1.11], size: [2.2, 0.35, 0.02], order: o, from: [0, 0, 2], glow: false })
      part(geo.cyl, lcd, { pos: [5.3, 2.75, 1.13], size: [0.22, 0.02, 0.22], rot: [Math.PI / 2, 0, 0], order: o++, from: [0, 0, 2], glow: false })
      part(ring, leg, { pos: [4.6, 1.35, 1.12], size: [1.7, 1.7, 1.7], order: o, from: [0, 0, 2], glow: false })
      const drum = new Group()
      drum.position.set(4.6, 1.35, 1.0)
      scene.add(drum)
      part(geo.cyl, drumM, { pos: [0, 0, 0], size: [1.5, 0.05, 1.5], rot: [Math.PI / 2, 0, 0], order: o, parent: drum, from: [0, 0, 2], glow: false })
      ;[0, 1, 2].forEach((i) => {
        const a = (i / 3) * Math.PI * 2
        part(geo.box, white, { pos: [Math.cos(a) * 0.5, Math.sin(a) * 0.5, 0.05], size: [0.3, 0.12, 0.1], rot: [0, 0, a], order: o, parent: drum, from: [0, 0, 2], glow: false })
      })
      part(geo.cyl, door, { pos: [4.6, 1.35, 1.14], size: [1.55, 0.04, 1.55], rot: [Math.PI / 2, 0, 0], order: o++, from: [0, 0, 2], glow: false })

      return {
        target: new Vector3(0.6, 2.6, 0),
        radius: 21,
        height: 6.5,
        angle: 1.25,
        sway: 0.4,
        spin: 0.2,
        step: 0.03,
        fog: [20, 44],
        update({ elapsed, done, assembled }) {
          if (!done) return
          const t = elapsed - assembled
          // цикл 7 с: разобрать, подержать, собрать
          const c = t % 7
          const k = c < 1.5 ? c / 1.5 : c < 4 ? 1 : c < 5.5 ? 1 - (c - 4) / 1.5 : 0
          const e = k * k * (3 - 2 * k)
          layers.forEach((g, i) => (g.position.y = i * (0.06 + e * 0.5)))
          phone.position.y = 2.4 + e * 0.3
          drum.rotation.z = -t * 2.4
          lcd.emissiveIntensity = 0.35 + Math.sin(t * 1.5) * 0.05
        },
      }
    },
  })
}
