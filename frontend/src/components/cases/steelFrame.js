import * as THREE from 'three'

/**
 * Грэйдстрой: каркас промышленного здания собирается из балок.
 * Колонны → фермы → прогоны → связи. Каждая балка «приваривается»:
 * вспыхивает акцентом и выбрасывает искры. Потом каркас медленно вращается.
 */
export function mountSteel(canvas, { accent, bg, reduced }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(0x000000, 0)

  const scene = new THREE.Scene()
  scene.fog = new THREE.Fog(new THREE.Color(bg), 22, 46)

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100)
  const target = new THREE.Vector3(0, 2.6, 0)

  scene.add(new THREE.HemisphereLight(0xdfe6ee, 0x15171a, 1.1))
  const sun = new THREE.DirectionalLight(0xfff1e0, 2.2)
  sun.position.set(8, 14, 6)
  scene.add(sun)
  /* контровой свет в цвет акцента — обводит каркас со спины */
  const rim = new THREE.DirectionalLight(new THREE.Color(accent), 1.6)
  rim.position.set(-10, 6, -12)
  scene.add(rim)
  const weld = new THREE.PointLight(new THREE.Color(accent), 0, 7, 1.6)
  scene.add(weld)

  const accentColor = new THREE.Color(accent)
  const steel = new THREE.Color(0x7d8794)
  const box = new THREE.BoxGeometry(1, 1, 1)
  const members = []

  const L = 6 // полудлина здания по z
  const W = 4 // полупролёт по x
  const H = 4 // высота колонн
  const R = 1.7 // подъём конька
  const roofY = (x) => H + R * (1 - Math.abs(x) / W)
  const up = new THREE.Vector3(0, 1, 0)

  function member(a, b, size, order) {
    const from = new THREE.Vector3(...a)
    const to = new THREE.Vector3(...b)
    const dir = to.clone().sub(from)
    const mesh = new THREE.Mesh(
      box,
      new THREE.MeshStandardMaterial({ color: steel, metalness: 0.45, roughness: 0.42, emissive: accentColor, emissiveIntensity: 0 }),
    )
    mesh.scale.set(size, dir.length(), size)
    mesh.quaternion.setFromUnitVectors(up, dir.clone().normalize())
    const home = from.clone().add(to).multiplyScalar(0.5)
    mesh.position.copy(home)
    mesh.visible = reduced
    scene.add(mesh)
    members.push({ mesh, home, order, landed: reduced, t: 0 })
  }

  const frames = []
  for (let z = -L; z <= L; z += 2) frames.push(z)
  const xs = [-W, -W / 2, 0, W / 2, W]

  // 1. колонны
  frames.forEach((z, i) => {
    member([-W, 0, z], [-W, H, z], 0.26, i * 2)
    member([W, 0, z], [W, H, z], 0.26, i * 2 + 1)
  })
  // 2. фермы: нижний пояс, верхний пояс, стойки и раскосы
  frames.forEach((z, i) => {
    const o = 20 + i * 10
    for (let k = 0; k < 4; k++) {
      member([xs[k], H, z], [xs[k + 1], H, z], 0.14, o + k)
      member([xs[k], roofY(xs[k]), z], [xs[k + 1], roofY(xs[k + 1]), z], 0.18, o + k + 0.5)
    }
    ;[-W / 2, 0, W / 2].forEach((x, k) => member([x, H, z], [x, roofY(x), z], 0.08, o + 5 + k))
    member([-W, H, z], [-W / 2, roofY(-W / 2), z], 0.07, o + 8)
    member([W, H, z], [W / 2, roofY(W / 2), z], 0.07, o + 8.5)
  })
  // 3. прогоны и ригели стен
  for (let i = 0; i < frames.length - 1; i++) {
    const z0 = frames[i]
    const z1 = frames[i + 1]
    xs.forEach((x, k) => member([x, roofY(x), z0], [x, roofY(x), z1], 0.1, 100 + i * 8 + k))
    member([-W, H / 2, z0], [-W, H / 2, z1], 0.09, 100 + i * 8 + 6)
    member([W, H / 2, z0], [W, H / 2, z1], 0.09, 100 + i * 8 + 7)
  }
  // 4. крестовые связи в торцевых пролётах
  ;[0, frames.length - 2].forEach((i, n) => {
    const z0 = frames[i]
    const z1 = frames[i + 1]
    ;[-W, W].forEach((x, k) => {
      member([x, 0, z0], [x, H, z1], 0.05, 160 + n * 4 + k * 2)
      member([x, H, z0], [x, 0, z1], 0.05, 160 + n * 4 + k * 2 + 1)
    })
  })

  members.sort((a, b) => a.order - b.order)

  // пол цеха
  const grid = new THREE.GridHelper(40, 40, 0x3a4048, 0x23272c)
  grid.material.transparent = true
  grid.material.opacity = 0.55
  scene.add(grid)

  // искры сварки
  const SPARKS = 160
  const sparkPos = new Float32Array(SPARKS * 3)
  const sparkVel = new Float32Array(SPARKS * 3)
  const sparkLife = new Float32Array(SPARKS)
  const sparkGeo = new THREE.BufferGeometry()
  sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3))
  const sparks = new THREE.Points(
    sparkGeo,
    new THREE.PointsMaterial({ color: 0xffc58a, size: 0.07, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false }),
  )
  scene.add(sparks)
  let sparkCursor = 0

  function burst(point) {
    for (let n = 0; n < 18; n++) {
      const i = sparkCursor++ % SPARKS
      sparkPos.set([point.x, point.y, point.z], i * 3)
      sparkVel.set([(Math.random() - 0.5) * 4, Math.random() * 3.5, (Math.random() - 0.5) * 4], i * 3)
      sparkLife[i] = 0.6 + Math.random() * 0.5
    }
    weld.position.copy(point)
    weld.intensity = 9
  }

  let width = 0
  let height = 0
  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect()
    width = rect.width
    height = rect.height
    renderer.setSize(width, height, false)
    camera.aspect = width / Math.max(1, height)
    camera.updateProjectionMatrix()
  }
  const ro = new ResizeObserver(resize)
  ro.observe(canvas.parentElement)
  resize()

  const pointer = { x: 0, y: 0, sx: 0, sy: 0 }
  let angle = 0.75
  let running = true
  let visible = true
  let raf = 0
  const clock = new THREE.Clock()
  let elapsed = 0
  const STEP = 0.035 // секунд между балками
  const DROP = 0.55

  function tick() {
    raf = 0
    if (!running || !visible) return
    const dt = Math.min(clock.getDelta(), 0.05)
    elapsed += dt

    members.forEach((m, i) => {
      if (m.landed && m.t >= 1.6) return
      const start = 0.4 + i * STEP
      if (elapsed < start) return
      m.mesh.visible = true
      m.t = Math.min(1.6, (elapsed - start) / DROP)
      const k = Math.min(1, m.t)
      const ease = 1 - Math.pow(1 - k, 3)
      m.mesh.position.set(m.home.x, m.home.y + (1 - ease) * 3.2, m.home.z)
      if (k >= 1 && !m.landed) {
        m.landed = true
        if (i % 2 === 0) burst(m.home)
      }
      // свежая «сварка» остывает
      m.mesh.material.emissiveIntensity = m.landed ? Math.max(0, 1.4 - (m.t - 1) * 2.4) : 0.15
    })

    for (let i = 0; i < SPARKS; i++) {
      if (sparkLife[i] <= 0) {
        sparkPos[i * 3 + 1] = -100
        continue
      }
      sparkLife[i] -= dt
      sparkVel[i * 3 + 1] -= 9.8 * dt
      sparkPos[i * 3] += sparkVel[i * 3] * dt
      sparkPos[i * 3 + 1] = Math.max(0.02, sparkPos[i * 3 + 1] + sparkVel[i * 3 + 1] * dt)
      sparkPos[i * 3 + 2] += sparkVel[i * 3 + 2] * dt
    }
    sparkGeo.attributes.position.needsUpdate = true
    weld.intensity *= 0.9

    angle += dt * 0.08
    pointer.sx += (pointer.x - pointer.sx) * 0.05
    pointer.sy += (pointer.y - pointer.sy) * 0.05
    const a = angle + pointer.sx * 0.35
    const r = 21
    camera.position.set(Math.cos(a) * r, 8.5 - pointer.sy * 3, Math.sin(a) * r)
    camera.lookAt(target)

    renderer.render(scene, camera)
    raf = requestAnimationFrame(tick)
  }

  function renderStatic() {
    camera.position.set(Math.cos(angle) * 21, 8.5, Math.sin(angle) * 21)
    camera.lookAt(target)
    renderer.render(scene, camera)
  }

  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    if (visible && !raf && !reduced) {
      clock.getDelta()
      raf = requestAnimationFrame(tick)
    }
  })
  io.observe(canvas)

  if (reduced) renderStatic()
  else raf = requestAnimationFrame(tick)

  return {
    setPointer(x, y) {
      pointer.x = x
      pointer.y = y
    },
    dispose() {
      running = false
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      members.forEach((m) => m.mesh.material.dispose())
      box.dispose()
      sparkGeo.dispose()
      sparks.material.dispose()
      grid.geometry.dispose()
      grid.material.dispose()
      renderer.dispose()
    },
  }
}
