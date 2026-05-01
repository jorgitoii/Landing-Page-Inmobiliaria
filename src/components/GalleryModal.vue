<template>
  <Teleport to="body">
    <Transition name="gallery-fade">
      <div class="gallery-overlay" v-if="open" @click.self="close">
        <div class="gallery-inner">
          <button class="gallery-close" @click="close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
          </button>

          <div class="gallery-header">
            <p class="gallery-label">GALERÍA</p>
            <h2 class="gallery-title">Hotel Lain</h2>
          </div>

          <div class="gallery-tabs">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              :class="['tab-btn', { active: activeTab === tab.id }]"
              @click="activeTab = tab.id"
            >{{ tab.label }}</button>
          </div>

          <div class="gallery-grid">
            <TransitionGroup name="grid-item" tag="div" class="grid-inner">
              <div
                v-for="(img, i) in currentImages"
                :key="img.src"
                class="grid-card"
                :style="{ animationDelay: `${i * 0.06}s` }"
                @click="openLightbox(img)"
              >
                <img :src="img.src" :alt="img.alt" />
                <div class="grid-overlay">
                  <span>{{ img.alt }}</span>
                </div>
              </div>
            </TransitionGroup>
          </div>
        </div>

        <!-- Lightbox -->
        <Transition name="lb-fade">
          <div class="lightbox" v-if="lightbox.open" @click="closeLightbox">
            <img :src="lightbox.src" :alt="lightbox.alt" @click.stop />
            <button class="lb-close" @click="closeLightbox">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>

  <!-- 360 viewer -->
  <Teleport to="body">
    <Transition name="ofade">
      <div class="full-overlay-360" v-if="show360" @click.self="close360">
        <button class="ov-close-360" @click="close360">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <div class="sphere-wrap-360" ref="sphereWrap">
          <canvas ref="sphereCanvas" class="sphere-canvas-360"></canvas>
          <p class="sphere-hint-360">Arrastra en cualquier dirección para explorar</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import * as THREE from 'three'

const open = ref(false)
const activeTab = ref('exterior')
const lightbox = ref({ open: false, src: '', alt: '' })

const tabs = [
  { id: 'exterior', label: 'Exterior' },
  { id: 'interior', label: 'Interior' },
  { id: 'lobby',    label: 'Lobby' },
]

const allImages = {
  exterior: [
    { src: 'https://pub-c06678eb8f2c47aeaf4b1a80eef991aa.r2.dev/assets/Imagenes/Estaticas/Exterior/Exterior2.png', alt: 'Exterior — Fachada' },
    { src: 'https://pub-c06678eb8f2c47aeaf4b1a80eef991aa.r2.dev/assets/Imagenes/Estaticas/Exterior/Exterior3.png', alt: 'Exterior — Amanecer' },
    { src: 'https://pub-c06678eb8f2c47aeaf4b1a80eef991aa.r2.dev/assets/Imagenes/Estaticas/Exterior/Exterior4.png', alt: 'Exterior — Jardín' },
    { src: 'https://pub-c06678eb8f2c47aeaf4b1a80eef991aa.r2.dev/assets/Imagenes/Estaticas/Exterior/Exterior5.png', alt: 'Exterior — Noche' },
  ],
  interior: [
    { src: 'https://pub-c06678eb8f2c47aeaf4b1a80eef991aa.r2.dev/assets/Imagenes/Estaticas/Interior/Interior1_R.png', alt: 'Interior — Habitación' },
    { src: 'https://pub-c06678eb8f2c47aeaf4b1a80eef991aa.r2.dev/assets/Imagenes/Estaticas/Interior/Interior2.png',   alt: 'Interior — Sala' },
    { src: 'https://pub-c06678eb8f2c47aeaf4b1a80eef991aa.r2.dev/assets/Imagenes/Estaticas/Interior/Interior3.png',   alt: 'Interior — Terraza' },
    { src: 'https://pub-c06678eb8f2c47aeaf4b1a80eef991aa.r2.dev/assets/Imagenes/Estaticas/Interior/Interior4.png',   alt: 'Interior — Detalle' },
    { src: 'https://pub-c06678eb8f2c47aeaf4b1a80eef991aa.r2.dev/assets/Imagenes/Estaticas/Interior/Baño_R.png',      alt: 'Interior — Baño privado' },
    { src: 'https://pub-c06678eb8f2c47aeaf4b1a80eef991aa.r2.dev/assets/Imagenes/Estaticas/Balcon_R.png',             alt: 'Interior — Balcón' },
  ],
  lobby: [
    { src: 'https://pub-c06678eb8f2c47aeaf4b1a80eef991aa.r2.dev/assets/Imagenes/Estaticas/Lobby/Lobby1_R.png', alt: 'Lobby — Recepción' },
    { src: 'https://pub-c06678eb8f2c47aeaf4b1a80eef991aa.r2.dev/assets/Imagenes/Estaticas/Lobby/Lobby2_R.png', alt: 'Lobby — Acceso' },
    { src: 'https://pub-c06678eb8f2c47aeaf4b1a80eef991aa.r2.dev/assets/Imagenes/Estaticas/Pasillo_R.png',       alt: 'Lobby — Pasillo' },
  ],
}

