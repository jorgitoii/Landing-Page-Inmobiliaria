<template>
  <section class="location-section" id="location">

    <!-- ══════════════════════════════════════════════
         BLOQUE 1 — Mini-galería
         ══════════════════════════════════════════════ -->
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
              <!-- Hint per-celda: worldwide.gif + leyenda, desaparece tras 3 s -->
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

    <!-- Capa de blur entre secciones: 0% arriba → 50% centro → 0% abajo -->
    <div class="section-blur-band"></div>

    <!-- ══════════════════════════════════════════════
         BLOQUE 2 — Info de ubicación + Modelo 3D
         ══════════════════════════════════════════════ -->
    <div class="loc-block" ref="ubicBlockEl">
      <div class="discovery-overlay" :style="{ opacity: ubicDiscOp }"></div>
      <div class="loc-bg">
        <img src="https://pub-c06678eb8f2c47aeaf4b1a80eef991aa.r2.dev/assets/Imagenes/Estaticas/Exterior/Location.png" alt="" />
        <div class="loc-bg-overlay"></div>
      </div>

      <div class="loc-bottom-grid">

        <!-- COL izquierda: ficha + mapa + puntos de interés -->
        <div class="glass-card loc-info">

          <!-- Fila superior: título izquierda | metadata derecha -->
          <div class="loc-header-row">
            <div class="loc-header-left">
              <h3 class="loc-title">森</h3>
              <div class="loc-subtitle-row">
                <p class="loc-subtitle">Boutique</p>
                <p class="loc-amenities">
                  <span>★★★★★</span><span class="amen-dot"> · </span>
                  <span>Pet Friendly</span><span class="amen-dot"> · </span>
                  <span>Spa &amp; Onsen</span><span class="amen-dot"> · </span>
                  <span>8 Suites</span>
                </p>
              </div>
            </div>
            <div class="loc-header-right">
              <div class="loc-info-row"><span>Concepto</span><p>Retiro de lujo integrado a la naturaleza japonesa</p></div>
              <div class="loc-info-row"><span>Superficie</span><p>3,800 m&#178;</p></div>
            </div>
          </div>

          <div class="loc-rule"></div>

          <!-- Puntos de interés -->
          <p class="loc-address">Bosque de Shirakawa, Gifu, Japón</p>
          <p class="loc-poi-label">PUNTOS DE INTERÉS</p>
          <div class="poi-list">
            <button
              v-for="(route, idx) in ROUTE_DATA"
              :key="idx"
              class="poi-btn"
              :class="{
                'poi-btn-active':  locActiveRoute === idx,
                'poi-auto-pulse':  autoHighlight && idx === 0,
                'poi-auto-dim':    autoHighlight && idx !== 0,
              }"
              :style="{ background: poiGradient(route.color) }"
              @click="locActivateRoute(idx)"
            >
              <span class="poi-name">{{ route.name }}</span>
              <img :src="route.icon" class="poi-icon" :alt="route.name" />
            </button>
          </div>

          <div class="loc-rule"></div>

          <!-- Mapa -->
          <div class="loc-map-wrap">
            <div class="loc-map" ref="mapEl"></div>
            <!-- Touch gate: tap to unlock map interaction on mobile -->
            <Transition name="map-gate-fade">
              <div
                v-if="!mapActivated"
                class="map-touch-gate"
                @click.stop="activateMap"
                @touchstart.stop.prevent="activateMap"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                  <circle cx="12" cy="9" r="2.5"/>
                </svg>
                <span>Toca para interactuar</span>
              </div>
            </Transition>
            <button class="map-expand-btn" @click="openMapFull" title="Ver mapa completo">
              <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 8V3h5M17 8V3h-5M3 12v5h5M17 12v5h-5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>

        </div>

        <!-- COL derecha: modelo 3D con rutas de luz -->
        <div class="glass-card model-card">
          <div class="model-wrap" ref="modelWrap">
            <canvas ref="threeCanvas"></canvas>

            <!-- Scroll strips: 28px transparent edges that allow vertical scroll on mobile -->
            <div class="canvas-scroll-strip canvas-scroll-strip--left"></div>
            <div class="canvas-scroll-strip canvas-scroll-strip--right"></div>

            <!-- Brújula clásica — rota con la cámara -->
            <div class="compass-wrap">
              <svg class="compass-svg" viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg">
                <!-- Anillo exterior estático -->
                <circle cx="36" cy="36" r="32" fill="none" stroke="rgba(122,180,212,0.20)" stroke-width="1"/>
                <circle cx="36" cy="36" r="28" fill="rgba(6,14,30,0.82)" stroke="rgba(122,180,212,0.12)" stroke-width="0.5"/>
                <!-- Grupo interior rotante -->
                <g :style="{ transform: `rotate(${compassAngle}deg)`, transformOrigin: '36px 36px' }">
                  <!-- Aguja Norte -->
                  <polygon points="36,10 39.2,34 36,38 32.8,34" fill="#c8e0f0" opacity="0.92"/>
                  <!-- Aguja Sur -->
                  <polygon points="36,62 39.2,38 36,34 32.8,38" fill="rgba(122,180,212,0.28)"/>
                  <!-- Punto central -->
                  <circle cx="36" cy="36" r="2.8" fill="#7ab4d4"/>
                  <!-- Ticks cardinales -->
                  <line x1="36" y1="4"  x2="36" y2="9"  stroke="rgba(122,180,212,0.50)" stroke-width="1"/>
                  <line x1="36" y1="63" x2="36" y2="68" stroke="rgba(122,180,212,0.25)" stroke-width="0.8"/>
                  <line x1="4"  y1="36" x2="9"  y2="36" stroke="rgba(122,180,212,0.25)" stroke-width="0.8"/>
                  <line x1="63" y1="36" x2="68" y2="36" stroke="rgba(122,180,212,0.25)" stroke-width="0.8"/>
                  <!-- Letras cardinales -->
                  <text x="36" y="7.5" text-anchor="middle" font-size="8" fill="rgba(200,224,240,0.90)" font-family="Georgia,serif">N</text>
                  <text x="36" y="69"  text-anchor="middle" font-size="7" fill="rgba(122,180,212,0.40)" font-family="Georgia,serif">S</text>
                  <text x="4.5" y="39" text-anchor="middle" font-size="7" fill="rgba(122,180,212,0.40)" font-family="Georgia,serif">O</text>
                  <text x="67.5" y="39" text-anchor="middle" font-size="7" fill="rgba(122,180,212,0.40)" font-family="Georgia,serif">E</text>
                </g>
              </svg>
            </div>

          </div>

          <div class="model-footer">
            <span class="model-hint-txt">
              <template v-if="modelProgress === -1">Error al cargar</template>
              <template v-else-if="modelProgress > 0 && modelProgress < 100">Cargando · {{ modelProgress }}%</template>
              <template v-else>Arrastra para orbitar</template>
            </span>
          </div>
          <div class="model-deco">&#9670;</div>
        </div>

      </div>

      <!-- Scroll hint -->
      <div class="loc-scroll-hint">
        <span class="loc-scroll-line"></span>
        <span class="loc-scroll-label">Scroll</span>
      </div>
    </div>

    <!-- Overlays 360 / 3D (se mantienen por si se reutilizan) -->
    <Teleport to="body">
      <!-- Mapa expandido -->
      <Transition name="ofade">
        <div class="full-overlay" v-if="showMapFull" @click.self="closeMapFull">
          <button class="ov-close" @click="closeMapFull">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          </button>
          <div class="map-full-inner" ref="mapFullEl"></div>
        </div>
      </Transition>

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
import { GLTFLoader }    from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader }   from 'three/examples/jsm/loaders/DRACOLoader.js'
import { EffectComposer }  from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass }      from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { ShaderPass }      from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { glbBlobUrl }      from '../composables/useModelPreloader.js'

/* ── Discovery overlays (se remueven al entrar 10% en cada bloque) ─ */
const galleryBlockEl   = ref(null)
const ubicBlockEl      = ref(null)
const galleryDiscOp    = ref(1)
const ubicDiscOp       = ref(1)
const showGalleryHint  = ref(true)
let   galleryHintTimer = null

