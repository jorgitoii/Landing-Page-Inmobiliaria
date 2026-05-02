<template>
  <section class="pricing-section" ref="sectionRef" id="tarifas">

    <!-- Discovery overlay -->
    <div class="pricing-disc-overlay" :style="{ opacity: discOp }"></div>

    <!-- Degradado superior de entrada -->
    <div class="pricing-top-grad"></div>

    <!-- Header -->
    <header class="pricing-header" :class="{ visible: inView }">
      <p class="pricing-eyebrow">Tarifas · Hotel Lain</p>
      <h2 class="pricing-title">Suites<br><span class="pricing-title-sub">/ Precios</span></h2>
      <div class="pricing-rule"></div>
    </header>

    <!-- Columnas de pergaminos -->
    <div class="columns-wrapper">
      <div
        v-for="(suite, i) in SUITES"
        :key="i"
        class="scroll-col"
      >
        <div class="ornament" :class="{ visible: inView }" :style="{ transitionDelay: `${i * 0.25}s` }"></div>

        <div class="scroll-video-wrap">
          <!-- Pergamino CSS/JS — reemplaza el video -->
          <div class="pergamino-anim" :ref="el => { if (el) pergaminoEls[i] = el }">
            <img
              class="pergamino-img"
              src="/assets/Imagenes/PricingSection/Pergamino/Pergamino desplegado.png"
              alt="Pergamino"
              draggable="false"
            />
            <div class="pergamino-palo"></div>
          </div>

          <!-- Texto superpuesto sobre el pergamino -->
          <div
            class="scroll-content"
            :class="{ visible: inView }"
            :style="{ '--base': `${1.50 + i * 0.28}s` }"
          >
            <h3 class="suite-name">{{ suite.name }}</h3>
            <p class="suite-subtitle">{{ suite.subtitle }}</p>
            <div class="suite-divider"></div>
            <p class="suite-desc">{{ suite.desc }}</p>
            <div class="suite-extras">
              <span v-if="suite.incluye" class="suite-extra-row">{{ suite.incluye }}</span>
              <span class="suite-extra-row">{{ suite.capacidad }}</span>
            </div>
            <div class="suite-price">{{ suite.precio }}</div>
          </div>

          <!-- Partículas de polvo dorado -->
          <div class="dust" :ref="el => { if (el) dustEls[i] = el }"></div>
        </div>

        <div
          class="scroll-label"
          :class="{ visible: inView }"
          :style="{ transitionDelay: `${0.1 + i * 0.25}s` }"
        >{{ suite.volumen }}</div>
      </div>
    </div>

  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// ── Contenido de las suites ──────────────────────────────
const SUITES = [
  {
    volumen:   'Suite Zen',
    name:      'Suite Zen',
    subtitle:  'Refugio íntimo para dos',
    desc:      'Espacio sereno y minimalista, diseñado para el descanso absoluto. Una atmósfera cálida con materiales naturales que invitan a desconectar y disfrutar del silencio.',
    capacidad: 'Capacidad: 2 personas',
    incluye:   null,
    precio:    '$1,800 MXN / noche',
  },
  {
    volumen:   'Suite Familiar',
    name:      'Suite Familiar',
    subtitle:  'Espacio para compartir con armonía',
    desc:      'Habitación amplia con dos camas, pensada para familias o grupos pequeños. Funcional sin perder elegancia, con una distribución cómoda y acogedora.',
    capacidad: 'Capacidad: hasta 4 personas',
    incluye:   null,
    precio:    '$2,600 MXN / noche',
  },
  {
    volumen:   'Suite Kuro Onsen',
    name:      'Suite Kuro Onsen',
    subtitle:  'Experiencia privada y ritual',
    desc:      'Una estancia premium que combina tradición y lujo. Futones, sala de estar y un onsen privado crean una experiencia íntima y profunda, donde el descanso se vuelve un ritual.',
    capacidad: 'Capacidad: hasta 4 personas',
    incluye:   'Incluye: 4 futones · sala de estar · onsen privado',
    precio:    '$4,800 MXN / noche',
  },
]

