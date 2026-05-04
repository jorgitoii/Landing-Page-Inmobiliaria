<template>
  <section class="gallery-section" id="galeria">

    <div class="mini-gallery-block" ref="galleryBlockEl">
      <div class="discovery-overlay" :style="{ opacity: galleryDiscOp }"></div>
      <div class="mg-bg">
        <img src="https://pub-c06678eb8f2c47aeaf4b1a80eef991aa.r2.dev/assets/Imagenes/Estaticas/Interior/GallerySectionBG.png" alt="Gallery" />
        <div class="mg-bg-overlay"></div>
      </div>
      <div class="mg-content">
        <p class="mg-eyebrow">Espacios · Hotel Lain</p>
        <div class="mg-grid">
          <div v-for="img in galleryGrid" :key="img.src" class="mg-cell cell-360" @click.stop="open360(img.src360)">
            <div class="mg-cell-img-wrap">
              <img :src="img.src" :alt="img.alt" />
              <div class="mg-cell-overlay"></div>
              <Transition name="galleryHintFade">
                <div class="cell-hint-overlay" v-if="showGalleryHint">
                  <div class="worldwide-wrap">
                    <video src="https://pub-c06678eb8f2c47aeaf4b1a80eef991aa.r2.dev/assets/Video/worldwide.webm" class="worldwide-vid" autoplay muted loop playsinline></video>
                  </div>
                  <span class="cell-hint-label">Imagen panorámica</span>
                </div>
              </Transition>
              <div class="badge-360">
                <svg viewBox="0 0 24 24" fill="none"><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                <span>360°</span>
              </div>
            </div>
            <div class="mg-cell-footer">
              <span class="mg-cell-caption">{{ img.caption }}</span>
            </div>
          </div>
        </div>
        <button class="mg-explore-btn" @click="openGallery">
          <span>explorar la galería</span>
          <svg viewBox="0 0 20 20" fill="none" class="mg-arrow">
            <path d="M4 10h12M12 6l4 4-4 4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Banda de blur entre Gallery y Location -->
    <div class="section-blur-band"></div>

    <!-- Visor 360 -->
    <Teleport to="body">
      <Transition name="ofade">
        <div class="full-overlay" v-if="show360" @click.self="close360">
          <button class="ov-close" @click="close360">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          </button>
          <div class="sphere-wrap" ref="sphereWrap">
            <canvas ref="sphereCanvas" class="sphere-canvas"></canvas>
            <p class="sphere-hint">Arrastra en cualquier dirección para explorar</p>
          </div>
        </div>
      </Transition>
    </Teleport>

  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as THREE from 'three'
import { lockBodyScroll, unlockBodyScroll } from '../composables/useBodyScrollLock.js'

/* ── Discovery overlay ──────────────────────────────────── */
const galleryBlockEl  = ref(null)
const galleryDiscOp   = ref(1)
const showGalleryHint = ref(true)
let   galleryHintTimer = null

function discOp(el) {
  if (!el) return 1
  const r  = el.getBoundingClientRect()
  const vh = window.innerHeight
  const p = (vh - r.top) / r.height
  return Math.max(0, 1 - p / 0.10)
}

const onDiscScroll = () => {
  galleryDiscOp.value = discOp(galleryBlockEl.value)
  if (galleryDiscOp.value === 0 && showGalleryHint.value && !galleryHintTimer) {
    galleryHintTimer = setTimeout(() => { showGalleryHint.value = false }, 3000)
  }
}

/* ── Gallery grid ───────────────────────────────────────── */
const galleryGrid = [
  { src: 'https://pub-c06678eb8f2c47aeaf4b1a80eef991aa.r2.dev/assets/Imagenes/Estaticas/Lobby/Lobby1_R.png',       alt: 'Recepción',    caption: 'Recepción',          src360: 'https://pub-c06678eb8f2c47aeaf4b1a80eef991aa.r2.dev/assets/Imagenes/360/360 Lobby.png' },
  { src: 'https://pub-c06678eb8f2c47aeaf4b1a80eef991aa.r2.dev/assets/Imagenes/Estaticas/Lobby/Lobby2_R.png',       alt: 'Lobby',        caption: 'Lobby · Principal',  src360: 'https://pub-c06678eb8f2c47aeaf4b1a80eef991aa.r2.dev/assets/Imagenes/360/360 Lobby 2.png' },
  { src: 'https://pub-c06678eb8f2c47aeaf4b1a80eef991aa.r2.dev/assets/Imagenes/Estaticas/Interior/Interior1_R.png', alt: 'Habitación',   caption: 'Suite · Habitación', src360: 'https://pub-c06678eb8f2c47aeaf4b1a80eef991aa.r2.dev/assets/Imagenes/360/360 Habitacion.png' },
  { src: 'https://pub-c06678eb8f2c47aeaf4b1a80eef991aa.r2.dev/assets/Imagenes/Estaticas/Interior/Baño_R.png',      alt: 'Baño privado', caption: 'Baño privado',       src360: 'https://pub-c06678eb8f2c47aeaf4b1a80eef991aa.r2.dev/assets/Imagenes/360/360 Baño.png' },
  { src: 'https://pub-c06678eb8f2c47aeaf4b1a80eef991aa.r2.dev/assets/Imagenes/Estaticas/Balcon_R.png',             alt: 'Balcón',       caption: 'Balcón · Exterior',  src360: 'https://pub-c06678eb8f2c47aeaf4b1a80eef991aa.r2.dev/assets/Imagenes/360/360 Balcon.png' },
  { src: 'https://pub-c06678eb8f2c47aeaf4b1a80eef991aa.r2.dev/assets/Imagenes/Estaticas/Pasillo_R.png',            alt: 'Pasillo',      caption: 'Pasillo',            src360: 'https://pub-c06678eb8f2c47aeaf4b1a80eef991aa.r2.dev/assets/Imagenes/360/360 Pasillo.png' },
]