// ── Auto-highlight de Templo al llegar al 50% de la sección ──
const autoHighlight     = ref(false)   // true = pulso activo
let   autoHighlightDone = false        // true = usuario ya hizo clic, no vuelve a activarse

function discOp (el) {
  if (!el) return 1
  const r  = el.getBoundingClientRect()
  const vh = window.innerHeight
  const p = (vh - r.top) / r.height
  return Math.max(0, 1 - p / 0.10)
}

const onDiscScroll = () => {
  galleryDiscOp.value = discOp(galleryBlockEl.value)
  ubicDiscOp.value    = discOp(ubicBlockEl.value)
  // Cuando la discovery overlay desaparece, iniciar cuenta atrás del hint
  if (galleryDiscOp.value === 0 && showGalleryHint.value && !galleryHintTimer) {
    galleryHintTimer = setTimeout(() => { showGalleryHint.value = false }, 3000)
  }
  // Activar pulso de Templo al llegar al 50% de la sección de ubicación
  if (!autoHighlightDone && ubicBlockEl.value) {
    const r  = ubicBlockEl.value.getBoundingClientRect()
    const vh = window.innerHeight
    const progress = (vh - r.top) / r.height
    autoHighlight.value = progress >= 0.50
  }
}

window.addEventListener('scroll', onDiscScroll, { passive: true })

/* ── Gallery grid — todas las imágenes 360 Ready (3×2) ── */
const galleryGrid = [
  { src: 'https://pub-c06678eb8f2c47aeaf4b1a80eef991aa.r2.dev/assets/Imagenes/Estaticas/Lobby/Lobby1_R.png',       alt: 'Recepción',       caption: 'Recepción',         src360: 'https://pub-c06678eb8f2c47aeaf4b1a80eef991aa.r2.dev/assets/Imagenes/360/360 Lobby.png' },
  { src: 'https://pub-c06678eb8f2c47aeaf4b1a80eef991aa.r2.dev/assets/Imagenes/Estaticas/Lobby/Lobby2_R.png',       alt: 'Lobby',           caption: 'Lobby · Principal', src360: 'https://pub-c06678eb8f2c47aeaf4b1a80eef991aa.r2.dev/assets/Imagenes/360/360 Lobby 2.png' },
  { src: 'https://pub-c06678eb8f2c47aeaf4b1a80eef991aa.r2.dev/assets/Imagenes/Estaticas/Interior/Interior1_R.png', alt: 'Habitación',      caption: 'Suite · Habitación',src360: 'https://pub-c06678eb8f2c47aeaf4b1a80eef991aa.r2.dev/assets/Imagenes/360/360 Habitacion.png' },
  { src: 'https://pub-c06678eb8f2c47aeaf4b1a80eef991aa.r2.dev/assets/Imagenes/Estaticas/Interior/Baño_R.png',      alt: 'Baño privado',    caption: 'Baño privado',      src360: 'https://pub-c06678eb8f2c47aeaf4b1a80eef991aa.r2.dev/assets/Imagenes/360/360 Baño.png' },
  { src: 'https://pub-c06678eb8f2c47aeaf4b1a80eef991aa.r2.dev/assets/Imagenes/Estaticas/Balcon_R.png',             alt: 'Balcón',          caption: 'Balcón · Exterior', src360: 'https://pub-c06678eb8f2c47aeaf4b1a80eef991aa.r2.dev/assets/Imagenes/360/360 Balcon.png' },
  { src: 'https://pub-c06678eb8f2c47aeaf4b1a80eef991aa.r2.dev/assets/Imagenes/Estaticas/Pasillo_R.png',            alt: 'Pasillo',         caption: 'Pasillo',           src360: 'https://pub-c06678eb8f2c47aeaf4b1a80eef991aa.r2.dev/assets/Imagenes/360/360 Pasillo.png' },
]

const openGallery = () => window.dispatchEvent(new Event('open-gallery'))