// ── Refs ─────────────────────────────────────────────────
const sectionRef   = ref(null)
const pergaminoEls = []
const dustEls      = []
const inView       = ref(false)
const discOp       = ref(1)

// ── Animación pergamino (CSS clip-path + palo) ───────────
const PERG_DURATION  = 3500
const PERG_BASE_DELAY = 800

function easeInOutCubic (t) {
  return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3) / 2
}

function animatePergamino (container, extraDelay = 0) {
  const img  = container.querySelector('.pergamino-img')
  const palo = container.querySelector('.pergamino-palo')
  if (!img || !palo) return

  const pgH = container.offsetHeight
  img.style.clipPath      = 'inset(0 0 100% 0)'
  palo.style.transform    = 'translateY(0px)'

  const totalDelay = PERG_BASE_DELAY + extraDelay
  let startTime = null

  function frame (ts) {
    if (!startTime) startTime = ts
    const elapsed = ts - startTime - totalDelay
    if (elapsed < 0) { requestAnimationFrame(frame); return }

    const t    = Math.min(1, elapsed / PERG_DURATION)
    const e    = easeInOutCubic(t)
    const clipB = (1 - e) * 100
    img.style.clipPath       = `inset(0 0 ${clipB.toFixed(2)}% 0)`
    palo.style.transform     = `translateY(${(e * (pgH - 10)).toFixed(2)}px)`

    if (t < 1) requestAnimationFrame(frame)
  }

  requestAnimationFrame(frame)
}

// ── Discovery overlay — igual que otras secciones ────────
function onScroll () {
  const el = sectionRef.value
  if (!el) return
  const r  = el.getBoundingClientRect()
  const vh = window.innerHeight
  const p  = (vh - r.top) / r.height
  discOp.value = Math.max(0, 1 - p / 0.10)
}

// ── Partículas de polvo ───────────────────────────────────
function spawnDust (el) {
  for (let i = 0; i < 14; i++) {
    const s     = document.createElement('span')
    const left  = Math.random() * 100
    const dur   = (3 + Math.random() * 4).toFixed(2)
    const del   = (Math.random() * 3).toFixed(2)
    const drift = ((Math.random() - 0.5) * 40).toFixed(1) + 'px'
    s.style.cssText = `left:${left}%;bottom:${10 + Math.random()*30}%;--dur:${dur}s;--del:${del}s;--drift:${drift}`
    el.appendChild(s)
  }
}

// ── IntersectionObserver — dispara videos y animaciones ──
let io = null

onMounted(() => {
  dustEls.forEach(el => el && spawnDust(el))

  io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!inView.value && e.intersectionRatio >= 0.25) {
        inView.value = true
        pergaminoEls.forEach((el, i) => {
          if (!el) return
          animatePergamino(el, i * 400)
        })
        io.disconnect()
      }
    })
  }, { threshold: 0.25 })

  if (sectionRef.value) io.observe(sectionRef.value)

  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})