const openGallery = () => window.dispatchEvent(new Event('open-gallery'))

/* ── Visor 360 ──────────────────────────────────────────── */
const show360 = ref(false), sphereWrap = ref(null), sphereCanvas = ref(null)
let sAnimId, sRen = null, sCam, sScene
let sDragging = false, sPX = 0, sPY = 0, sLon = 0, sLat = 0

const open360 = async src => {
  show360.value = true
  lockBodyScroll()
  await nextTick(); await nextTick()
  if (!sphereCanvas.value || !sphereWrap.value) return
  const w = sphereWrap.value.clientWidth  || 800
  const h = sphereWrap.value.clientHeight || 500
  sScene = new THREE.Scene()
  const S_FOV_BASE = 75, S_FOV_MIN = S_FOV_BASE * 0.75, S_FOV_MAX = S_FOV_BASE * 1.25
  let sFov = S_FOV_BASE
  sCam = new THREE.PerspectiveCamera(sFov, w / h, 0.1, 1000)
  sCam.position.set(0, 0, 0.1)
  sRen = new THREE.WebGLRenderer({ canvas: sphereCanvas.value, antialias: true })
  sRen.setSize(w, h)
  sRen.setPixelRatio(Math.min(window.devicePixelRatio, navigator.maxTouchPoints > 0 ? 1 : 1.5))
  sRen.toneMapping = THREE.NoToneMapping
  sRen.outputColorSpace = THREE.SRGBColorSpace
  const geo = new THREE.SphereGeometry(500, 64, 32)
  geo.scale(-1, 1, 1)
  const sMat = new THREE.MeshBasicMaterial({ side: THREE.FrontSide })
  sScene.add(new THREE.Mesh(geo, sMat))
  new THREE.TextureLoader().load(src, tex => {
    tex.colorSpace = THREE.SRGBColorSpace
    tex.generateMipmaps = false
    tex.minFilter = THREE.LinearFilter
    sMat.map = tex; sMat.needsUpdate = true
  })
  sLon = 0; sLat = 0
  const sLoop = () => {
    sAnimId = requestAnimationFrame(sLoop)
    sLat = Math.max(-85, Math.min(85, sLat))
    const phi   = THREE.MathUtils.degToRad(90 - sLat)
    const theta = THREE.MathUtils.degToRad(sLon)
    sCam.lookAt(500 * Math.sin(phi) * Math.cos(theta), 500 * Math.cos(phi), 500 * Math.sin(phi) * Math.sin(theta))
    sRen.render(sScene, sCam)
  }
  sLoop()
  const cv = sphereCanvas.value
  const dn = e => { sDragging = true; sPX = e.clientX || e.touches?.[0]?.clientX || 0; sPY = e.clientY || e.touches?.[0]?.clientY || 0 }
  const mv = e => { if (!sDragging) return; const cx = e.clientX || e.touches?.[0]?.clientX || 0; const cy = e.clientY || e.touches?.[0]?.clientY || 0; sLon -= (cx - sPX) * 0.18; sLat += (cy - sPY) * 0.18; sPX = cx; sPY = cy }
  const up = () => { sDragging = false }
  const onWheel = e => { e.preventDefault(); sFov = Math.min(S_FOV_MAX, Math.max(S_FOV_MIN, sFov + e.deltaY * 0.04)); sCam.fov = sFov; sCam.updateProjectionMatrix() }
  let sPinchDist = null
  const pinchDist = t => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY)
  const onTouchStart = e => { if (e.touches.length === 2) { sPinchDist = pinchDist(e.touches) } else dn(e) }
  const onTouchMove  = e => { if (e.touches.length === 2 && sPinchDist !== null) { const d = pinchDist(e.touches); sFov = Math.min(S_FOV_MAX, Math.max(S_FOV_MIN, sFov - (d - sPinchDist) * 0.1)); sCam.fov = sFov; sCam.updateProjectionMatrix(); sPinchDist = d } else mv(e) }
  const onTouchEnd = () => { sPinchDist = null; up() }
  cv.addEventListener('mousedown', dn); cv.addEventListener('mousemove', mv); cv.addEventListener('mouseup', up)
  cv.addEventListener('wheel', onWheel, { passive: false })
  cv.addEventListener('touchstart', onTouchStart, { passive: true })
  cv.addEventListener('touchmove',  onTouchMove,  { passive: true })
  cv.addEventListener('touchend',   onTouchEnd)
}

