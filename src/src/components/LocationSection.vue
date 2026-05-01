<template>
  <section class="location-section" id="location">

    <!-- BACKGROUND -->
    <div class="loc-bg">
      <img src="/assets/Imagenes/Exterior/Location.png" alt="" />
      <div class="loc-bg-overlay"></div>
    </div>

    <!-- GRID: 1fr 1.5fr 2.5fr -->
    <div class="location-grid">

      <!-- COL 1: info -->
      <div class="glass-card loc-info">
        <p class="loc-label">PROYECTO</p>
        <h3 class="loc-title">Hotel Lain</h3>
        <p class="loc-subtitle">Rain Hotel</p>
        <div class="loc-rule"></div>
        <div class="loc-info-block">
          <div class="loc-info-row"><span>Direccion</span><p>Bosque de Shirakawa, Gifu, Japon</p></div>
          <div class="loc-info-row"><span>Superficie</span><p>3,800 m&#178;</p></div>
          <div class="loc-info-row"><span>Concepto</span><p>Retiro de lujo integrado a la naturaleza japonesa</p></div>
        </div>
        <div class="loc-map">
          <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d52418.48!2d136.7!3d35.9!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6003b3c9e4!2sShirakawa-go!5e0!3m2!1ses!2smx" style="border:0" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
        </div>
        <div class="loc-rule"></div>
        <p class="loc-label">AMENIDADES</p>
        <ul class="amenidades">
          <li v-for="a in amenidades" :key="a">{{ a }}</li>
        </ul>
      </div>

      <!-- COL 2: renders -->
      <div class="renders-col">
        <div v-for="r in renders" :key="r.id" class="glass-card render-card" @click="handleClick(r)">
          <div class="render-img-wrap">
            <img :src="r.src" :alt="r.label" />
            <div class="render-img-overlay"></div>
            <div class="render-shine"></div>
            <!-- 360 badge over image -->
            <div v-if="r.type === '360'" class="badge-360">
<svg class="icon-sphere" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="22" cy="22" r="15" stroke="currentColor" stroke-width="0.9"/><ellipse cx="22" cy="22" rx="15" ry="5.5" stroke="currentColor" stroke-width="0.9"/><ellipse cx="22" cy="22" rx="7" ry="15" stroke="currentColor" stroke-width="0.9"/><line x1="22" y1="7" x2="22" y2="37" stroke="currentColor" stroke-width="0.9"/><line x1="7" y1="22" x2="37" y2="22" stroke="currentColor" stroke-width="0.9"/></svg>
              <span>360&deg;</span>
            </div>
          </div>
          <div class="render-footer">
            <span class="render-label">{{ r.label }}</span>
            <button class="render-btn">{{ r.type === '360' ? 'Explorar' : 'Ver 3D' }}</button>
          </div>
        </div>
      </div>

      <!-- COL 3: 3D model -->
      <div class="glass-card model-card">
        <div class="model-wrap" ref="modelWrap">
          <canvas ref="threeCanvas"></canvas>
        </div>
        <div class="model-footer">
          <span>Modelo 3D</span>
          <span class="model-hint-txt">Arrastra para orbitar</span>
        </div>
        <div class="model-deco">&#9670;</div>
      </div>

    </div>

    <!-- OVERLAYS -->
    <Teleport to="body">
      <Transition name="ofade">
        <div class="full-overlay" v-if="show360" @click.self="close360">
          <button class="ov-close" @click="close360">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          </button>
          <div class="sphere-wrap" ref="sphereWrap">
            <canvas ref="sphereCanvas" class="sphere-canvas"></canvas>
            <p class="sphere-hint">Arrastra en cualquier direccion para explorar</p>
          </div>
        </div>
      </Transition>
      <Transition name="ofade">
        <div class="full-overlay" v-if="show3d" @click.self="close3d">
          <button class="ov-close" @click="close3d">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          </button>
          <div class="model-focus-wrap" ref="focusWrap">
            <canvas ref="focusCanvas"></canvas>
          </div>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const amenidades = [
  'Todo incluido — pension completa',
  'A 2 km de Shirakawa-go',
  'Onsen privado por suite',
  'Jardin zen y meditacion guiada',
  'Gastronomia kaiseki de autor',
  'Sala de te ceremonial',
  'Transfer privado desde aeropuerto',
]
const renders = [
  { id:'lobby',    label:'Lobby',    src:'/assets/Imagenes/Lobby/Lobby1.png',       type:'360', viewer:'/assets/Imagenes/360/360_Lobby.png' },
  { id:'interior', label:'Interior', src:'/assets/Imagenes/Interior/Interior1.png', type:'360', viewer:'/assets/Imagenes/360/360_Interior.png' },
  { id:'exterior', label:'Exterior', src:'/assets/Imagenes/Exterior/Exterior2.png', type:'3d'  },
]