/* ── Amenidades con íconos SVG ───────────────────────────── */
const amenidades = [
  {
    label: 'Todo incluido — pension completa',
    icon: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 7h14M5 7V5a1 1 0 011-1h8a1 1 0 011 1v2M7 14l1 2h4l1-2M5 7l1 9h8l1-9" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
  },
  {
    label: 'A 2 km de Shirakawa-go',
    icon: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 2C7.24 2 5 4.24 5 7c0 4 5 11 5 11s5-7 5-11c0-2.76-2.24-5-5-5z" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="10" cy="7" r="1.5" stroke="currentColor" stroke-width="1"/>
    </svg>`,
  },
  {
    label: 'Onsen privado por suite',
    icon: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 14c0-2.21 1.79-4 4-4s4 1.79 4 4H6z" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
      <path d="M4 14h12M7 10V8M10 10V7M13 10V8" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
    </svg>`,
  },
  {
    label: 'Jardin zen y meditacion guiada',
    icon: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 17V9M10 9C10 9 7 6 4 7c3 0 6 2 6 2zM10 9C10 9 13 6 16 7c-3 0-6 2-6 2z" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="10" cy="7" r="1.5" stroke="currentColor" stroke-width="1"/>
    </svg>`,
  },
  {
    label: 'Gastronomia kaiseki de autor',
    icon: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 3v6c0 1.66 1.34 3 3 3s3-1.34 3-3V3M7 9h6M10 15v2" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
  },
  {
    label: 'Sala de te ceremonial',
    icon: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 8h8l-1 7H6L5 8z" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M13 10h1a2 2 0 010 4h-1M5 8h-.5a1 1 0 000 2H5M8 6V4M10 6V3M12 6V4" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
    </svg>`,
  },
  {
    label: 'Transfer privado desde aeropuerto',
    icon: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 12l2-4h10l2 4H3z" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M3 12v2h14v-2M6 14v1M14 14v1" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
      <circle cx="6" cy="15" r="1" stroke="currentColor" stroke-width="1"/>
      <circle cx="14" cy="15" r="1" stroke="currentColor" stroke-width="1"/>
    </svg>`,
  },
]

/* ── 3D Model ────────────────────────────────────────────── */
const threeCanvas  = ref(null), modelWrap = ref(null)
const mapEl        = ref(null)
const compassAngle = ref(0)   // grados — actualizado en el loop de Three.js
let animId, leafletMap = null

// ── Map touch gate (mobile scroll competition) ───────────
const mapActivated = ref(false)
let   mapDeactivateTimer = null
function activateMap () {
  mapActivated.value = true
  clearTimeout(mapDeactivateTimer)
  mapDeactivateTimer = setTimeout(() => { mapActivated.value = false }, 6000)
}

// ── Rutas de luz — constantes y estado reactivo ───────────
const BAKED_DIST = 7.474
const BAKED_EL   = 43 * Math.PI / 180    // elevación 43°
const BAKED_AZ   = -39.41 * Math.PI / 180 // azimuth -39.41°

const PG_LOC = { flow: true, flowSpeed: 0.02, size: 0.030, scatter: 0.240, count: 440 }
const BLOOM_CFG = { strength: 3.40, radius: 0.25, threshold: 0.19 }

const ROUTE_DATA = [
  { name: 'Templo',     color: '#7ab4d4', icon: 'https://pub-c06678eb8f2c47aeaf4b1a80eef991aa.r2.dev/assets/Imagenes/Iconos/Ubicaci%C3%B3n/TemploSF.webp',           points: [
    {x:-0.2356,y:0.5,z:0.2741},{x:0.109,y:0.7615,z:-1},
    {x:0.9505,y:0.6733,z:-0.9507},{x:1.5092,y:0.7571,z:-1.9791},{x:2.491,y:0.9121,z:-2.5981}
  ]},
  { name: 'Sala de té', color: '#e8d9b8', icon: 'https://pub-c06678eb8f2c47aeaf4b1a80eef991aa.r2.dev/assets/Imagenes/Iconos/Ubicaci%C3%B3n/Sala%20de%20te%20SF.webp',  points: [
    {x:0.2433,y:0.476,z:0.2921},{x:1.2076,y:0.8752,z:0.0844},
    {x:1.7301,y:0.7119,z:-0.0394},{x:2.6181,y:0.85,z:0.138}
  ]},
  { name: 'Restaurante',color: '#a8c8dc', icon: 'https://pub-c06678eb8f2c47aeaf4b1a80eef991aa.r2.dev/assets/Imagenes/Iconos/Ubicaci%C3%B3n/Gastronomia%20SF.webp',     points: [
    {x:-2.8822,y:0.5698,z:-2.5601},{x:-2.4646,y:0.6807,z:-1.1559},
    {x:-1.2301,y:0.7834,z:-0.7303},{x:-0.4663,y:0.4471,z:0.2519}
  ]},
  { name: 'Jardín Zen', color: '#d4a07a', icon: 'https://pub-c06678eb8f2c47aeaf4b1a80eef991aa.r2.dev/assets/Imagenes/Iconos/Ubicaci%C3%B3n/Jardin%20zen%20SF.webp',    points: [
    {x:2.5928,y:0.8112,z:2.2197},{x:1.6656,y:0.4955,z:2.1105},
    {x:1.185,y:0.9646,z:1.5378},{x:0.0952,y:0.3108,z:0.5}
  ]},
  { name: 'Onsen',      color: '#c8e0f0', icon: 'https://pub-c06678eb8f2c47aeaf4b1a80eef991aa.r2.dev/assets/Imagenes/Iconos/Ubicaci%C3%B3n/Onsen%20SF.webp',           points: [
    {x:-2.3183,y:0.8062,z:2.5084},{x:-1.5594,y:0.8757,z:2.1819},
    {x:-1.2641,y:0.8405,z:1.2927},{x:-0.3369,y:0.531,z:0.752}
  ]},
]

const locActiveRoute = ref(-1)   // -1=nada, 0-4=ruta, -2=todas
let _locActivateRoute    = null  // seteadas por buildLocationScene
let _locActivateAllRoutes = null
let _locPendingAdd        = null  // callback cuando el modelo está listo
let _locDispose           = null  // limpieza al desmontar
let _locControls          = null  // referencia a OrbitControls para controlar autoRotate

function locActivateRoute    (i) {
  if (_locActivateRoute) _locActivateRoute(i)
  // Al clickear Templo (botón parpadeante), arrancar la auto-rotación
  if (i === 0 && _locControls && !_locControls.autoRotate) {
    _locControls.autoRotate = true
  }
  // Desactivar auto-highlight al primer clic del usuario
  autoHighlight.value  = false
  autoHighlightDone    = true
}
function locActivateAllRoutes ()  { if (_locActivateAllRoutes) _locActivateAllRoutes() }

function hexToRgb (hex) {
  const h = hex.replace('#','')
  return `${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)}`
}
function poiGradient (color) {
  const rgb = hexToRgb(color)
  return `linear-gradient(to right, rgba(${rgb},0.32) 0%, rgba(${rgb},0.16) 42%, rgba(${rgb},0) 100%)`
}

/* ── Leaflet map (OpenStreetMap + CartoDB Dark) ──────────── */
function loadScript (src) {
  return new Promise((res, rej) => {
    if (document.querySelector(`script[src="${src}"]`)) { res(); return }
    const s = document.createElement('script'); s.src = src
    s.onload = res; s.onerror = rej; document.head.appendChild(s)
  })
}
async function initMap () {
  if (!mapEl.value) return
  // CSS de Leaflet
  if (!document.querySelector('link[href*="leaflet"]')) {
    const l = document.createElement('link')
    l.rel = 'stylesheet'
    l.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(l)
  }
  await loadScript('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js')
  const L = window.L
  // Shirakawa-go, Gifu, Japón
  const lat = 36.2567, lng = 136.9056
  leafletMap = L.map(mapEl.value, {
    center: [lat, lng], zoom: 14,
    zoomControl: false, attributionControl: false,
  })
  // Tiles Voyager (reconocibles, legibles) — filtro CSS le da el tono oscuro del proyecto
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
  }).addTo(leafletMap)
  // Zoom en esquina inferior derecha
  L.control.zoom({ position: 'bottomright' }).addTo(leafletMap)
  // Marcador personalizado
  const icon = L.divIcon({
    html: `<div style="position:relative;width:32px;height:32px;">
      <div style="
        position:absolute;inset:0;border-radius:50%;
        border:2px solid rgba(122,180,212,0.7);
        animation:locPing 1.8s ease-out infinite;
      "></div>
      <div style="
        position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
        width:12px;height:12px;border-radius:50%;
        background:#7ab4d4;
        border:2px solid rgba(220,240,255,0.9);
        box-shadow:0 0 8px rgba(122,180,212,0.9),0 0 20px rgba(122,180,212,0.5);
      "></div>
    </div>`,
    className: '', iconSize: [32,32], iconAnchor: [16,16],
  })
  L.marker([lat, lng], { icon })
    .addTo(leafletMap)
    .bindPopup('<b style="color:#7ab4d4;font-family:serif">Hotel Lain</b><br><span style="font-size:11px;color:#8ab">Bosque de Shirakawa, Gifu</span>')
}

// ─────────────────────────────────────────────────────────────────────────────
//  Sprite helper
// ─────────────────────────────────────────────────────────────────────────────
function makeCircleSprite () {
  const S = 64, cv = document.createElement('canvas')
  cv.width = cv.height = S
  const ctx = cv.getContext('2d')
  ctx.fillStyle = 'white'
  ctx.beginPath(); ctx.arc(S/2, S/2, S/2-1, 0, Math.PI*2); ctx.fill()
  return new THREE.CanvasTexture(cv)
}

// ─────────────────────────────────────────────────────────────────────────────
//  LocSplineObj — tubo + partículas sin editor UI
// ─────────────────────────────────────────────────────────────────────────────
class LocSplineObj {
  constructor (data, scene, sprite) {
    this.color  = data.color
    this.group  = new THREE.Group()
    this.points = data.points.map(p => new THREE.Vector3(p.x, p.y, p.z))
    this.tubeMesh       = null
    this.particlePoints = null
    this._curve         = null
    this._tVals         = null
    this._offsets       = null
    this._sprite        = sprite
    this.group.visible  = false
    scene.add(this.group)
    this._build()
  }

  _build () {
    const curve = new THREE.CatmullRomCurve3(this.points)
    this._curve = curve
    const col = new THREE.Color(this.color)

    // Tubo
    const tgeo = new THREE.TubeGeometry(curve, 80, 0.018, 8, false)
    const tmat = new THREE.MeshStandardMaterial({
      color: col, emissive: col, emissiveIntensity: 0,
      roughness: 0.4, metalness: 0.1
    })
    this.tubeMesh = new THREE.Mesh(tgeo, tmat)
    this.group.add(this.tubeMesh)

    // Partículas
    const N  = PG_LOC.count
    const sc = PG_LOC.scatter
    this._tVals   = new Float32Array(N)
    this._offsets = new Float32Array(N * 3)
    const pos     = new Float32Array(N * 3)
    for (let i = 0; i < N; i++) {
      this._tVals[i]        = Math.random()
      this._offsets[i*3]   = (Math.random()-0.5)*sc
      this._offsets[i*3+1] = (Math.random()-0.5)*sc
      this._offsets[i*3+2] = (Math.random()-0.5)*sc
      const pt = curve.getPoint(this._tVals[i])
      pos[i*3]   = pt.x + this._offsets[i*3]
      pos[i*3+1] = pt.y + this._offsets[i*3+1]
      pos[i*3+2] = pt.z + this._offsets[i*3+2]
    }
    const pgeo = new THREE.BufferGeometry()
    pgeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    const pmat = new THREE.PointsMaterial({
      color: col, size: PG_LOC.size,
      map: this._sprite, alphaTest: 0,
      sizeAttenuation: true, transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthTest: false, depthWrite: false
    })
    this.particlePoints = new THREE.Points(pgeo, pmat)
    this.particlePoints.renderOrder = 999
    this.group.add(this.particlePoints)
  }

  tickParticles (dt) {
    if (!PG_LOC.flow || !this.particlePoints || !this._curve) return
    const N   = this._tVals.length
    const spd = PG_LOC.flowSpeed
    for (let i = 0; i < N; i++) this._tVals[i] = (this._tVals[i] + spd * dt) % 1
    const pa = this.particlePoints.geometry.attributes.position
    for (let i = 0; i < N; i++) {
      const pt = this._curve.getPoint(this._tVals[i])
      pa.setXYZ(i, pt.x + this._offsets[i*3], pt.y + this._offsets[i*3+1], pt.z + this._offsets[i*3+2])
    }
    pa.needsUpdate = true
  }

  dispose () {
    this.tubeMesh?.geometry.dispose(); this.tubeMesh?.material.dispose()
    this.particlePoints?.geometry.dispose(); this.particlePoints?.material.dispose()
    this.group.parent?.remove(this.group)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  buildLocationScene — visor 3D de producción con bloom selectivo
// ─────────────────────────────────────────────────────────────────────────────
function buildLocationScene (canvas, container) {
  const W = container.clientWidth  || 400
  const H = container.clientHeight || 400
  const _isMob = navigator.maxTouchPoints > 0

  // Renderer — alpha:true para que el canvas sea transparente
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setSize(W, H)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, _isMob ? 1 : 1.5))
  renderer.toneMapping        = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.7
  renderer.shadowMap.enabled  = false
  renderer.setClearColor(0x000000, 0)   // limpiar a transparente cada frame

  // Escena + cámara (sin background → el glass-card se ve detrás)
  const scene  = new THREE.Scene()

  const camera = new THREE.PerspectiveCamera(40, W / H, 0.01, 2000)
  camera.position.set(
    BAKED_DIST * Math.cos(BAKED_EL) * Math.sin(BAKED_AZ),
    BAKED_DIST * Math.sin(BAKED_EL),
    BAKED_DIST * Math.cos(BAKED_EL) * Math.cos(BAKED_AZ)
  )

  // Luces — valores bakeados de la config elegida
  scene.add(new THREE.AmbientLight(0xc8e0f0, 3.9))
  const sunLight = new THREE.DirectionalLight(0xe8f4ff, 8.0)
  sunLight.position.set(5, 10, 7); scene.add(sunLight)
  // Luz de cámara — sigue la posición de la cámara cada frame
  const camLightObj = new THREE.DirectionalLight(0xe8f4ff, 3.8)
  scene.add(camLightObj)

  // Órbita
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping    = true
  controls.dampingFactor    = 0.01
  controls.enablePan        = false
  controls.autoRotate       = false   // arranca pausado hasta clic en Templo
  controls.autoRotateSpeed  = 0.12
  _locControls = controls
  controls.minPolarAngle    = 47 * Math.PI / 180   // 90° - 43° elevación → fijado
  controls.maxPolarAngle    = 47 * Math.PI / 180
  controls.target.set(0.005, -0.0013, 0.0215)
  controls.update()

  // Splines
  const sprite   = makeCircleSprite()
  const locSplines = ROUTE_DATA.map(d => new LocSplineObj(d, scene, sprite))

  // ── Selective bloom ───────────────────────────────────────
  const _bm    = new THREE.MeshBasicMaterial({ color: 0x000000 })
  const _saved = new Map()
  let _locModel = null

  const _darkify = () => {
    if (_locModel) _locModel.traverse(obj => {
      if (obj.isMesh) { _saved.set(obj, obj.material); obj.material = _bm }
    })
  }
  const _restore = () => { _saved.forEach((m, o) => { o.material = m }); _saved.clear() }

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(W, H),
    BLOOM_CFG.strength, BLOOM_CFG.radius, BLOOM_CFG.threshold
  )
  const bloomComposer = new EffectComposer(renderer)
  bloomComposer.renderToScreen = false
  bloomComposer.addPass(new RenderPass(scene, camera))
  bloomComposer.addPass(bloomPass)
  // Móvil: bloom a media resolución → ahorra ~75% de VRAM en framebuffers
  if (_isMob) bloomComposer.setSize(Math.floor(W / 2), Math.floor(H / 2))

  const mixPass = new ShaderPass(new THREE.ShaderMaterial({
    uniforms: {
      baseTexture:  { value: null },
      bloomTexture: { value: bloomComposer.renderTarget2.texture }
    },
    vertexShader:   `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: `uniform sampler2D baseTexture,bloomTexture; varying vec2 vUv; void main(){ gl_FragColor=texture2D(baseTexture,vUv)+texture2D(bloomTexture,vUv); }`
  }), 'baseTexture')
  mixPass.needsSwap = true

  const finalComposer = new EffectComposer(renderer)
  finalComposer.addPass(new RenderPass(scene, camera))
  finalComposer.addPass(mixPass)

  // ── Sistema de fade ───────────────────────────────────────
  const FADE_SPD = 2.5
  let _actIdx = -1
  const _fades = []
  const _cancel  = sp => { const i = _fades.findIndex(f => f.sp===sp); if(i>=0) _fades.splice(i,1) }
  const _fadeIn  = sp => {
    _cancel(sp); sp.group.visible = true
    // Igual que editor con particleOn:true → tubo oculto, solo partículas brillan
    if (sp.tubeMesh) sp.tubeMesh.visible = false
    if (sp.particlePoints?.material) sp.particlePoints.material.opacity = 0
    _fades.push({ sp, dir: 'in' })
  }
  const _fadeOut = sp => { _cancel(sp); _fades.push({ sp, dir: 'out' }) }

  // Funciones expuestas al template a través del módulo
  _locActivateRoute = i => {
    if (_actIdx >= 0 && _actIdx !== i) _fadeOut(locSplines[_actIdx])
    else if (_actIdx === -2) locSplines.forEach((s, j) => { if (j !== i) _fadeOut(s) })
    _actIdx = i; locActiveRoute.value = i; _fadeIn(locSplines[i])
  }
  _locActivateAllRoutes = () => {
    _actIdx = -2; locActiveRoute.value = -2; locSplines.forEach(s => _fadeIn(s))
  }

  // ── Carga del modelo ──────────────────────────────────────
  const _addToLoc = model => {
    const box    = new THREE.Box3().setFromObject(model)
    const center = box.getCenter(new THREE.Vector3())
    const size   = box.getSize(new THREE.Vector3())
    const sc     = 6 / Math.max(size.x, size.y, size.z)
    model.scale.setScalar(sc)
    model.position.sub(center.multiplyScalar(sc))   // centrar en 0,0,0
    _locModel = model
    scene.add(model)
    controls.minDistance = BAKED_DIST * 0.1
    controls.maxDistance = BAKED_DIST * 1.01
    controls.update()
  }

  if (_cachedModel) _addToLoc(_cachedModel.clone())
  else _locPendingAdd = m => _addToLoc(m.clone())

  // ── Resize ────────────────────────────────────────────────
  const _onResize = () => {
    const nW = container.clientWidth || 400, nH = container.clientHeight || 400
    camera.aspect = nW / nH; camera.updateProjectionMatrix()
    renderer.setSize(nW, nH); bloomComposer.setSize(nW, nH); finalComposer.setSize(nW, nH)
  }
  window.addEventListener('resize', _onResize)

  // ── Pausa cuando la sección está fuera del viewport ──────
  let _renderPaused = false
  const _visIO = new IntersectionObserver(([e]) => { _renderPaused = !e.isIntersecting }, { threshold: 0 })
  _visIO.observe(canvas)

  // ── Loop principal ────────────────────────────────────────
  const clock = new THREE.Clock()
  ;(function loop () {
    animId = requestAnimationFrame(loop)
    if (_renderPaused) return
    const dt = clock.getDelta()

    locSplines.forEach(sp => sp.tickParticles(dt))

    for (let i = _fades.length - 1; i >= 0; i--) {
      const { sp, dir } = _fades[i]
      const step = FADE_SPD * dt
      let done = true
      if (dir === 'out') {
        // Solo fade de partículas (tubo ya estaba oculto)
        if (sp.particlePoints?.material?.opacity > 0) {
          sp.particlePoints.material.opacity = Math.max(0, sp.particlePoints.material.opacity - step)
          if (sp.particlePoints.material.opacity > 0) done = false
        }
        if (done) {
          sp.group.visible = false
          if (sp.tubeMesh) sp.tubeMesh.visible = true  // restaurar para próxima activación
          _fades.splice(i, 1)
        }
      } else {
        // Solo partículas → bloom convierte los puntos en glow neon difuso
        const tP = 0.92
        if (sp.particlePoints?.material && sp.particlePoints.material.opacity < tP) {
          sp.particlePoints.material.opacity = Math.min(tP, sp.particlePoints.material.opacity + step)
          if (sp.particlePoints.material.opacity < tP) done = false
        }
        if (done) _fades.splice(i, 1)
      }
    }

    controls.update()
    compassAngle.value = -(controls.getAzimuthalAngle() * 180 / Math.PI)

    // Luz de cámara — sigue la posición de la cámara cada frame
    camLightObj.position.copy(camera.position)
    camLightObj.target.position.copy(controls.target)
    camLightObj.target.updateMatrixWorld()

    _darkify(); bloomComposer.render(); _restore(); finalComposer.render()
  })()

  return () => {
    cancelAnimationFrame(animId)
    _visIO.disconnect()
    window.removeEventListener('resize', _onResize)
    locSplines.forEach(sp => sp.dispose())
    sprite.dispose()
    _bm.dispose()
    bloomComposer.dispose(); finalComposer.dispose(); renderer.dispose()
  }
}