const close360 = () => { show360.value = false; cancelAnimationFrame(sAnimId); if (sRen) { sRen.dispose(); sRen = null }; unlockBodyScroll() }

const onKey = e => { if (e.key === 'Escape' && show360.value) close360() }

onMounted(() => {
  window.addEventListener('scroll', onDiscScroll, { passive: true })
  window.addEventListener('keydown', onKey)
})
onUnmounted(() => {
  if (galleryHintTimer) clearTimeout(galleryHintTimer)
  window.removeEventListener('scroll', onDiscScroll)
  window.removeEventListener('keydown', onKey)
  close360()
})
</script>

<style scoped>
.gallery-section {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
}

/* ── Discovery overlay ──────────────────────────────────── */
.discovery-overlay {
  position: absolute; inset: 0; z-index: 50;
  background: rgba(0,0,0,0.72);
  pointer-events: none;
  transition: opacity 0.15s linear;
}

/* ══════════════════════════════════════════════════════════
   BLOQUE — Mini-galería
   ══════════════════════════════════════════════════════════ */
.mini-gallery-block {
  position: relative;
  width: 100%;
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.mg-bg { position: absolute; inset: 0; z-index: 0; }
.mg-bg img {
  width: 100%; height: 100%;
  object-fit: cover; object-position: center bottom;
  filter: brightness(0.82);
}
.mg-bg-overlay {
  position: absolute; inset: 0;
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
  mask-image: linear-gradient(to top, rgba(0,0,0,0.80) 0%, transparent 100%);
  -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,0.80) 0%, transparent 100%);
}
.mg-content {
  position: relative; z-index: 1;
  width: 100%; max-width: 1400px;
  margin: 0 auto; padding: 80px 52px;
  display: flex; flex-direction: column; align-items: center; gap: 32px;
}
.mg-eyebrow {
  font-family: var(--font-serif); font-size: 22px; font-weight: 300;
  letter-spacing: 0.32em; text-transform: uppercase;
  color: #ffffff; opacity: 1;
}
.mg-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 25px; width: 100%;
}
.mg-cell {
  display: flex; flex-direction: column;
  border: 1px solid rgba(122,180,212,0.14);
  overflow: hidden; transition: border-color 0.35s ease;
}
.mg-cell:hover { border-color: rgba(122,180,212,0.35); }
.mg-cell-img-wrap { position: relative; aspect-ratio: 4 / 3; overflow: hidden; }
.mg-cell-img-wrap img {
  width: 100%; height: 100%; object-fit: cover;
  filter: brightness(0.68) saturate(0.75) hue-rotate(6deg);
  transition: transform 0.75s cubic-bezier(0.16,1,0.3,1), filter 0.5s ease;
}
.mg-cell:hover .mg-cell-img-wrap img { transform: scale(1.05); filter: brightness(0.88) saturate(0.95) hue-rotate(0deg); }
.mg-cell-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(2,7,18,0.45) 0%, transparent 45%);
  pointer-events: none;
}
.mg-cell-footer { padding: 9px 13px; background: rgba(4,12,28,0.60); border-top: 1px solid rgba(122,180,212,0.10); flex-shrink: 0; }
.mg-cell-caption {
  font-family: var(--font-serif); font-size: 11px; font-weight: 300;
  letter-spacing: 0.40em; text-transform: uppercase; color: rgba(200,225,240,1.00);
  transition: color 0.3s ease; display: block;
}
.mg-cell:hover .mg-cell-caption { color: rgba(200,225,240,0.85); }