const currentImages = computed(() => allImages[activeTab.value] || [])

/* ── 360 helpers ───────────────────────────────────────── */
const is360Ready = (src) => /_R\.[^.]+$/.test(src)
const get360Src  = (src) => {
  const filename = src.split('/').pop()
  const base     = filename.replace(/_R(\.[^.]+)$/, '')
  const ext      = filename.split('.').pop()
  return `https://pub-c06678eb8f2c47aeaf4b1a80eef991aa.r2.dev/assets/Imagenes/360/${base}.${ext}`
}

/* ── 360 viewer ─────────────────────────────────────────── */
const show360 = ref(false), sphereWrap = ref(null), sphereCanvas = ref(null)
let sAnimId, sRen = null, sCam, sScene
let sDragging = false, sPX = 0, sPY = 0, sLon = 0, sLat = 0

const open360 = async src => {
  show360.value = true
  await nextTick(); await nextTick()
  if (!sphereCanvas.value || !sphereWrap.value) return
  const w = sphereWrap.value.clientWidth  || 800
  const h = sphereWrap.value.clientHeight || 500
  sScene = new THREE.Scene()
  sCam   = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000)
  sCam.position.set(0, 0, 0.1)
  sRen = new THREE.WebGLRenderer({ canvas: sphereCanvas.value, antialias: true })
  sRen.setSize(w, h)
  sRen.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  const geo = new THREE.SphereGeometry(500, 64, 32)
  geo.scale(-1, 1, 1)
  sScene.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load(src) })))
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
  cv.addEventListener('mousedown', dn); cv.addEventListener('mousemove', mv); cv.addEventListener('mouseup', up)
  cv.addEventListener('touchstart', dn, { passive: true }); cv.addEventListener('touchmove', mv, { passive: true }); cv.addEventListener('touchend', up)
}
const close360 = () => { show360.value = false; cancelAnimationFrame(sAnimId); if (sRen) { sRen.dispose(); sRen = null } }

const close = () => { open.value = false }
const openLightbox = (img) => { lightbox.value = { open: true, ...img } }
const closeLightbox = () => { lightbox.value.open = false }

const onGalleryEvent = () => { open.value = true }

onMounted(() => {
  window.addEventListener('open-gallery', onGalleryEvent)
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') { if (show360.value) { close360(); return }; close(); closeLightbox() } })
})
onUnmounted(() => {
  window.removeEventListener('open-gallery', onGalleryEvent)
  close360()
})
</script>

<style scoped>
.gallery-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(2,6,14,0.97);
  backdrop-filter: blur(8px);
  overflow-y: auto;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 80px 40px;
}

.gallery-inner {
  width: 100%;
  max-width: 1200px;
}

.gallery-close {
  position: fixed;
  top: 28px;
  left: 36px;
  background: none;
  border: 1px solid rgba(255,255,255,0.2);
  color: rgba(255,255,255,0.7);
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  z-index: 10;
}

.gallery-close:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.gallery-close svg { width: 20px; height: 20px; }

.gallery-header {
  text-align: center;
  margin-bottom: 48px;
}

.gallery-label {
  font-family: var(--font-serif);
  font-size: 10px;
  font-weight: 400;
  letter-spacing: 0.5em;
  color: var(--color-accent);
  margin-bottom: 12px;
}

.gallery-title {
  font-family: var(--font-serif);
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 300;
  letter-spacing: 0.1em;
  color: var(--color-white);
}

.gallery-tabs {
  display: flex;
  justify-content: center;
  gap: 0;
  margin-bottom: 48px;
  border-bottom: 1px solid rgba(122,180,212,0.08);
}