/* ---- Inline model (limited navigation) ---- */
const threeCanvas = ref(null), modelWrap = ref(null)
let animId

function buildModel(canvas, container, opts) {
  const { min = 8, max = 12, rot = true, dark = false } = opts || {}
  const w = container.clientWidth || 400, h = container.clientHeight || 400
  const sc = new THREE.Scene()
  if (dark) sc.background = new THREE.Color(0x030810)
  const cam = new THREE.PerspectiveCamera(45, w / h, 0.1, 200)
  cam.position.set(0, 2, 10)
  const ren = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: !dark })
  ren.setSize(w, h)
  ren.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  ren.toneMapping = THREE.ACESFilmicToneMapping
  ren.toneMappingExposure = 1.15
  sc.add(new THREE.AmbientLight(0xc8e0f0, 1.4))
  const dl = new THREE.DirectionalLight(0xe8f4ff, 2.2)
  dl.position.set(5, 10, 7)
  sc.add(dl)
  sc.add(new THREE.DirectionalLight(0x8ab8d4, 0.9)).position.set(-5, 3, -5)
  const ctrl = new OrbitControls(cam, ren.domElement)
  ctrl.enableDamping = true
  ctrl.dampingFactor = 0.06
  ctrl.target.set(0, 0, 0)
  // Limit zoom to ~10% range
  ctrl.minDistance = min
  ctrl.maxDistance = max
  ctrl.enablePan = false
  ctrl.autoRotate = rot
  ctrl.autoRotateSpeed = 0.4
  // Limit vertical orbit to keep model presentable
  ctrl.minPolarAngle = Math.PI / 4
  ctrl.maxPolarAngle = Math.PI * 0.68
  new GLTFLoader().load('/assets/3D/Hotel.glb', gltf => {
    const m = gltf.scene
    const box = new THREE.Box3().setFromObject(m)
    const c = box.getCenter(new THREE.Vector3())
    const s = box.getSize(new THREE.Vector3())
    const s2 = 6 / Math.max(s.x, s.y, s.z)
    m.scale.setScalar(s2)
    m.position.sub(c.multiplyScalar(s2))
    ctrl.target.set(0, 0, 0)
    ctrl.update()
    sc.add(m)
  })
  const resize = () => {
    const nw = container.clientWidth || 400, nh = container.clientHeight || 400
    cam.aspect = nw / nh; cam.updateProjectionMatrix(); ren.setSize(nw, nh)
  }
  window.addEventListener('resize', resize)
  return { sc, cam, ren, ctrl }
}

onMounted(() => {
  if (threeCanvas.value && modelWrap.value) {
    const { sc, cam, ren, ctrl } = buildModel(threeCanvas.value, modelWrap.value, { rot: true })
    const loop = () => { animId = requestAnimationFrame(loop); ctrl.update(); ren.render(sc, cam) }
    loop()
  }
})
onUnmounted(() => { cancelAnimationFrame(animId); close360(); close3d() })

/* ---- 360 sphere viewer ---- */
const show360 = ref(false), sphereWrap = ref(null), sphereCanvas = ref(null)
let sAnimId, sRen = null, sCam, sScene, sDragging = false, sPX = 0, sPY = 0, sLon = 0, sLat = 0

const open360 = async (src) => {
  show360.value = true; await nextTick(); await nextTick()
  if (!sphereCanvas.value || !sphereWrap.value) return
  const w = sphereWrap.value.clientWidth || 800, h = sphereWrap.value.clientHeight || 500
  sScene = new THREE.Scene()
  sCam = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000)
  sCam.position.set(0, 0, 0.1)
  sRen = new THREE.WebGLRenderer({ canvas: sphereCanvas.value, antialias: true })
  sRen.setSize(w, h); sRen.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  const geo = new THREE.SphereGeometry(500, 64, 32); geo.scale(-1, 1, 1)
  sScene.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load(src) })))
  sLon = 0; sLat = 0
  const sLoop = () => {
    sAnimId = requestAnimationFrame(sLoop)
    sLat = Math.max(-85, Math.min(85, sLat))
    const phi = THREE.MathUtils.degToRad(90 - sLat), theta = THREE.MathUtils.degToRad(sLon)
    sCam.lookAt(500 * Math.sin(phi) * Math.cos(theta), 500 * Math.cos(phi), 500 * Math.sin(phi) * Math.sin(theta))
    sRen.render(sScene, sCam)
  }
  sLoop()
  const cv = sphereCanvas.value
  const dn = (e) => { sDragging = true; sPX = e.clientX || (e.touches?.[0]?.clientX || 0); sPY = e.clientY || (e.touches?.[0]?.clientY || 0) }
  const mv = (e) => { if (!sDragging) return; const cx = e.clientX || (e.touches?.[0]?.clientX || 0), cy = e.clientY || (e.touches?.[0]?.clientY || 0); sLon -= (cx - sPX) * 0.18; sLat += (cy - sPY) * 0.18; sPX = cx; sPY = cy }
  const up = () => { sDragging = false }
  cv.addEventListener('mousedown', dn); cv.addEventListener('mousemove', mv); cv.addEventListener('mouseup', up)
  cv.addEventListener('touchstart', dn, { passive: true }); cv.addEventListener('touchmove', mv, { passive: true }); cv.addEventListener('touchend', up)
}
const close360 = () => { show360.value = false; cancelAnimationFrame(sAnimId); if (sRen) { sRen.dispose(); sRen = null } }

