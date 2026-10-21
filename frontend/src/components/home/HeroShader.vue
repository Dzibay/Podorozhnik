<script setup>
/**
 * Живой градиент первого экрана на чистом WebGL: шум с «доменным
 * искажением» в цветах бренда, мягко тянется к курсору. Если WebGL
 * недоступен — остаётся CSS-градиент подложки.
 * В спокойном режиме (телефоны, слабые ПК) рисуется один неподвижный кадр.
 */
import { onMounted, onUnmounted, ref } from 'vue'
import { calmMotion } from '../../utils/perf'

const canvas = ref(null)
const failed = ref(false)

const vertex = `
attribute vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }
`

const fragment = `
precision highp float;
uniform vec2 uRes;
uniform vec2 uMouse;
uniform float uTime;

vec3 paper = vec3(0.922, 0.914, 0.894);
vec3 red = vec3(0.878, 0.275, 0.122);
vec3 orange = vec3(0.973, 0.639, 0.282);
vec3 pink = vec3(1.0, 0.537, 0.663);

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = uv;
  p.x *= uRes.x / uRes.y;
  float t = uTime * 0.045;

  vec2 m = uMouse;
  m.x *= uRes.x / uRes.y;

  vec2 q = vec2(fbm(p * 1.6 + t), fbm(p * 1.6 - t + 4.3));
  vec2 r = vec2(fbm(p * 1.4 + 3.0 * q + vec2(1.7, 9.2) + t * 1.4),
                fbm(p * 1.4 + 3.0 * q + vec2(8.3, 2.8) - t));
  float f = fbm(p * 1.2 + 2.6 * r);

  // Пятно цвета: тяготеет к правому нижнему углу и к курсору
  float anchor = smoothstep(1.25, 0.0, distance(uv, vec2(0.82, 0.18)));
  float cursor = smoothstep(0.55, 0.0, distance(p, m));
  float mass = clamp(anchor * 0.95 + cursor * 0.55 + (f - 0.45) * 1.3, 0.0, 1.0);

  vec3 warm = mix(red, orange, smoothstep(0.25, 0.85, r.x));
  warm = mix(warm, pink, smoothstep(0.45, 0.95, q.y) * 0.75);

  vec3 col = mix(paper, warm, smoothstep(0.18, 0.88, mass));

  // Зерно
  col += (hash(gl_FragCoord.xy + fract(uTime) * 100.0) - 0.5) * 0.045;

  gl_FragColor = vec4(col, 1.0);
}
`

let gl
let program
let frame = 0
let running = false
let observer
const mouse = { x: 0.7, y: 0.35, tx: 0.7, ty: 0.35 }
const start = performance.now()

function compile(type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader))
  return shader
}

function resize() {
  const el = canvas.value
  if (!el) return
  // Шум мягкий — рисуем в пониженном разрешении, это в разы дешевле
  const scale = Math.min(window.devicePixelRatio || 1, 1.5) * 0.5
  el.width = Math.max(1, Math.round(el.clientWidth * scale))
  el.height = Math.max(1, Math.round(el.clientHeight * scale))
  gl.viewport(0, 0, el.width, el.height)
  // смена размера очищает холст — неподвижный кадр нужно перерисовать
  if (!running || calmMotion()) draw()
}

function draw() {
  mouse.x += (mouse.tx - mouse.x) * 0.04
  mouse.y += (mouse.ty - mouse.y) * 0.04
  const time = calmMotion() ? 12 : (performance.now() - start) / 1000
  gl.uniform2f(gl.getUniformLocation(program, 'uRes'), canvas.value.width, canvas.value.height)
  gl.uniform2f(gl.getUniformLocation(program, 'uMouse'), mouse.x, mouse.y)
  gl.uniform1f(gl.getUniformLocation(program, 'uTime'), time)
  gl.drawArrays(gl.TRIANGLES, 0, 3)
}

function loop() {
  draw()
  if (running && !calmMotion()) frame = requestAnimationFrame(loop)
}

function play() {
  if (running) return
  running = true
  loop()
}

function pause() {
  running = false
  cancelAnimationFrame(frame)
}

function onPointer(event) {
  const rect = canvas.value.getBoundingClientRect()
  mouse.tx = (event.clientX - rect.left) / rect.width
  mouse.ty = 1 - (event.clientY - rect.top) / rect.height
}

onMounted(() => {
  try {
    gl = canvas.value.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' })
    if (!gl) throw new Error('no webgl')
    program = gl.createProgram()
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vertex))
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragment))
    gl.linkProgram(program)
    gl.useProgram(program)

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(program, 'p')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

    resize()
    window.addEventListener('resize', resize)
    if (!calmMotion()) window.addEventListener('pointermove', onPointer, { passive: true })

    observer = new IntersectionObserver(([entry]) => (entry.isIntersecting ? play() : pause()))
    observer.observe(canvas.value)
    draw()
  } catch {
    failed.value = true
  }
})

onUnmounted(() => {
  pause()
  observer?.disconnect()
  window.removeEventListener('resize', resize)
  window.removeEventListener('pointermove', onPointer)
  gl?.getExtension('WEBGL_lose_context')?.loseContext()
})
</script>

<template>
  <div class="hero-shader" :class="{ 'hero-shader--fallback': failed }" aria-hidden="true">
    <canvas v-show="!failed" ref="canvas" />
  </div>
</template>