onUnmounted(() => {
  if (io) { io.disconnect(); io = null }
  window.removeEventListener('scroll', onScroll)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=IM+Fell+English:ital@0;1&display=swap');

/* ── Discovery overlay ───────────────────────────────── */
.pricing-disc-overlay {
  position: absolute; inset: 0; z-index: 50;
  background: rgba(0,0,0,0.72);
  pointer-events: none;
  transition: opacity 0.15s linear;
}

/* ── Sección contenedora ─────────────────────────────── */
.pricing-section {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 40px 110px;
  overflow: hidden;
  background-image:
    linear-gradient(rgba(0,0,0,0.88), rgba(0,0,0,0.88)),
    url('https://pub-c06678eb8f2c47aeaf4b1a80eef991aa.r2.dev/assets/Imagenes/Estaticas/Celosia/patron_fondo.png');
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center top;
}

/* Degradado superior que suaviza la entrada */
.pricing-top-grad {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 55%;
  background: linear-gradient(
    to bottom,
    rgba(5,3,1,1.00) 0%,
    rgba(5,3,1,0.94) 50%,
    transparent 100%
  );
  pointer-events: none;
  z-index: 2;
}

/* ── Header ──────────────────────────────────────────── */
.pricing-header {
  position: relative;
  z-index: 5;
  text-align: left;
  width: 100%;
  max-width: 1100px;
  margin-bottom: 48px;
  opacity: 0;
  transform: translateY(14px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}
.pricing-header.visible { opacity: 1; transform: translateY(0); }

.pricing-eyebrow {
  font-family: 'Cinzel Decorative', serif;
  font-size: 15px; font-weight: 400;
  letter-spacing: 0.48em; text-transform: uppercase;
  color: #c9a84c; opacity: 0.75;
  margin-bottom: 10px;
}
.pricing-title {
  font-family: 'IM Fell English', serif;
  font-size: clamp(2rem, 3.5vw, 3.4rem);
  font-weight: 400; line-height: 1.15;
  color: #e8d9b8; letter-spacing: 0.04em;
  margin-bottom: 14px;
}
.pricing-title-sub {
  font-style: italic;
  opacity: 0.55;
  font-size: 0.78em;
}
.pricing-rule {
  width: 42px; height: 1px;
  background: rgba(201,168,76,0.55);
}

/* ── Grid de columnas ────────────────────────────────── */
.columns-wrapper {
  position: relative;
  z-index: 5;
  display: flex;
  gap: 48px;
  align-items: flex-end;
  max-width: 1100px;
  width: 100%;
  justify-content: center;
}

.scroll-col {
  flex: 1;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
}

/* ── Ornamento ───────────────────────────────────────── */
.ornament {
  width: 60px; height: 1px;
  background: linear-gradient(to right, transparent, #c9a84c, transparent);
  opacity: 0;
  transition: opacity 0.8s ease 0.3s;
}
.ornament.visible { opacity: 1; }

/* ── Pergamino animado ───────────────────────────────── */
.scroll-video-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 9 / 14;
  overflow: visible;
  border-radius: 4px;
}

.pergamino-anim {
  position: relative;
  width: 100%;
  height: 100%;
}

.pergamino-img {
  width: 100%;
  height: 100%;
  object-fit: fill;
  display: block;
  clip-path: inset(0 0 100% 0);
  filter: contrast(1.1) saturate(0.9);
  position: relative;
  z-index: 1;
}

/* Palo de madera oscura que acompaña el despliegue */
.pergamino-palo {
  position: absolute;
  top: 0;
  left: -10px;
  right: -10px;
  height: 6px;
  border-radius: 1px;
  z-index: 0;
  background: linear-gradient(
    to bottom,
    #5c3010 0%,
    #3d1a05 40%,
    #0d0500 60%,
    #3d1a05 100%
  );
  box-shadow:
    0 4px 16px rgba(0,0,0,0.8),
    inset 0 1px 2px rgba(120,70,30,0.35),
    inset 0 -1px 2px rgba(0,0,0,0.6);
}

/* ── Texto sobre el pergamino ────────────────────────── */
.scroll-content {
  position: absolute;
  top: 12%; left: 15%; right: 15%;
  bottom: 10%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 7px;
  z-index: 3;
}

.scroll-content > * {
  opacity: 0 !important;
  transform: translateY(8px);
  transition: opacity 0.65s ease, transform 0.65s ease;
}
.scroll-content.visible > *:nth-child(1) { opacity: 1    !important; transform: translateY(0); transition-delay: calc(var(--base) + 0.00s); }
.scroll-content.visible > *:nth-child(2) { opacity: 0.85 !important; transform: translateY(0); transition-delay: calc(var(--base) + 0.30s); }
.scroll-content.visible > *:nth-child(3) { opacity: 1    !important; transform: translateY(0); transition-delay: calc(var(--base) + 0.55s); }
.scroll-content.visible > *:nth-child(4) { opacity: 0.80 !important; transform: translateY(0); transition-delay: calc(var(--base) + 0.80s); }
.scroll-content.visible > *:nth-child(5) { opacity: 1    !important; transform: translateY(0); transition-delay: calc(var(--base) + 1.10s); }
.scroll-content.visible > *:nth-child(6) { opacity: 1    !important; transform: translateY(0); transition-delay: calc(var(--base) + 1.38s); }




.suite-name {
  font-family: 'Cinzel Decorative', serif;
  font-size: clamp(0.88rem, 1.15vw, 1.08rem);
  font-weight: 700;
  letter-spacing: 0.14em;
  color: #3a1f00;
  text-transform: uppercase;
  line-height: 1.3;
}
.suite-subtitle {
  font-family: 'IM Fell English', serif;
  font-style: italic;
  font-size: clamp(0.90rem, 1.08vw, 1.00rem);
  color: #5a3510;
  line-height: 1.4;
  opacity: 0.85;
}
.suite-divider {
  width: 32px; height: 1px;
  background: linear-gradient(to right, transparent, #c9a84c, transparent);
  flex-shrink: 0;
  margin: 1px 0;
}
.suite-desc {
  font-family: 'IM Fell English', serif;
  font-size: clamp(0.82rem, 0.98vw, 0.92rem);
  color: #3a2008;
  line-height: 1.55;
  opacity: 0.80;
}
.suite-extras {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 2px;
}
.suite-extra-row {
  font-family: 'Cinzel Decorative', serif;
  font-size: clamp(0.72rem, 0.85vw, 0.80rem);
  letter-spacing: 0.08em;
  color: #5a3a10;
  opacity: 0.75;
}
.suite-price {
  font-family: 'Cinzel Decorative', serif;
  font-size: clamp(0.92rem, 1.18vw, 1.10rem);
  font-weight: 700;
  letter-spacing: 0.10em;
  color: #8b4c00;
  margin-top: 4px;
}

/* ── Etiqueta inferior ───────────────────────────────── */
.scroll-label {
  font-family: 'Cinzel Decorative', serif;
  font-size: 0.92rem;
  letter-spacing: 0.22em;
  color: #c9a84c;
  text-transform: uppercase;
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}
.scroll-label.visible { opacity: 0.85; transform: translateY(0); }

/* ── Partículas de polvo dorado ──────────────────────── */
.dust {
  position: absolute; inset: 0;
  pointer-events: none; z-index: 4; overflow: hidden;
}
.dust :deep(span) {
  position: absolute;
  width: 2px; height: 2px;
  border-radius: 50%;
  background: rgba(201,168,76,0.65);
  opacity: 0;
}

.scroll-col:nth-child(1) .dust :deep(span) { animation: floatDust var(--dur) var(--del) ease-in-out infinite; }
.scroll-col:nth-child(2) .dust :deep(span) { animation: floatDust var(--dur) calc(var(--del) + 0.35s) ease-in-out infinite; }
.scroll-col:nth-child(3) .dust :deep(span) { animation: floatDust var(--dur) calc(var(--del) + 0.70s) ease-in-out infinite; }

@keyframes floatDust {
  0%   { opacity: 0;   transform: translateY(0) translateX(0); }
  20%  { opacity: 0.7; }
  80%  { opacity: 0.3; }
  100% { opacity: 0;   transform: translateY(-130px) translateX(var(--drift)); }
}

/* ── Responsive ──────────────────────────────────────── */
@media (max-width: 900px) {
  .columns-wrapper { gap: 28px; }
  .scroll-col { max-width: 260px; }
}
@media (max-width: 768px) {
  .pricing-section { padding: 80px 20px 90px; }
  .pricing-title   { font-size: clamp(1.6rem, 6vw, 2.4rem); }
  .pricing-eyebrow { font-size: 11px; letter-spacing: 0.3em; }
}
@media (max-width: 640px) {
  .pricing-section { padding: 72px 18px 80px; }
  .columns-wrapper { flex-direction: column; align-items: center; gap: 32px; }
  .scroll-col      { max-width: 300px; width: 100%; }
  .suite-name      { font-size: 0.95rem; }
  .suite-desc      { font-size: 0.80rem; }
  .suite-price     { font-size: 0.98rem; }
}
</style>