/* ---- 3D focus overlay ---- */
const show3d = ref(false), focusWrap = ref(null), focusCanvas = ref(null)
let fAnimId, fRen = null
const open3d = async () => {
  show3d.value = true; await nextTick(); await nextTick()
  if (!focusCanvas.value || !focusWrap.value) return
  const { sc, cam, ren, ctrl } = buildModel(focusCanvas.value, focusWrap.value, { min: 6, max: 16, rot: false, dark: true })
  fRen = ren
  const loop = () => { fAnimId = requestAnimationFrame(loop); ctrl.update(); ren.render(sc, cam) }
  loop()
}
const close3d = () => { show3d.value = false; cancelAnimationFrame(fAnimId); if (fRen) { fRen.dispose(); fRen = null } }
const handleClick = (r) => { if (r.type === '360') open360(r.viewer); else open3d() }
</script>

<style scoped>
.location-section {
  position: relative;
  min-height: 100vh;
  padding: 80px 0;
  display: flex;
  align-items: center;
  overflow: hidden;
}

/* BG — lighter, visible */
.loc-bg { position: absolute; inset: 0; z-index: 0; }
.loc-bg img {
  width: 100%; height: 100%; object-fit: cover; object-position: center;
  filter: brightness(0.52) saturate(0.55) hue-rotate(195deg);
}
.loc-bg-overlay {
  position: absolute; inset: 0;
  background:
    linear-gradient(to bottom, rgba(2,6,14,0.65) 0%, transparent 12%, transparent 88%, rgba(2,6,14,0.65) 100%),
    linear-gradient(to right,  rgba(2,6,14,0.35) 0%, transparent 8%,  transparent 92%, rgba(2,6,14,0.35) 100%);
}

/* GRID: 1fr 1.5fr 2.5fr */
.location-grid {
  position: relative; z-index: 1;
  display: grid;
  grid-template-columns: 1fr 1.5fr 2.5fr;
  gap: 28px;
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 52px;
  align-items: stretch;
}

/* GLASS — lighter translucency */
.glass-card {
  background: rgba(4, 12, 28, 0.38);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1px solid rgba(122, 180, 212, 0.12);
}

/* ---- COL 1 ---- */
.loc-info { padding: 32px 24px; display: flex; flex-direction: column; }
.loc-label { font-family: var(--font-serif); font-size: 8.5px; font-weight: 400; letter-spacing: 0.45em; color: var(--color-accent); text-transform: uppercase; margin-bottom: 10px; }
.loc-title { font-family: var(--font-serif); font-size: clamp(1.4rem, 2vw, 2rem); font-weight: 300; letter-spacing: 0.06em; color: var(--color-white); margin-bottom: 4px; }
.loc-subtitle { font-family: var(--font-jp); font-size: 10px; font-weight: 200; letter-spacing: 0.28em; color: var(--color-accent); }
.loc-rule { width: 100%; height: 1px; background: linear-gradient(to right, rgba(122,180,212,0.2), transparent); margin: 18px 0; }
.loc-info-block { display: flex; flex-direction: column; gap: 14px; }
.loc-info-row { display: flex; flex-direction: column; gap: 3px; }
.loc-info-row span { font-family: var(--font-serif); font-size: 7.5px; font-weight: 400; letter-spacing: 0.3em; color: var(--color-accent); text-transform: uppercase; }
.loc-info-row p { font-family: var(--font-serif); font-size: 12px; font-weight: 300; color: rgba(200,225,240,0.6); line-height: 1.55; }
.loc-map { width: 100%; height: 140px; overflow: hidden; margin-top: 4px; filter: grayscale(0.88) invert(0.92) hue-rotate(192deg) brightness(0.7); opacity: 0.58; flex-shrink: 0; }
.loc-map iframe { width: 100%; height: 100%; border: 0; }
.amenidades { list-style: none; display: flex; flex-direction: column; gap: 8px; margin-top: 4px; }
.amenidades li { font-family: var(--font-serif); font-size: 11px; font-weight: 300; color: rgba(200,225,240,0.48); padding-left: 16px; position: relative; letter-spacing: 0.02em; line-height: 1.4; }
.amenidades li::before { content: '—'; position: absolute; left: 0; color: var(--color-accent2); font-size: 8px; top: 2px; }

