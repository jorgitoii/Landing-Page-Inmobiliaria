<template>
  <section ref="sectionRef" class="rest-section" id="restaurante">
    <div class="rest-sticky">

      <!-- Image + labels wrapper — translated to center active waypoint -->
      <div class="rest-img-wrapper" :style="wrapperStyle">
        <img
          ref="imgRef"
          src="https://pub-c06678eb8f2c47aeaf4b1a80eef991aa.r2.dev/assets/Imagenes/Restaurante/Mesa%20refinada.png"
          class="rest-img"
          alt="Restaurante Hotel Lain"
          draggable="false"
          ondragstart="return false"
          @load="onImgLoad"
        />
        <!-- Menu label overlays (always visible) -->
        <div
          v-for="(label, i) in LABELS"
          :key="i"
          class="rest-label"
          :style="getLabelStyle(label)"
          v-html="label.html"
        />
      </div>

      <!-- Capa de opacidad de entrada — opaca al entrar, desaparece al 10% -->
      <div class="rest-intro-overlay" :style="{ opacity: introOp }" />

      <!-- Overlay permanente de bordes/gradiente -->
      <div class="rest-overlay" />

      <!-- Section header — only visible on first waypoint -->
      <header
        class="rest-header-overlay"
        :class="{ visible: imgLoaded && activeWp === 0 }"
      >
        <h2 class="rest-title">Restaurante<br><span class="rest-title-sub">/ Menú</span></h2>
        <div class="rest-rule" />
      </header>

      <!-- Nav dots (right side) -->
      <nav class="rest-nav-dots" aria-label="Navegación por platos">
        <div
          v-for="(_, i) in WAYPOINTS"
          :key="i"
          class="rest-dot"
          :class="{ active: i === activeWp }"
        />
      </nav>

    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { gsap }     from 'gsap'
import { Observer } from 'gsap/Observer'

gsap.registerPlugin(Observer)

// ─────────────────────────────────────────────────────────────────────────────
// Config: waypoints & labels (exported from waypoint-editor.html)
// ─────────────────────────────────────────────────────────────────────────────

const WAYPOINTS = [
  { nx: 0.4721, ny: 0.1614 },
  { nx: 0.5406, ny: 0.3327 },
  { nx: 0.4713, ny: 0.5057 },
  { nx: 0.5428, ny: 0.681  },
  { nx: 0.4739, ny: 0.87   },
]

const LABELS = [
  {
    nx: 0.5507, ny: 0.1045, nw: 0.3853,
    html: `<strong>Curry japonés</strong><br><br>Arroz blanco acompañado de un curry espeso, suave y profundamente aromático, enriquecido con tiernos trozos de carne cocinados a fuego lento. Un plato reconfortante que equilibra dulzura, especias y profundidad en cada bocado.`,
    fontSize: 30, lineHeight: 1.4, color: '#ffffff', textAlign: 'left',
  },
  {
    nx: 0.5502, ny: 0.4494, nw: 0.3651,
    html: `<strong>Tonkatsu</strong><br><br>Corte de cerdo empanizado al estilo japonés, dorado hasta alcanzar un exterior crujiente y un interior jugoso, una preparación que combina técnica y confort, ofreciendo un contraste de texturas que resulta profundamente satisfactorio.`,
    fontSize: 30, lineHeight: 1.4, color: '#ffffff', textAlign: 'left',
  },
  {
    nx: 0.1571, ny: 0.6225, nw: 0.3541,
    html: `<strong>Okonomiyaki</strong><br><br>Clásica tortita japonesa preparada a la plancha, con una textura suave y reconfortante. Terminada con capas de salsa intensa y mayonesa delicadamente trazada, acompañada de hojuelas que reaccionan al calor, creando una experiencia visual y sensorial única.`,
    fontSize: 30, lineHeight: 1.4, color: '#ffffff', textAlign: 'left',
  },
  {
    nx: 0.5467, ny: 0.8107, nw: 0.3787,
    html: `<strong>Yakitori</strong><br><br>Brochetas de pollo cuidadosamente asadas a la parrilla, bañadas en salsa tare ligeramente dulce y ahumada. Cada pieza logra un equilibrio perfecto entre jugosidad interior y ese toque caramelizado que define la tradición callejera japonesa llevada a un nivel refinado.`,
    fontSize: 30, lineHeight: 1.4, color: '#ffffff', textAlign: 'left',
  },
  {
    nx: 0.1536, ny: 0.2759, nw: 0.3651,
    html: `<strong>Miso</strong><br><br>Sopa tradicional elaborada a base de pasta de miso, con un perfil delicado y umami. Integra tofu, algas y notas sutiles del mar, ofreciendo una experiencia cálida, ligera y profundamente reconfortante.`,
    fontSize: 30, lineHeight: 1.4, color: '#ffffff', textAlign: 'left',
  },
]