function buildScene (canvas, container, opts) {
  const { autoRotate = true, dark = false } = opts || {}
  const W = container.clientWidth  || 400
  const H = container.clientHeight || 400

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: !dark })
  renderer.setSize(W, H)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, navigator.maxTouchPoints > 0 ? 1 : 1.5))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.2

  const scene = new THREE.Scene()
  if (dark) scene.background = new THREE.Color(0x030810)

  const camera = new THREE.PerspectiveCamera(40, W / H, 0.01, 2000)
  camera.position.set(0, 0, 10)

  scene.add(new THREE.AmbientLight(0xc8e0f0, 1.4))
  const sun = new THREE.DirectionalLight(0xe8f4ff, 2.2)
  sun.position.set(5, 10, 7); scene.add(sun)
  const fill = new THREE.DirectionalLight(0x8ab8d4, 0.9)
  fill.position.set(-5, 3, -5); scene.add(fill)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping   = true
  controls.dampingFactor   = 0.07
  controls.enablePan       = false
  controls.autoRotate      = autoRotate
  controls.autoRotateSpeed = 0.5
  controls.minPolarAngle   = Math.PI * 0.18
  controls.maxPolarAngle   = Math.PI * 0.76

  // Si el modelo ya está en caché, añadirlo de inmediato
  if (_cachedModel) {
    _addModelToScene(_cachedModel.clone(), scene, camera, controls)
  } else {
    // Registrar escena pendiente para cuando termine la carga
    _pendingScenes.push({ scene, camera, controls })
  }

  const onResize = () => {
    const nW = container.clientWidth || 400
    const nH = container.clientHeight || 400
    camera.aspect = nW / nH
    camera.updateProjectionMatrix()
    renderer.setSize(nW, nH)
  }
  window.addEventListener('resize', onResize)
  return { scene, camera, renderer, controls }
}

