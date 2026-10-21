import {
  BoxGeometry,
  Clock,
  Color,
  CylinderGeometry,
  DirectionalLight,
  Fog,
  GridHelper,
  HemisphereLight,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  PointLight,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three'

/**
 * Общий движок 3D-сцен нишевых страниц: сцена «собирается» из деталей,
 * которые по очереди прилетают на место, вспыхивают акцентом и остывают.
 * После сборки сцена живёт своей жизнью (update) и камера медленно облетает её.
 *
 * Сцена описывает только детали и свою анимацию — свет, камера, пауза
 * вне экрана и уборка памяти здесь.
 */
export function mountScene(canvas, { accent, bg, reduced, build }) {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(0x000000, 0)

  const scene = new Scene()
  const camera = new PerspectiveCamera(32, 1, 0.1, 120)
  const accentColor = new Color(accent)

  scene.add(new HemisphereLight(0xe8ecf2, 0x16181c, 1.05))
  const sun = new DirectionalLight(0xfff1e0, 2.1)
  sun.position.set(8, 14, 7)
  scene.add(sun)
  // контровой свет в цвет акцента обводит силуэт со спины
  const rim = new DirectionalLight(accentColor, 1.5)
  rim.position.set(-10, 6, -12)
  scene.add(rim)
  const flash = new PointLight(accentColor, 0, 7, 1.6)
  scene.add(flash)

  const disposables = []
  const parts = []
  const geo = {
    box: new BoxGeometry(1, 1, 1),
    cyl: new CylinderGeometry(0.5, 0.5, 1, 24),
  }
  disposables.push(geo.box, geo.cyl)

  /** Материал с подсветкой «свежей» детали; все материалы убираются при dispose */
  function material(color, opts = {}) {
    const m = new MeshStandardMaterial({
      color: new Color(color),
      metalness: 0.2,
      roughness: 0.6,
      emissive: accentColor,
      emissiveIntensity: 0,
      ...opts,
    })
    disposables.push(m)
    return m
  }

  /**
   * Деталь сборки.
   * from — откуда прилетает (смещение от места), order — очередь,
   * glow — вспыхнуть ли при установке, flash — дать ли вспышку света.
   */
  function part(geometry, mat, { pos, size = [1, 1, 1], rot = [0, 0, 0], from = [0, 3, 0], order = 0, glow = true, flash: withFlash = false, parent = scene } = {}) {
    const mesh = new Mesh(geometry, mat)
    mesh.scale.set(...size)
    mesh.rotation.set(...rot)
    const home = new Vector3(...pos)
    mesh.position.copy(home)
    mesh.visible = reduced
    parent.add(mesh)
    parts.push({ mesh, home, from: new Vector3(...from), order, glow, flash: withFlash, landed: reduced, t: reduced ? 2 : 0 })
    return mesh
  }

  function grid(size = 40, opacity = 0.5) {
    const g = new GridHelper(size, size, 0x3a4048, 0x23272c)
    g.material.transparent = true
    g.material.opacity = opacity
    scene.add(g)
    disposables.push(g.geometry, g.material)
    return g
  }

  const api = { scene, camera, geo, material, part, grid, accentColor, disposables, Vector3 }
  const config = build(api)
  const {
    target = new Vector3(0, 2, 0),
    radius = 20,
    height = 8,
    angle: startAngle = 0.7,
    spin = 0.07,
    sway = 0,
    step = 0.04,
    drop = 0.6,
    fog = [24, 50],
    update,
  } = config

  scene.fog = new Fog(new Color(bg), fog[0], fog[1])
  parts.sort((a, b) => a.order - b.order)
  const assembled = 0.4 + parts.length * step + drop

  let width = 0
  let height_ = 0
  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect()
    width = rect.width
    height_ = rect.height
    renderer.setSize(width, height_, false)
    camera.aspect = width / Math.max(1, height_)
    // на узком экране отъезжаем, чтобы сцена целиком влезла по ширине
    camera.userData.fit = camera.aspect < 1 ? 1 + (1 - camera.aspect) * 0.9 : 1
    camera.updateProjectionMatrix()
  }
  // в спокойном режиме кадр один, поэтому после изменения размера перерисовываем его
  const ro = new ResizeObserver(() => {
    resize()
    if (reduced) renderStatic()
  })
  ro.observe(canvas.parentElement)
  resize()

  const pointer = { x: 0, y: 0, sx: 0, sy: 0 }
  let angle = startAngle
  let running = true
  let visible = true
  let raf = 0
  const clock = new Clock()
  let elapsed = reduced ? assembled + 3 : 0

  function placeCamera() {
    const a = angle + pointer.sx * 0.35
    const r = radius * (camera.userData.fit || 1)
    camera.position.set(target.x + Math.cos(a) * r, height - pointer.sy * 3, target.z + Math.sin(a) * r)
    camera.lookAt(target)
  }

  function tick() {
    raf = 0
    if (!running || !visible) return
    const dt = Math.min(clock.getDelta(), 0.05)
    elapsed += dt

    parts.forEach((p, i) => {
      if (p.landed && p.t >= 2) return
      const start = 0.4 + i * step
      if (elapsed < start) return
      p.mesh.visible = true
      p.t = Math.min(2, (elapsed - start) / drop)
      const k = Math.min(1, p.t)
      const ease = 1 - Math.pow(1 - k, 3)
      p.mesh.position.copy(p.home).addScaledVector(p.from, 1 - ease)
      if (k >= 1 && !p.landed) {
        p.landed = true
        if (p.flash) {
          flash.position.copy(p.home)
          flash.intensity = 8
        }
      }
      if (p.glow) p.mesh.material.emissiveIntensity = p.landed ? Math.max(0, 1.1 - (p.t - 1) * 2.2) : 0.12
    })
    flash.intensity *= 0.9

    update?.({ elapsed, dt, done: elapsed > assembled, assembled })

    // sway — камера качается вокруг стартового угла, а не облетает сцену (у кухни есть стены)
    angle = sway ? startAngle + Math.sin(elapsed * spin) * sway : angle + dt * spin
    pointer.sx += (pointer.x - pointer.sx) * 0.05
    pointer.sy += (pointer.y - pointer.sy) * 0.05
    placeCamera()
    renderer.render(scene, camera)
    raf = requestAnimationFrame(tick)
  }

  /** Неподвижный кадр уже собранной сцены — для спокойного режима */
  function renderStatic() {
    parts.forEach((p) => {
      p.mesh.visible = true
      p.mesh.position.copy(p.home)
      if (p.glow) p.mesh.material.emissiveIntensity = 0
    })
    update?.({ elapsed, dt: 0, done: true, assembled })
    placeCamera()
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
      disposables.forEach((d) => d.dispose())
      renderer.dispose()
    },
  }
}