const EDITOR_REF_WIDTH = 1920

// ─────────────────────────────────────────────────────────────────────────────
// Reactive state
// ─────────────────────────────────────────────────────────────────────────────

const sectionRef   = ref(null)
const imgRef       = ref(null)
const activeWp     = ref(0)
const imgLoaded    = ref(false)
const imgRenderedH = ref(0)
const vpW          = ref(typeof window !== 'undefined' ? window.innerWidth  : 1920)
const vpH          = ref(typeof window !== 'undefined' ? window.innerHeight : 1080)
const introOp      = ref(1)   // 1 = negro opaco → 0 = transparente (igual que ArchitectsSection)

// ─────────────────────────────────────────────────────────────────────────────
// Image wrapper transform — centers the active waypoint in the viewport
// ─────────────────────────────────────────────────────────────────────────────

const wrapperStyle = computed(() => {
  if (!imgRenderedH.value) return { transform: 'translate(0px,0px)' }
  const wp = WAYPOINTS[activeWp.value]
  const tx = vpW.value / 2 - wp.nx * vpW.value
  const ty = vpH.value / 2 - wp.ny * imgRenderedH.value
  return { transform: `translate(${tx}px, ${ty}px)` }
})

// ─────────────────────────────────────────────────────────────────────────────
// Label positioning — absolute inside the image wrapper
// ─────────────────────────────────────────────────────────────────────────────

function getLabelStyle(label) {
  const scale = vpW.value / EDITOR_REF_WIDTH
  return {
    left:       `${label.nx * vpW.value}px`,
    top:        `${label.ny * imgRenderedH.value}px`,
    width:      `${label.nw * vpW.value}px`,
    color:      label.color,
    fontFamily: 'Georgia, serif',
    fontSize:   `${(label.fontSize * scale).toFixed(1)}px`,
    lineHeight:  label.lineHeight,
    textAlign:   label.textAlign,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Image load
// ─────────────────────────────────────────────────────────────────────────────

function onImgLoad() {
  const img = imgRef.value
  if (!img) return
  imgRenderedH.value = (img.naturalHeight / img.naturalWidth) * vpW.value
  imgLoaded.value    = true
}

// ─────────────────────────────────────────────────────────────────────────────
// Scroll hijacking via GSAP Observer
// ─────────────────────────────────────────────────────────────────────────────

let obs      = null
let io       = null
let hijacked = false

function startHijack(fromBelow) {
  if (hijacked) return
  hijacked       = true
  activeWp.value = fromBelow ? WAYPOINTS.length - 1 : 0

  obs = Observer.create({
    target: window,
    type: 'wheel,touch',
    tolerance: 10,
    preventDefault: true,
    onDown: () => {                                  // scroll hacia abajo → siguiente plato
      if (activeWp.value < WAYPOINTS.length - 1) {
        activeWp.value++
      } else {
        stopHijack()                                 // último plato → salir hacia abajo
      }
    },
    onUp: () => {                                    // scroll hacia arriba → plato anterior
      if (activeWp.value > 0) {
        activeWp.value--
      } else {
        stopHijack()                                 // primer plato → salir hacia arriba
      }
    },
  })
}

function stopHijack() {
  if (obs)   { obs.kill(); obs = null }
  hijacked = false
}

// ─────────────────────────────────────────────────────────────────────────────
// IntersectionObserver — activa el hijack cuando la sección llena la pantalla
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// Scroll listener — solo para la intro overlay (igual que ArchitectsSection)
// ─────────────────────────────────────────────────────────────────────────────

function onScroll() {
  const el = sectionRef.value
  if (!el) return
  const r             = el.getBoundingClientRect()
  const enterProgress = (vpH.value - r.top) / r.height
  // opacidad 1 → 0 en el primer 10% de la sección
  introOp.value = Math.max(0, 1 - enterProgress / 0.10)
}

function onResize() {
  vpW.value = window.innerWidth
  vpH.value = window.innerHeight
  const img = imgRef.value
  if (img && img.complete && img.naturalWidth) {
    imgRenderedH.value = (img.naturalHeight / img.naturalWidth) * vpW.value
  }
}

onMounted(() => {
  io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        const fromBelow = e.boundingClientRect.top > vpH.value * 0.5
        startHijack(fromBelow)
      } else {
        stopHijack()
      }
    }
  }, { threshold: 0.92 })

  if (sectionRef.value) io.observe(sectionRef.value)

  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onResize)

  // Por si la imagen ya estaba cacheada y @load no disparó
  const img = imgRef.value
  if (img && img.complete && img.naturalWidth) onImgLoad()

  onScroll()  // calcular estado inicial
})