/* ── Caché y carga anticipada del modelo (~200 MB) ──────────
   Estrategia:
   1. IntersectionObserver dispara la descarga cuando la sección
      está a 1 viewport de distancia (rootMargin: "100%").
   2. El modelo se guarda en _cachedModel al terminar.
   3. buildScene() lo añade directo si ya está en caché,
      o se registra en _pendingScenes y se inyecta al completar.
   4. modelProgress (0-100) alimenta el texto del footer.
   ─────────────────────────────────────────────────────────── */
let _cachedModel   = null
let _pendingScenes = []   // { scene, camera, controls }[]
const modelProgress = ref(0)   // 0-100, -1 = error

function _addModelToScene (model, scene, camera, controls) {
  const box    = new THREE.Box3().setFromObject(model)
  const center = box.getCenter(new THREE.Vector3())
  const size   = box.getSize(new THREE.Vector3())
  model.scale.setScalar(6 / Math.max(size.x, size.y, size.z))
  // Recalcular tras escala
  const box2    = new THREE.Box3().setFromObject(model)
  const center2 = box2.getCenter(new THREE.Vector3())
  const size2   = box2.getSize(new THREE.Vector3())
  controls.target.copy(center2)
  const footprint = Math.sqrt(size2.x * size2.x + size2.z * size2.z)
  const dist      = footprint * 1.2 + size2.y * 0.5
  camera.position.set(center2.x, center2.y + size2.y * 0.08, center2.z + dist)
  controls.minDistance = dist * 0.925
  controls.maxDistance = dist * 1.075
  scene.add(model)
  controls.update()
}

function _loadModel () {
  if (_cachedModel || modelProgress.value > 0) return   // ya cargando o cargado
  modelProgress.value = 1   // inicia
  // Use preloaded blob if already downloaded, otherwise fall back to CDN
  const url = glbBlobUrl.value
    ? glbBlobUrl.value
    : 'https://pub-c06678eb8f2c47aeaf4b1a80eef991aa.r2.dev/assets/3D/Maqueta_opt.glb'
  const dracoLoader = new DRACOLoader()
  dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/')
  const gltfLoader = new GLTFLoader()
  gltfLoader.setDRACOLoader(dracoLoader)
  gltfLoader.load(
    url,
    gltf => {
      // Liberar el blob de memoria — Three.js ya tiene la geometría en sus propios buffers
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url)
        glbBlobUrl.value = null
      }
      _cachedModel = gltf.scene
      modelProgress.value = 100
      // Inyectar en todas las escenas que estaban esperando
      _pendingScenes.forEach(({ scene, camera, controls }) =>
        _addModelToScene(_cachedModel.clone(), scene, camera, controls)
      )
      _pendingScenes = []
      // Inyectar en la escena de ubicación si estaba pendiente
      if (_locPendingAdd) { _locPendingAdd(_cachedModel); _locPendingAdd = null }
    },
    xhr => {
      if (xhr.total) modelProgress.value = Math.round(xhr.loaded / xhr.total * 99) + 1
    },
    () => { modelProgress.value = -1 }
  )
}

onMounted(() => {
  // Arrancar visor 3D con bloom + partículas
  if (threeCanvas.value && modelWrap.value) {
    _locDispose = buildLocationScene(threeCanvas.value, modelWrap.value)
  }
  initMap()

  // IntersectionObserver: precargar cuando la sección esté a 1 viewport
  const io = new IntersectionObserver(
    entries => { if (entries[0].isIntersecting) { _loadModel(); io.disconnect() } },
    { rootMargin: '100% 0px' }
  )
  if (ubicBlockEl.value) io.observe(ubicBlockEl.value)
})

onUnmounted(() => {
  if (_locDispose) { _locDispose(); _locDispose = null }
  else cancelAnimationFrame(animId)
  close360(); close3d()
  if (leafletMap) { leafletMap.remove(); leafletMap = null }
  if (galleryHintTimer) clearTimeout(galleryHintTimer)
  window.removeEventListener('scroll', onDiscScroll)
})

/* ── Mapa expandido ─────────────────────────────────────── */
const showMapFull = ref(false)
const mapFullEl   = ref(null)
let   leafletMapFull = null

const openMapFull = async () => {
  showMapFull.value = true
  await nextTick(); await nextTick()
  if (!mapFullEl.value || leafletMapFull) return
  const L = window.L
  if (!L) return
  const lat = 36.2567, lng = 136.9056
  leafletMapFull = L.map(mapFullEl.value, {
    center: [lat, lng], zoom: 14,
    zoomControl: true, attributionControl: false,
  })
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(leafletMapFull)
  const icon = L.divIcon({
    html: `<div style="position:relative;width:32px;height:32px;">
      <div style="position:absolute;inset:0;border-radius:50%;border:2px solid rgba(122,180,212,0.7);animation:locPing 1.8s ease-out infinite;"></div>
      <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:12px;height:12px;border-radius:50%;background:#7ab4d4;border:2px solid rgba(220,240,255,0.9);box-shadow:0 0 8px rgba(122,180,212,0.9)"></div>
    </div>`,
    className: '', iconSize: [32,32], iconAnchor: [16,16],
  })
  L.marker([lat, lng], { icon }).addTo(leafletMapFull)
    .bindPopup('<b style="color:#7ab4d4;font-family:serif">Hotel Lain</b><br><span style="font-size:11px;color:#8ab">Bosque de Shirakawa, Gifu</span>')
  setTimeout(() => leafletMapFull.invalidateSize(), 120)
}