/* ── 360 badge ── */
.cell-360 { cursor: pointer; }
.badge-360 {
  position: absolute; top: 10px; right: 10px; z-index: 3;
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  color: rgba(200,225,240,0.80);
  animation: pulse360 3s ease-in-out infinite; pointer-events: none;
}
.badge-360 svg { width: 18px; height: 18px; filter: drop-shadow(0 0 4px rgba(122,180,212,0.6)); }
.badge-360 span { font-family: var(--font-serif); font-size: 10px; letter-spacing: 0.25em; text-transform: uppercase; }
@keyframes pulse360 { 0%, 100% { opacity: 0.40; } 50% { opacity: 0.88; } }
.mg-cell.cell-360:hover .badge-360 { opacity: 1; animation: none; }

.mg-explore-btn {
  display: inline-flex; align-items: center; gap: 10px;
  background: rgba(4,12,28,0.60); border: 1px solid rgba(122,180,212,0.28);
  color: rgba(200,225,240,0.65); padding: 12px 32px;
  font-family: var(--font-serif); font-size: 13px; font-weight: 300;
  letter-spacing: 0.42em; text-transform: uppercase; cursor: pointer;
  transition: border-color 0.35s ease, color 0.35s ease, background 0.35s ease;
}
.mg-explore-btn:hover { border-color: var(--color-accent); color: var(--color-accent); background: rgba(122,180,212,0.06); }
.mg-arrow { width: 18px; height: 18px; opacity: 0.6; transition: transform 0.3s ease, opacity 0.3s ease; }
.mg-explore-btn:hover .mg-arrow { transform: translateX(4px); opacity: 1; }

/* ── Banda de blur ── */
.section-blur-band {
  position: relative; z-index: 10; width: 100%; height: 140px;
  margin: -70px 0; pointer-events: none;
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  mask-image: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.50) 50%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.50) 50%, transparent 100%);
}

/* ── Visor 360 overlay ── */
.full-overlay {
  position: fixed; inset: 0; z-index: 400;
  background: rgba(2,5,12,0.92); backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
}
.ov-close {
  position: absolute; top: 32px; left: 36px;
  background: none; border: 1px solid rgba(122,180,212,0.25);
  color: rgba(200,225,240,0.72); width: 44px; height: 44px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.3s; z-index: 10;
}
.ov-close:hover { border-color: var(--color-accent); color: var(--color-accent); }
.ov-close svg   { width: 20px; height: 20px; }
.sphere-wrap { width: 84vw; max-width: 1100px; display: flex; flex-direction: column; gap: 14px; }
.sphere-canvas {
  width: 100%; height: 64vh; display: block; cursor: grab;
  border: 1px solid rgba(122,180,212,0.12);
  filter: brightness(0.90) saturate(1.7) contrast(1) sepia(0.35);
}
.sphere-canvas:active { cursor: grabbing; }
.sphere-hint { text-align: center; font-family: var(--font-serif); font-size: 10px; letter-spacing: 0.38em; color: rgba(200,225,240,0.75); text-transform: uppercase; }

/* ── Per-cell hint ── */
@keyframes circularFloat {
  0%    { transform: translate(0px,   -5px); }
  12.5% { transform: translate(3.5px, -3.5px); }
  25%   { transform: translate(5px,   0px); }
  37.5% { transform: translate(3.5px,  3.5px); }
  50%   { transform: translate(0px,    5px); }
  62.5% { transform: translate(-3.5px, 3.5px); }
  75%   { transform: translate(-5px,   0px); }
  87.5% { transform: translate(-3.5px,-3.5px); }
  100%  { transform: translate(0px,   -5px); }
}
.cell-hint-overlay {
  position: absolute; inset: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;
  background: rgba(0,0,0,0.28); z-index: 3; pointer-events: none;
}
.worldwide-wrap { width: 52px; height: 52px; animation: circularFloat 3s ease-in-out infinite; filter: saturate(0) drop-shadow(0 0 6px rgba(122,180,212,0.4)); flex-shrink: 0; }
.worldwide-vid  { width: 100%; height: 100%; object-fit: contain; display: block; }
.cell-hint-label { font-family: var(--font-serif); font-size: 10px; font-weight: 300; letter-spacing: 0.32em; text-transform: uppercase; color: rgba(200,225,240,0.70); }
.galleryHintFade-enter-active, .galleryHintFade-leave-active { transition: opacity 0.6s ease; }
.galleryHintFade-enter-from,  .galleryHintFade-leave-to      { opacity: 0; }

/* ── Transitions ── */
.ofade-enter-active, .ofade-leave-active { transition: opacity 0.45s ease; }
.ofade-enter-from,   .ofade-leave-to     { opacity: 0; }

/* ── Responsive ── */
@media (max-width: 768px) {
  .mg-grid    { grid-template-columns: 1fr 1fr; gap: 8px; }
  .mg-content { padding: 32px 20px 40px; }
  .mg-eyebrow { font