onUnmounted(() => {
  stopHijack()
  if (io) { io.disconnect(); io = null }
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onResize)
})
</script>

<style scoped>
/* ── Sección ocupa exactamente 100vh ──────────────────────────────────── */
.rest-section {
  position: relative;
  height: 100vh;
  background: #060c16;
}

/* ── Viewport interior ────────────────────────────────────────────────── */
.rest-sticky {
  position: relative;
  height: 100vh;
  overflow: hidden;
  background: #060c16;
}

/* ── Image wrapper ────────────────────────────────────────────────────── */
.rest-img-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  will-change: transform;
  transition: transform 1.4s cubic-bezier(0.77, 0, 0.175, 1);
  transform-origin: top left;
}

.rest-img {
  display: block;
  width: 100vw;
  height: auto;
  user-select: none;
  pointer-events: none;
}

/* ── Labels ───────────────────────────────────────────────────────────── */
.rest-label {
  position: absolute;
  pointer-events: none;
  font-family: 'Georgia', serif;
}

.rest-label :deep(strong),
.rest-label :deep(b) {
  display: block;
  font-weight: 700;
  letter-spacing: 0.04em;
  margin-bottom: 0.25em;
}

/* Texto descriptivo que sigue al título (em, p, div, etc.) */
.rest-label :deep(em),
.rest-label :deep(i) {
  font-size: 0.58em;
  font-style: italic;
  opacity: 0.82;
  line-height: inherit;
}

.rest-label :deep(br + *),
.rest-label :deep(br ~ *) {
  font-size: 0.58em;
  font-style: normal;
  opacity: 0.82;
}

/* ── Intro overlay — negro al entrar, desaparece al 10% (= ArchitectsSection) ── */
.rest-intro-overlay {
  position: absolute;
  inset: 0;
  z-index: 6;
  background: #060c16;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

/* ── Overlay de bordes/gradiente permanente ───────────────────────────── */
.rest-overlay {
  position: absolute;
  inset: 0;
  z-index: 5;
  pointer-events: none;
  background: linear-gradient(
    90deg,
    rgba(2, 6, 14, 0.72) 0%,
    rgba(3, 8, 18, 0.18) 30%,
    rgba(3, 8, 18, 0.18) 70%,
    rgba(2, 6, 14, 0.72) 100%
  ),
  linear-gradient(
    to top,
    rgba(6, 12, 22, 0.65) 0%,
    transparent 35%
  ),
  linear-gradient(
    to bottom,
    rgba(6, 12, 22, 0.5) 0%,
    transparent 25%
  );
}

/* ── Header overlay — sólo visible en waypoint 0 ─────────────────────── */
.rest-header-overlay {
  position: absolute;
  top: 9vh;
  left: 5vw;
  z-index: 20;
  pointer-events: none;
  opacity: 0;
  transform: translateY(12px);
  transition: opacity 0.7s ease, transform 0.7s ease;
}

.rest-header-overlay.visible {
  opacity: 1;
  transform: translateY(0);
}

.rest-title {
  margin: 0 0 0.6em;
  font-family: 'Georgia', serif;
  font-size: clamp(1.8rem, 3.5vw, 3.2rem);
  font-weight: 300;
  line-height: 1.15;
  color: #e8d9b8;
  letter-spacing: 0.06em;
}

.rest-title-sub {
  font-style: italic;
  opacity: 0.65;
  font-size: 0.8em;
}

.rest-rule {
  width: 38px;
  height: 1px;
  background: rgba(229, 36, 43, 0.55);
}

/* ── Nav dots ─────────────────────────────────────────────────────────── */
.rest-nav-dots {
  position: absolute;
  right: 3vw;
  top: 50%;
  transform: translateY(-50%);
  z-index: 20;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rest-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: rgba(200, 224, 240, 0.25);
  transition: background 0.4s ease, transform 0.4s ease;
}

.rest-dot.active {
  background: #c8e0f0;
  transform: scale