const closeMapFull = () => {
  showMapFull.value = false
  if (leafletMapFull) { leafletMapFull.remove(); leafletMapFull = null }
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
  const S_FOV_BASE = 75
  const S_FOV_MIN  = S_FOV_BASE * 0.75   // zoom +25%
  const S_FOV_MAX  = S_FOV_BASE * 1.25   // zoom -25%
  let   sFov = S_FOV_BASE
  sCam   = new THREE.PerspectiveCamera(sFov, w / h, 0.1, 1000)
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
    sMat.map = tex
    sMat.needsUpdate = true
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
  // Zoom rueda de mouse
  const onWheel = e => {
    e.preventDefault()
    sFov = Math.min(S_FOV_MAX, Math.max(S_FOV_MIN, sFov + e.deltaY * 0.04))
    sCam.fov = sFov
    sCam.updateProjectionMatrix()
  }
  // Zoom pinch táctil
  let sPinchDist = null
  const pinchDist = t => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY)
  const onTouchStart = e => { if (e.touches.length === 2) { sPinchDist = pinchDist(e.touches) } else dn(e) }
  const onTouchMove  = e => {
    if (e.touches.length === 2 && sPinchDist !== null) {
      const d = pinchDist(e.touches)
      sFov = Math.min(S_FOV_MAX, Math.max(S_FOV_MIN, sFov - (d - sPinchDist) * 0.1))
      sCam.fov = sFov; sCam.updateProjectionMatrix()
      sPinchDist = d
    } else mv(e)
  }
  const onTouchEnd = e => { sPinchDist = null; up() }
  cv.addEventListener('mousedown', dn); cv.addEventListener('mousemove', mv); cv.addEventListener('mouseup', up)
  cv.addEventListener('wheel', onWheel, { passive: false })
  cv.addEventListener('touchstart', onTouchStart, { passive: true })
  cv.addEventListener('touchmove',  onTouchMove,  { passive: true })
  cv.addEventListener('touchend',   onTouchEnd)
}
const close360 = () => { show360.value = false; cancelAnimationFrame(sAnimId); if (sRen) { sRen.dispose(); sRen = null } }

/* ── 3D focus overlay ────────────────────────────────────── */
const show3d = ref(false), focusWrap = ref(null), focusCanvas = ref(null)
let fAnimId, fRen = null
const open3d = async () => {
  show3d.value = true
  await nextTick(); await nextTick()
  if (!focusCanvas.value || !focusWrap.value) return
  const { scene, camera, renderer, controls } = buildScene(focusCanvas.value, focusWrap.value, { autoRotate: false, dark: true })
  controls.minDistance = 0; controls.maxDistance = Infinity
  fRen = renderer
  const loop = () => { fAnimId = requestAnimationFrame(loop); controls.update(); renderer.render(scene, camera) }
  loop()
}
const close3d = () => { show3d.value = false; cancelAnimationFrame(fAnimId); if (fRen) { fRen.dispose(); fRen = null } }
</script>

<style scoped>

/* ── Discovery overlay (compartido por ambos bloques) ───── */
.discovery-overlay {
  position: absolute; inset: 0; z-index: 50;
  background: rgba(0,0,0,0.72);
  pointer-events: none;
  transition: opacity 0.15s linear;
}

/* ══════════════════════════════════════════════════════════
   SECCIÓN CONTENEDORA
   ══════════════════════════════════════════════════════════ */
.location-section {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
}

/* ══════════════════════════════════════════════════════════
   BLOQUE 1 — Mini-galería
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

.mg-bg {
  position: absolute; inset: 0; z-index: 0;
}
.mg-bg img {
  width: 100%; height: 100%;
  object-fit: cover; object-position: center bottom;
  filter: brightness(0.82);   /* -18% brillo */
}
/* Degradado de desenfoque: arriba 0% blur → abajo 80% blur */
.mg-bg-overlay {
  position: absolute; inset: 0;
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
  mask-image: linear-gradient(to top,
    rgba(0,0,0,0.80) 0%,   /* borde inferior → 80% blur */
    transparent 100%        /* borde superior → 0% blur */
  );
  -webkit-mask-image: linear-gradient(to top,
    rgba(0,0,0,0.80) 0%,
    transparent 100%
  );
}

.mg-content {
  position: relative; z-index: 1;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 80px 52px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
}

.mg-eyebrow {
  font-family: var(--font-serif);
  font-size: 12px; font-weight: 300;
  letter-spacing: 0.52em; text-transform: uppercase;
  color: var(--color-accent); opacity: 0.75;
}

/* 3×2 image grid */
.mg-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 25px;
  width: 100%;
}

/* Card con marco — imagen arriba, footer con caption abajo */
.mg-cell {
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(122,180,212,0.14);
  overflow: hidden;
  transition: border-color 0.35s ease;
}
.mg-cell:hover { border-color: rgba(122,180,212,0.35); }

.mg-cell-img-wrap {
  position: relative;
  aspect-ratio: 4 / 3;
  overflow: hidden;
}
.mg-cell-img-wrap img {
  width: 100%; height: 100%;
  object-fit: cover;
  filter: brightness(0.68) saturate(0.75) hue-rotate(6deg);
  transition: transform 0.75s cubic-bezier(0.16,1,0.3,1), filter 0.5s ease;
}
.mg-cell:hover .mg-cell-img-wrap img {
  transform: scale(1.05);
  filter: brightness(0.88) saturate(0.95) hue-rotate(0deg);
}
.mg-cell-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(2,7,18,0.45) 0%, transparent 45%);
  pointer-events: none;
}

/* Footer / marco inferior con caption */
.mg-cell-footer {
  padding: 9px 13px;
  background: rgba(4,12,28,0.60);
  border-top: 1px solid rgba(122,180,212,0.10);
  flex-shrink: 0;
}
.mg-cell-caption {
  font-family: var(--font-serif); font-size: 11px; font-weight: 300;
  letter-spacing: 0.40em; text-transform: uppercase;
  color: rgba(200,225,240,1.00);
  transition: color 0.3s ease;
  display: block;
}
.mg-cell:hover .mg-cell-caption { color: rgba(200,225,240,0.85); }

/* ── 360 badge ──────────────────────────────────────────── */
.cell-360 { cursor: pointer; }
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
  font-family: var(--font-serif); font-size: 10px;
  letter-spacing: 0.25em; text-transform: uppercase;
}
@keyframes pulse360 {
  0%, 100% { opacity: 0.40; }
  50%       { opacity: 0.88; }
}
.mg-cell.cell-360:hover .badge-360 { opacity: 1; animation: none; }