.tab-btn {
  background: none;
  border: none;
  color: rgba(255,255,255,0.90);
  font-family: var(--font-serif);
  font-size: 11px;
  font-weight: 400;
  letter-spacing: 0.35em;
  text-transform: uppercase;
  padding: 12px 32px;
  cursor: pointer;
  position: relative;
  transition: color 0.3s ease;
}

.tab-btn::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 0;
  height: 1px;
  background: var(--color-accent);
  transition: width 0.3s ease;
}

.tab-btn.active, .tab-btn:hover {
  color: var(--color-accent);
}

.tab-btn.active::after {
  width: 100%;
}

.grid-inner {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.grid-card {
  position: relative;
  overflow: hidden;
  aspect-ratio: 4/3;
  cursor: pointer;
  animation: gridIn 0.5s ease both;
}

@keyframes gridIn {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

.grid-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1), filter 0.4s ease;
  filter: brightness(0.8);
}

.grid-card:hover img {
  transform: scale(1.04);
  filter: brightness(1);
}

.grid-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%);
  display: flex;
  align-items: flex-end;
  padding: 16px;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.grid-card:hover .grid-overlay {
  opacity: 1;
}

.grid-overlay span {
  font-family: var(--font-serif);
  font-size: 12px;
  font-weight: 300;
  letter-spacing: 0.2em;
  color: rgba(255,255,255,0.85);
  text-transform: uppercase;
}

/* Lightbox */
.lightbox {
  position: fixed;
  inset: 0;
  z-index: 400;
  background: rgba(0,0,0,0.95);
  display: flex;
  align-items: center;
  justify-content: center;
}

.lightbox img {
  max-width: 85vw;
  max-height: 85vh;
  object-fit: contain;
  border: 1px solid rgba(122,180,212,0.15);
}

.lb-close {
  position: absolute;
  top: 24px;
  right: 24px;
  background: none;
  border: 1px solid rgba(255,255,255,0.2);
  color: rgba(255,255,255,0.7);
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.lb-close:hover { border-color: var(--color-accent); color: var(--color-accent); }
.lb-close svg { width: 18px; height: 18px; }

/* Transitions */
.gallery-fade-enter-active, .gallery-fade-leave-active { transition: opacity 0.5s ease; }
.gallery-fade-enter-from, .gallery-fade-leave-to { opacity: 0; }
.lb-fade-enter-active, .lb-fade-leave-active { transition: opacity 0.3s ease; }
.lb-fade-enter-from, .lb-fade-leave-to { opacity: 0; }

/* ── 360 badge ───────────────────────────────────────────── */
.badge-360 {
  position: absolute; top: 10px; right: 10px; z-index: 3;
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  color: rgba(200,225,240,0.80);
  animation: pulse360 3s ease-in-out infinite;
  pointer-events: none;
}
.badge-360 svg {
  width: 18px; height: 18px;
  filter: drop-shadow(0 0 4px rgba(122,180,212,0.6));
}
.badge-360 span {
  font-family: var(--font-serif); font-size: 7px;
  letter-spacing: 0.25em; text-transform: uppercase;
}
@keyframes pulse360 {
  0%, 100% { opacity: 0.40; }
  50%       { opacity: 0.88; }
}
.grid-card:hover .badge-360 { opacity: 1; animation: none; }

/* ── 360 overlay ─────────────────────────────────────────── */
.full-overlay-360 {
  position: fixed; inset: 0; z-index: 500;
  background: rgba(2,5,12,0.92); backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
}
.ov-close-360 {
  position: absolute; top: 32px; left: 36px;
  background: none; border: 1px solid rgba(122,180,212,0.25);
  color: rgba(200,225,240,0.72);
  width: 44px; height: 44px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.3s; z-index: 10;
}
.ov-close-360:hover { border-color: var(--color-accent); color: var(--color-accent); }
.ov-close-360 svg   { width: 20px; height: 20px; }
.sphere-wrap-360 { width: 84vw; max-width: 1100px; display: flex; flex-direction: column; gap: 14px; }
.sphere-canvas-360 { width: 100%; height: 64vh; display: block; cursor: grab; border: 1px solid rgba(122,180,212,0.12); }
.sphere-canvas-360:active { cursor: grabbing; }
.sphere-hint-360 {
  text-align: center;
  font-family: var(--font-serif); font-size: 10px;
  letter-spacing: 0.38em; color: rgba(200,225,240,0.75); text-transform: uppercase;
}
.ofade-enter-active, .ofade-leave-active { transition: opacity 0.38s ease; }
.ofade-enter-from,  .ofade-leave-to      { opacity: 0; }
</style>