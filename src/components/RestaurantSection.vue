<template>
  <section ref="sectionRef" class="rest-section" id="restaurante" :style="sectionStyle">
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

      <!-- Swipe hint — visible on mobile when section is active -->
      <Transition name="hint-fade">
        <div class="swipe-hint" v-if="showHint">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="hint-arrow hint-up">
            <polyline points="18 15 12 9 6 15"/>
          </svg>
          <span class="hint-label">Desliza para explorar</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="hint-arrow hint-down">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </Transition>

    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

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
const MOBILE_ZOOM      = 1.5   // zoom aplicado en móvil — acerca cada plato a la cámara

// Nudge horizontal por waypoint — calibrado en dispositivo
// Desplaza el encuadre para mostrar plato + texto en frame simultáneamente
const NUDGES         = [0.16, -0.08, 0.14, -0.08, 0.14]
const isMobileDevice = typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0

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
const showHint     = ref(false)
let   hintTimer    = null

// ─────────────────────────────────────────────────────────────────────────────
// Image wrapper transform — centers the active waypoint in the viewport
// ─────────────────────────────────────────────────────────────────────────────

// Sección siempre crece a N×100vh — scroll nativo tanto en móvil como en desktop
const sectionStyle = computed(() => ({ height: `${WAYPOINTS.length * 100}vh` }))

const wrapperStyle = computed(() => {
  if (!imgRenderedH.value) return { transform: 'translate(0px,0px)' }
  const wp = WAYPOINTS[activeWp.value]

  if (vpW.value <= 768) {
    // Mobile: zoom + nudge horizontal para equilibrar plato y texto en frame
    const s     = MOBILE_ZOOM
    const nudge = NUDGES[activeWp.value] ?? 0
    const tx = vpW.value / 2 - (wp.nx + nudge) * vpW.value  * s
    const ty = vpH.value / 2 -  wp.ny          * imgRenderedH.value * s
    return { transform: `translate(${tx}px, ${ty}px) scale(${s})` }
  }

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
// Swipe hint helpers
// ─────────────────────────────────────────────────────────────────────────────

let io         = null
let hintShown  = false

function hideHint() {
  showHint.value = false
  if (hintTimer) { clearTimeout(hintTimer); hintTimer = null }
}

// ─────────────────────────────────────────────────────────────────────────────
// Wheel snap — desktop: un scroll = un waypoint (sin hijacking total)
// ─────────────────────────────────────────────────────────────────────────────

let snapping     = false
let snapCooldown = null

// Calcula el scrollY exacto que corresponde al waypoint `wpIndex`
function waypointScrollTop(wpIndex) {
  const section = sectionRef.value
  if (!section) return 0
  const scrollable = section.offsetHeight - vpH.value          // 4 × 100vh
  return section.offsetTop + wpIndex * (scrollable / (WAYPOINTS.length - 1))
}

function onWheel(e) {
  // Solo en desktop
  if (vpW.value <= 768) return

  const section = sectionRef.value
  if (!section) return
  const r = section.getBoundingClientRect()

  // La sección está "pegada" cuando su top está ≤ 0 y aún no ha salido por abajo
  const isSticky = r.top <= 1 && r.bottom >= vpH.value - 1
  if (!isSticky) return

  // Durante la animación de snap, solo bloqueamos el scroll nativo
  if (snapping) { e.preventDefault(); return }

  const dir    = e.deltaY > 0 ? 1 : -1
  const nextWp = activeWp.value + dir

  // En los extremos dejamos pasar el scroll (salida natural hacia la sección contigua)
  if (nextWp < 0 || nextWp >= WAYPOINTS.length) return

  e.preventDefault()
  snapping = true

  window.scrollTo({ top: waypointScrollTop(nextWp), behavior: 'smooth' })

  // Cooldown: bloqueamos wheels adicionales hasta que el smooth-scroll casi termine
  clearTimeout(snapCooldown)
  snapCooldown = setTimeout(() => { snapping = false }, 750)
}

// ─────────────────────────────────────────────────────────────────────────────
// Scroll listener — intro overlay + activeWp derivado del scroll (nativo)
// ─────────────────────────────────────────────────────────────────────────────

function onScroll() {
  const el = sectionRef.value
  if (!el) return
  const r             = el.getBoundingClientRect()
  const enterProgress = (vpH.value - r.top) / r.height
  introOp.value = Math.max(0, 1 - enterProgress / 0.10)

  // activeWp se deriva del scroll en todos los tamaños de pantalla
  const scrollable = r.height - vpH.value
  if (scrollable > 0) {
    const pct = Math.max(0, Math.min(1, -r.top / scrollable))
    activeWp.value = Math.min(
      WAYPOINTS.length - 1,
      Math.round(pct * (WAYPOINTS.length - 1))
    )
  }
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
  // IO solo para mostrar el hint al entrar por primera vez (solo aplica en móvil via CSS)
  io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting && !hintShown) {
        hintShown      = true
        showHint.value = true
        hintTimer      = setTimeout(hideHint, 3500)
        io.unobserve(sectionRef.value)
      }
    }
  }, { threshold: 0.1 })

  if (sectionRef.value) io.observe(sectionRef.value)

  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onResize)
  // passive: false necesario para poder llamar preventDefault en el wheel
  window.addEventListener('wheel', onWheel, { passive: false })

  // Por si la imagen ya estaba cacheada y @load no disparó
  const img = imgRef.value
  if (img && img.complete && img.naturalWidth) onImgLoad()

  onScroll()  // calcular estado inicial
})

onUnmounted(() => {
  if (io)          { io.disconnect(); io = null }
  if (snapCooldown){ clearTimeout(snapCooldown); snapCooldown = null }
  hideHint()
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onResize)
  window.removeEventListener('wheel',  onWheel)
})
</script>

<style scoped>
/* ── Sección tall: crece a N×100vh para scroll nativo en todos los dispositivos ── */
.rest-section {
  position: relative;
  height: auto;
  overflow: visible;
  background: #060c16;
}

/* ── Viewport interior sticky — se fija al top mientras se scrollea la sección ── */
.rest-sticky {
  position: sticky;
  top: 0;
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
  transform-origin: 0 0;
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
  transform: scale(1.6);
}

@media (max-width: 768px) {
  .rest-label { font-family: Georgia, serif; }
  .rest-nav-dots { right: 12px; gap: 7px; }
  .rest-dot { width: 5px; height: 5px; }
  .rest-header-overlay { top: 6vh; left: 4vw; }
  .rest-title { font-size: clamp(1.4rem, 6vw, 2.4rem); }
}

/* ── Swipe hint (mobile only) ─────────────────────────────────── */
.swipe-hint {
  position: absolute;
  bottom: 6vh;
  left: 50%;
  transform: translateX(-50%);
  z-index: 25;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  pointer-events: none;
}
.hint-arrow {
  width: 24px; height: 24px;
  color: rgba(200, 224, 240, 0.72);
}
.hint-up  { animation: hintBounceUp   1.5s ease-in-out infinite; }
.hint-down { animation: hintBounceDown 1.5s ease-in-out infinite; }
.hint-label {
  font-family: Georgia, serif;
  font-size: 10.5px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(200, 224, 240, 0.60);
}
@keyframes hintBounceUp {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-4px); }
}
@keyframes hintBounceDown {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(4px); }
}
/* Hide on desktop */
@media (min-width: 769px) { .swipe-hint { display: none !important; } }


.hint-fade-enter-active, .hint-fade-leave-active { transition: opacity 0.55s ease; }
.hint-fade-enter-from,   .hint-fade-leave-to     { opacity: 0; }
</style>