.mg-explore-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: none;
  border: 1px solid rgba(122,180,212,0.28);
  color: rgba(200,225,240,0.65);
  padding: 12px 32px;
  font-family: var(--font-serif);
  font-size: 13px; font-weight: 300;
  letter-spacing: 0.42em; text-transform: uppercase;
  cursor: pointer;
  transition: border-color 0.35s ease, color 0.35s ease, background 0.35s ease;
}
.mg-explore-btn:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
  background: rgba(122,180,212,0.06);
}
.mg-arrow {
  width: 18px; height: 18px;
  opacity: 0.6;
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.mg-explore-btn:hover .mg-arrow {
  transform: translateX(4px);
  opacity: 1;
}

/* ── Banda de blur entre Gallery y Ubication ─────────────
   Se solapa sobre ambas secciones con margin negativo.
   Máscara: 0% blur arriba → 50% blur en centro → 0% blur abajo */
.section-blur-band {
  position: relative;
  z-index: 10;
  width: 100%;
  height: 140px;
  margin: -70px 0;   /* se mete 70px dentro de cada sección */
  pointer-events: none;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  mask-image: linear-gradient(to bottom,
    transparent 0%,
    rgba(0,0,0,0.50) 50%,
    transparent 100%
  );
  -webkit-mask-image: linear-gradient(to bottom,
    transparent 0%,
    rgba(0,0,0,0.50) 50%,
    transparent 100%
  );
}

/* ══════════════════════════════════════════════════════════
   BLOQUE 2 — Ubicación + Modelo 3D
   ══════════════════════════════════════════════════════════ */
.loc-block {
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: stretch;   /* stretch para que el grid ocupe el 100% de ancho */
  justify-content: center;
  padding: 70px 0 55px;
  overflow: hidden;
}

.loc-bg { position: absolute; inset: 0; z-index: 0; }
.loc-bg img {
  width: 100%; height: 100%; object-fit: cover; object-position: center top;
  filter: brightness(0.82);   /* -18% brillo */
}
.loc-bg-overlay {
  position: absolute; inset: 0;
  background:
    /* Sin gradiente superior — solo fade en borde inferior y vignette lateral */
    linear-gradient(to bottom, transparent 86%, rgba(2,6,14,0.45) 100%),
    linear-gradient(to right,  rgba(2,6,14,0.20) 0%, transparent 8%, transparent 92%, rgba(2,6,14,0.20) 100%);
}

/* 2-col grid: info (35%) + 3D (65%) */
.loc-bottom-grid {
  position: relative; z-index: 1;
  display: grid;
  grid-template-columns: 35fr 65fr;
  gap: 24px;
  width: 100%;
  box-sizing: border-box;
  padding: 0 28px;
  align-self: stretch;   /* anula el align-items:center del padre */
  align-items: stretch;
}

/* Glass */
.glass-card {
  background: rgba(4, 10, 24, 0.72);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(122, 180, 212, 0.12);
}

/* ── INFO card ─────────────────────────────────────────── */
.loc-info {
  padding: 24px 20px 12px 20px;
  display: flex; flex-direction: column;
}
.loc-label {
  font-family: var(--font-serif); font-size: 16px; font-weight: 400;
  letter-spacing: 0.45em; color: var(--color-accent); text-transform: uppercase;
  margin-bottom: 6px;
}
.loc-title {
  font-family: var(--font-jp); font-size: clamp(2.97rem, 4.32vw, 4.86rem);
  font-weight: 300; letter-spacing: 0.06em; color: var(--color-white);
  margin-bottom: 4px; line-height: 1.1;
}
.loc-subtitle-row {
  display: flex; flex-direction: column; gap: 5px;
}
.loc-subtitle {
  font-family: var(--font-jp); font-size: 17.5px; font-weight: 200;
  letter-spacing: 0.28em; color: var(--color-accent);
}
.loc-amenities {
  font-family: var(--font-serif); font-size: 11px; font-weight: 300;
  letter-spacing: 0.15em; color: rgba(200,225,240,0.55);
  display: flex; flex-wrap: wrap; align-items: center; gap: 0;
  max-width: 100%; min-width: 0;
}
.amen-dot { opacity: 0.5; }
.loc-rule {
  width: 100%; height: 1px;
  background: linear-gradient(to right, rgba(122,180,212,0.2), transparent);
  margin: 8px 0;
}
.loc-info-block { display: flex; flex-direction: column; gap: 12px; }
.loc-info-row   { display: flex; flex-direction: column; gap: 3px; }
.loc-info-row span {
  font-family: var(--font-serif); font-size: 15px; font-weight: 400;
  letter-spacing: 0.3em; color: var(--color-accent); text-transform: uppercase;
}
.loc-info-row p {
  font-family: var(--font-serif); font-size: 19px; font-weight: 300;
  color: rgba(200,225,240,1.00); line-height: 1.55;
}
.loc-map-wrap {
  position: relative;
  flex-shrink: 0;
}
.loc-map {
  width: 100%; height: 220px; overflow: hidden; margin-top: 0;
  filter: sepia(0.50) invert(1.00) brightness(1.80) saturate(1.40) hue-rotate(303deg) contrast(0.80);
}
/* ── Map touch gate ──────────────────────────────────────── */
.map-touch-gate {
  position: absolute; inset: 0; z-index: 5;
  background: rgba(6, 14, 30, 0.52);
  backdrop-filter: blur(2px);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 8px;
  cursor: pointer;
}
.map-touch-gate svg {
  width: 22px; height: 22px;
  color: rgba(122, 180, 212, 0.80);
  filter: drop-shadow(0 0 6px rgba(122,180,212,0.4));
}
.map-touch-gate span {
  font-family: var(--font-serif);
  font-size: 9px; letter-spacing: 0.40em;
  text-transform: uppercase;
  color: rgba(200, 225, 240, 0.65);
}
.map-gate-fade-enter-active, .map-gate-fade-leave-active { transition: opacity 0.3s ease; }
.map-gate-fade-enter-from,   .map-gate-fade-leave-to     { opacity: 0; }

/* ── Canvas scroll strips (3D model) ─────────────────────── */
.canvas-scroll-strip {
  position: absolute; top: 0; bottom: 0;
  width: 28px; z-index: 4;
  touch-action: pan-y;
  pointer-events: auto;
}
.canvas-scroll-strip--left  { left: 0; }
.canvas-scroll-strip--right { right: 0; }

.map-expand-btn {
  position: absolute;
  top: 8px; right: 8px;
  width: 30px; height: 30px;
  background: rgba(6,14,30,0.72);
  border: 1px solid rgba(122,180,212,0.22);
  color: rgba(200,225,240,0.65);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  backdrop-filter: blur(8px);
  transition: border-color 0.2s ease, color 0.2s ease;
  z-index: 10;
}
.map-expand-btn:hover { border-color: rgba(122,180,212,0.55); color: rgba(200,225,240,1); }
.map-expand-btn svg { width: 14px; height: 14px; }
.map-full-inner {
  width: 78vw; height: 78vh;
  border: 1px solid rgba(122,180,212,0.15);
  overflow: hidden;
  filter: sepia(0.50) invert(1.00) brightness(1.80) saturate(1.40) hue-rotate(303deg) contrast(0.80);
}

@keyframes locPing {
  0%   { transform: scale(0.6); opacity: 0.9; }
  100% { transform: scale(2.2); opacity: 0; }
}

/* Overrides de Leaflet para integración visual */
:deep(.leaflet-container) {
  background: #080d18;
  font-family: var(--font-serif);
}
:deep(.leaflet-control-zoom a) {
  background: rgba(6,16,36,0.85) !important;
  border-color: rgba(122,180,212,0.2) !important;
  color: rgba(200,225,240,0.6) !important;
  font-size: 14px;
}
:deep(.leaflet-control-zoom a:hover) {
  background: rgba(122,180,212,0.12) !important;
  color: var(--color-accent) !important;
}
:deep(.leaflet-popup-content-wrapper) {
  background: rgba(6,16,36,0.92);
  border: 1px solid rgba(122,180,212,0.2);
  border-radius: 4px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.6);
  color: rgba(200,225,240,0.7);
}
:deep(.leaflet-popup-tip) {
  background: rgba(6,16,36,0.92);
}

/* ── Header nuevo: título + metadata en fila ──────────── */
.loc-header-row {
  display: flex;
  gap: 18px;
  align-items: flex-start;
  margin-bottom: 2px;
}
.loc-header-left { flex: 0 0 auto; max-width: 44%; min-width: 0; }
.loc-header-right {
  flex: 1;
  display: flex; flex-direction: column; gap: 10px;
  padding-top: 4px;
  border-left: 1px solid rgba(122,180,212,0.12);
  padding-left: 18px;
}
.loc-address {
  font-family: var(--font-serif); font-size: 17.5px; font-weight: 300;
  color: rgba(200,225,240,1.00); letter-spacing: 0.05em;
  margin-bottom: 3px;
}
.loc-poi-label {
  font-family: var(--font-serif); font-size: 15px; font-weight: 400;
  letter-spacing: 0.22em;              /* 0.45em → 0.22em para que quepa */
  color: var(--color-accent); text-transform: uppercase;
  margin-bottom: 7px; opacity: 1;
}