/* ---- COL 2 ---- */
.renders-col { display: flex; flex-direction: column; gap: 20px; }
.render-card { cursor: pointer; transition: border-color 0.35s ease; overflow: hidden; display: flex; flex-direction: column; }
.render-card:hover { border-color: rgba(122,180,212,0.30); }
.render-img-wrap { position: relative; overflow: hidden; flex: 1; min-height: 0; aspect-ratio: 16/9; }
.render-img-wrap img { width: 100%; height: 100%; object-fit: cover; filter: brightness(0.78) saturate(0.75) hue-rotate(10deg); transition: transform 0.75s cubic-bezier(0.16,1,0.3,1), filter 0.5s ease; }
.render-card:hover .render-img-wrap img { transform: scale(1.04); filter: brightness(0.95) saturate(1) hue-rotate(0deg); }
.render-img-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(2,7,18,0.6) 0%, transparent 55%); }
.render-shine { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(122,180,212,0) 38%, rgba(122,180,212,0.06) 50%, rgba(122,180,212,0) 62%); transform: translateX(-100%); transition: transform 0.7s ease; }
.render-card:hover .render-shine { transform: translateX(100%); }
.render-footer { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; flex-shrink: 0; }
.render-label { font-family: var(--font-serif); font-size: 9.5px; font-weight: 400; letter-spacing: 0.4em; text-transform: uppercase; color: rgba(200,225,240,0.45); transition: color 0.3s ease; }
.render-card:hover .render-label { color: var(--color-accent); }
.render-btn { font-family: var(--font-serif); font-size: 9px; letter-spacing: 0.22em; color: var(--color-accent2); background: none; border: 1px solid rgba(74,138,176,0.28); padding: 4px 10px; cursor: pointer; transition: all 0.3s; }
.render-btn:hover { border-color: var(--color-accent); color: var(--color-accent); }

/* 360 badge inside render image */
.badge-360 {
  position: absolute;
  top: 10px; right: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  color: rgba(200,225,240,0.72);
  pointer-events: none;
  transition: color 0.3s ease;
}
.render-card:hover .badge-360 { color: var(--color-accent); }
.icon-sphere {
  width: 30px; height: 30px;
  stroke: currentColor;
  filter: drop-shadow(0 0 4px rgba(122,180,212,0.3));
}
.badge-360 span {
  font-family: var(--font-serif);
  font-size: 7px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: inherit;
}

/* ---- COL 3: 3D ---- */
.model-card { display: flex; flex-direction: column; position: relative; overflow: hidden; }
.model-wrap { flex: 1; min-height: 480px; position: relative; }
.model-wrap canvas { width: 100%; height: 100%; display: block; }
.model-footer { display: flex; justify-content: space-between; align-items: center; padding: 10px 16px; flex-shrink: 0; border-top: 1px solid rgba(122,180,212,0.08); }
.model-footer span { font-family: var(--font-serif); font-size: 9.5px; letter-spacing: 0.4em; text-transform: uppercase; color: rgba(200,225,240,0.4); }
.model-hint-txt { font-size: 8.5px; color: rgba(122,180,212,0.32); }
.model-deco { position: absolute; bottom: 44px; right: 20px; font-size: 18px; color: rgba(200,225,240,0.18); pointer-events: none; line-height: 1; }

/* OVERLAYS */
.full-overlay { position: fixed; inset: 0; z-index: 400; background: rgba(2,5,12,0.92); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; }
.ov-close { position: absolute; top: 32px; left: 36px; background: none; border: 1px solid rgba(122,180,212,0.25); color: rgba(200,225,240,0.72); width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s; z-index: 10; }
.ov-close:hover { border-color: var(--color-accent); color: var(--color-accent); }
.ov-close svg { width: 20px; height: 20px; }
.sphere-wrap { width: 84vw; max-width: 1100px; display: flex; flex-direction: column; gap: 14px; }
.sphere-canvas { width: 100%; height: 64vh; display: block; cursor: grab; border: 1px solid rgba(122,180,212,0.12); }
.sphere-canvas:active { cursor: grabbing; }
.sphere-hint { text-align: center; font-family: var(--font-serif); font-size: 10px; letter-spacing: 0.38em; color: rgba(200,225,240,0.22); text-transform: uppercase; }
.model-focus-wrap { width: 78vw; height: 78vh; border: 1px solid rgba(122,180,212,0.12); overflow: hidden; background: #030810; }
.model-focus-wrap canvas { width: 100%; height: 100%; display: block; }
.ofade-enter-active, .ofade-leave-active { transition: opacity 0.38s ease; }
.ofade-enter-from, .ofade-leave-to { opacity: 0; }
</style>