/* ── Puntos de interés ────────────────────────────────── */
.poi-list {
  display: flex; flex-direction: column; gap: 3px;
  margin-top: 6px;
}
.poi-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 10px;
  border: 1px solid rgba(122,180,212,0.10);
  color: rgba(200,225,240,0.90);
  font-family: var(--font-serif);
  font-size: 17.5px;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition: border-color 0.22s ease, color 0.22s ease, background 0.22s ease,
              opacity 0.85s ease, filter 0.85s ease;
  text-align: left;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  width: 100%;
}
.poi-btn:hover {
  background: rgba(4, 10, 24, 0.75);
  border-color: rgba(122,180,212,0.22);
  color: rgba(200,225,240,1.00);
}
.poi-btn.poi-btn-active {
  background: rgba(4, 10, 24, 0.85);
  border-color: rgba(122,180,212,0.38);
  color: rgba(200,225,240,0.95);
}
.poi-name {
  flex: 1;
}
.poi-icon {
  height: 32px; width: auto;
  object-fit: contain;
  opacity: 0.60;
  filter: brightness(1.4) saturate(0.3);
  transition: opacity 0.22s ease, filter 0.22s ease;
  flex-shrink: 0;
}
.poi-btn:hover .poi-icon,
.poi-btn.poi-btn-active .poi-icon {
  opacity: 0.90;
  filter: brightness(1.6) saturate(0.5);
}
/* ── Auto-highlight: primer botón pulsa, resto se atenúa ── */
.poi-auto-pulse {
  animation: poiAutoPulse 1.8s ease-in-out infinite;
  border-color: rgba(122,180,212,0.28) !important;
}
.poi-auto-dim {
  opacity: 0.42;
  transition: opacity 0.55s ease;
}
@keyframes poiAutoPulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.52; }
}

/* ── Model card ────────────────────────────────────────── */
.model-card {
  display: flex; flex-direction: column;
  position: relative; overflow: hidden;
  min-height: 500px;
}
.model-wrap { flex: 1; min-height: 480px; position: relative; overflow: hidden; }
.model-wrap canvas { width: 100%; height: 100%; display: block; }
.model-footer {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 16px; flex-shrink: 0;
  border-top: 1px solid rgba(122,180,212,0.08);
}
.model-footer span {
  font-family: var(--font-serif); font-size: 12px;
  letter-spacing: 0.4em; text-transform: uppercase;
  color: rgba(200,225,240,0.4);
}
.model-hint-txt { font-size: 11px; color: rgba(122,180,212,0.32); }
.model-deco {
  position: absolute; bottom: 44px; right: 20px;
  font-size: 18px; color: rgba(200,225,240,0.18);
  pointer-events: none; line-height: 1;
}

/* ── Brújula ────────────────────────────────────────────── */
.compass-wrap {
  position: absolute; bottom: 52px; right: 18px;
  z-index: 10; pointer-events: none;
}
.compass-svg { width: 64px; height: 64px; display: block; }

/* ══════════════════════════════════════════════════════════
   OVERLAYS 360 / 3D
   ══════════════════════════════════════════════════════════ */
.full-overlay {
  position: fixed; inset: 0; z-index: 400;
  background: rgba(2,5,12,0.92); backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
}
.ov-close {
  position: absolute; top: 32px; left: 36px;
  background: none; border: 1px solid rgba(122,180,212,0.25);
  color: rgba(200,225,240,0.72);
  width: 44px; height: 44px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.3s; z-index: 10;
}
.ov-close:hover { border-color: var(--color-accent); color: var(--color-accent); }
.ov-close svg   { width: 20px; height: 20px; }
.sphere-wrap { width: 84vw; max-width: 1100px; display: flex; flex-direction: column; gap: 14px; }
.sphere-canvas { width: 100%; height: 64vh; display: block; cursor: grab; border: 1px solid rgba(122,180,212,0.12); filter: brightness(0.90) saturate(1.7) contrast(1) sepia(0.35); }
.sphere-canvas:active { cursor: grabbing; }

/* ── Circular float (used by all hint icons) ────────────── */
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

/* ── Per-cell gallery hint ──────────────────────────────── */
.cell-hint-overlay {
  position: absolute; inset: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;
  background: rgba(0,0,0,0.28); z-index: 3; pointer-events: none;
}
.worldwide-wrap {
  width: 52px; height: 52px;
  animation: circularFloat 3s ease-in-out infinite;
  filter: saturate(0) drop-shadow(0 0 6px rgba(122,180,212,0.4));
  flex-shrink: 0;
}
.worldwide-vid { width: 100%; height: 100%; object-fit: contain; display: block; }
.cell-hint-label {
  font-family: var(--font-serif); font-size: 10px; font-weight: 300;
  letter-spacing: 0.32em; text-transform: uppercase; color: rgba(200,225,240,0.70);
}
.galleryHintFade-enter-active, .galleryHintFade-leave-active { transition: opacity 0.6s ease; }
.galleryHintFade-enter-from,  .galleryHintFade-leave-to      { opacity: 0; }

/* ── Transition overlays ──────────
.ofade-enter-active, .ofade-leave-active { transition: opacity 0.45s ease; }
.ofade-enter-from,   .ofade-leave-to     { opacity: 0; }

/* ══════════════════════════════════════════════════════════
   RESPONSIVE
   ══════════════════════════════════════════════════════════ */
@media (max-width: 900px) {
  .loc-bottom-grid { grid-template-columns: 1fr; padding: 0 16px; gap: 16px; }
  .model-card      { min-height: 340px; }
  .model-wrap      { min-height: 300px; }
}

@media (max-width: 768px) {
  .mg-grid     { grid-template-columns: 1fr 1fr; gap: 8px; }
  .mg-content  { padding: 32px 20px 40px; }
  .mg-eyebrow  { font-size: 10px; letter-spacing: 0.32em; margin-bottom: 18px; }

  .loc-block        { padding: 40px 0 36px; }
  .loc-bottom-grid  { grid-template-columns: 1fr; padding: 0 14px; gap: 14px; }

  .loc-info         { padding: 18px 16px 14px; }

  /* ── Kanji + subtítulos ── */
  .loc-title        { font-size: clamp(2rem, 9vw, 3rem); }

  /* "Boutique" y amenidades van en columna para no comprimirse */
  .loc-subtitle-row { gap: 2px; }
  .loc-subtitle     { font-size: 14px; letter-spacing: 0.22em; }
  .loc-amenities    { font-size: 9.5px; letter-spacing: 0.09em; display: flex; flex-direction: column; flex-wrap: nowrap; align-items: flex-start; gap: 3px; }
  .amen-dot         { display: none; }

  /* ── Header row → columna ── */
  .loc-header-row   { flex-direction: column; gap: 10px; }
  .loc-header-right {
    border-left: none; padding-left: 0;
    border-top: 1px solid rgba(122,180,212,0.12); padding-top: 10px;
    flex-direction: row; gap: 16px; flex-wrap: wrap;
  }
  /* Concepto & Superficie lado a lado con mínimo ancho */
  .loc-info-row      { flex: 1; min-width: 130px; }
  .loc-info-row span { font-size: 10px; letter-spacing: 0.22em; }
  .loc-info-row p    { font-size: 13px; line-height: 1.45; }

  .loc-address      { font-size: 13px; }
  .loc-poi-label    { font-size: 11px; }
  .poi-btn          { font-size: 13px; padding: 5px 8px; }
  .loc-map          { height: 170px; }

  .model-card  { min-height: 280px; }
  .model-wrap  { min-height: 240px; }
  .compass-svg { width: 48px; height: 48px; }
  .compass-wrap{ bottom: 40px; right: 12px; }

  .sphere-wrap   { width: 96vw; }
  .sphere-canvas { height: 52vh; }
}

@media (max-width: 480px) {
  .mg-grid  { grid-template-columns: 1fr; }
  /* Concepto & Superficie en columna en pantallas muy pequeñas */
  .loc-header-right { flex-direction: column; gap: 8px; }
  .loc-info-row     { flex: unset; min-width: unset; }
  .loc-amenities    { font-size: 9px; gap: 1px; }
}
</style>
