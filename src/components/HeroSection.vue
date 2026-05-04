<template>
  <section class="hero-section" ref="heroEl" id="inicio">

    <!-- VIDEO LAYER -->
    <div class="hero-media" :style="mediaStyle">
      <video
        ref="videoEl"
        autoplay muted loop playsinline
        class="hero-video"
        src="https://pub-c06678eb8f2c47aeaf4b1a80eef991aa.r2.dev/assets/Video/Hero_video.mp4"
      ></video>
      <div class="hero-video-overlay"></div>
    </div>

    <!-- INTRO BLACK OVERLAY (fades out) -->
    <div class="intro-overlay" :style="{ opacity: introOpacity, pointerEvents: introOpacity < 0.01 ? 'none' : 'all' }"></div>

    <!-- INTRO TEXT: letter by letter -->
    <Transition name="intro-slide">
      <div class="intro-text-wrap" v-if="showIntroText">
        <span v-for="(lineChars, li) in charData" :key="li" class="intro-line">
          <span
            v-for="(c, ci) in lineChars"
            :key="ci"
            class="intro-char"
            :class="{ visible: charsVisible }"
            :style="{ transitionDelay: c.delay + 's' }"
          >{{ c.ch }}</span>
        </span>
      </div>
    </Transition>

    <!-- HERO BRAND -->
    <div class="hero-brand" :class="{ visible: brandVisible }" :style="brandStyle">
      <p class="hero-tagline">Rain Hotel &nbsp;|&nbsp; 東イン　ホテル</p>
      <h1 class="hero-title">Hotel<br>Lain</h1>
      <p class="hero-sub">Donde el silencio tiene nombre</p>
    </div>

    <!-- Discovery overlay -->
    <div class="hero-discovery" :style="{ opacity: discoveryOp }"></div>

    <!-- SCROLL HINT -->
    <div class="scroll-hint" :style="{ opacity: hintOpacity }">
      <span class="scroll-line"></span>
      <span class="scroll-label">Scroll</span>
    </div>

  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { startGlbPreload } from '../composables/useModelPreloader.js'

const heroEl  = ref(null)
const videoEl = ref(null)

/* ---- Intro: letter-by-letter ---- */
const rawLines = ['La paz', 'se respira', 'aquí...']

// Pre-compute char data with staggered delays (narrative pace)
const charData = computed(() => {
  let idx = 0
  return rawLines.map(line => {
    return [...line].map(ch => {
      const delay = 0.35 + idx * 0.062   // 62ms per char, starts at 350ms
      idx++
      return { ch, delay }
    })
  })
})

const charsVisible  = ref(false)
const showIntroText = ref(true)
const introOpacity  = ref(1)
const brandVisible  = ref(false)

/* ---- Scroll state ---- */
const scrolled = ref(0)

const mediaStyle = computed(() => {
  const s = 1 + scrolled.value * 0.00025
  const y = scrolled.value * 0.22
  return { transform: 'scale(' + s + ') translateY(' + y + 'px)' }
})

const brandStyle = computed(() => {
  const op = Math.max(0, 1 - scrolled.value / 380)
  const y  = scrolled.value * 0.38
  return { transform: 'translateY(' + y + 'px)', opacity: op }
})

const hintOpacity = computed(() => Math.max(0, 1 - scrolled.value / 180))

// Discovery overlay: se retira cuando el hero entra al 10% de su altura
const discoveryOp = computed(() => {
  if (!heroEl.value) return 1
  const r  = heroEl.value.getBoundingClientRect()
  const vh = window.innerHeight
  const p  = (vh - r.top) / r.height
  return Math.max(0, 1 - p / 0.10)
})

/* ---- Boot animation sequence ---- */
onMounted(() => {
  // Kick off GLB preload immediately (background, doesn't block UI)
  startGlbPreload()

  // Total chars: 6 + 10 + 7 = 23  => last char at 500 + 22*92 = ~2524ms
  setTimeout(() => { charsVisible.value = true }, 200)

  // After all chars visible + reading pause (500ms), slide out
  setTimeout(() => {
    showIntroText.value = false
    brandVisible.value  = true
    const start = performance.now()
    const dur   = 1200
    const fade  = (now) => {
      const p = Math.min(1, (now - start) / dur)
      introOpacity.value = 1 - p
      if (p < 1) requestAnimationFrame(fade)
    }
    requestAnimationFrame(fade)
  }, 3200)

  window.addEventListener('scroll', onScroll, { passive: true })
})

const onScroll = () => {
  if (heroEl.value) scrolled.value = Math.max(0, -heroEl.value.getBoundingClientRect().top)
}

onUnmounted(() => { window.removeEventListener('scroll', onScroll) })
</script>

<style scoped>
.hero-section {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-black);
}

.hero-media {
  position: absolute;
  inset: 0;
  will-change: transform;
  transition: transform 0.22s ease-out;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-black);
}
.hero-video {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}
.hero-video-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(to bottom,
      rgba(2,5,12,0.55) 0%,
      rgba(2,5,12,0.08) 45%,
      rgba(2,5,12,0.08) 55%,
      rgba(2,5,12,0.72) 100%),
    linear-gradient(to right,
      rgba(4,14,28,0.45) 0%,
      transparent 35%,
      transparent 65%,
      rgba(4,14,28,0.45) 100%);
}

.intro-overlay {
  position: absolute;
  inset: 0;
  background: var(--color-black);
  z-index: 20;
}
.hero-discovery {
  position: absolute; inset: 0; z-index: 18;
  background: rgba(0,0,0,0.72);
  pointer-events: none;
  transition: opacity 0.15s linear;
}

.intro-text-wrap {
  position: absolute;
  z-index: 25;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.08em;
}
.intro-slide-leave-active {
  transition: transform 1.1s cubic-bezier(0.76, 0, 0.24, 1), opacity 1.1s ease;
}
.intro-slide-leave-to {
  transform: translateX(52vw);
  opacity: 0;
}

/* Each line is a flex row of chars */
.intro-line {
  display: flex;
  flex-wrap: nowrap;
  font-family: var(--font-serif);
  font-size: clamp(2.6rem, 5.5vw, 5rem);
  font-weight: 300;
  color: var(--color-white);
  letter-spacing: 0.04em;
  line-height: 1.22;
}

.intro-char {
  display: inline-block;
  opacity: 0;
  transform: translateY(14px);
  transition: opacity 0.62s ease, transform 0.62s cubic-bezier(0.16, 1, 0.3, 1);
  white-space: pre;
}
.intro-char.visible {
  opacity: 1;
  transform: translateY(0);
}

.hero-brand {
  position: absolute;
  z-index: 10;
  text-align: center;
  opacity: 0;
  transition: opacity 1.2s ease 0.1s;
  will-change: transform, opacity;
  pointer-events: none;
}
.hero-brand.visible { opacity: 1; }

.hero-tagline {
  font-family: var(--font-jp);
  font-size: 15px;
  font-weight: 200;
  letter-spacing: 0.45em;
  color: rgba(245,250,255,0.92);
  margin-bottom: 20px;
  text-transform: uppercase;
}
.hero-title {
  font-family: var(--font-serif);
  font-size: clamp(4rem, 9vw, 8rem);
  font-weight: 300;
  letter-spacing: 0.06em;
  color: var(--color-white);
  line-height: 0.95;
  margin-bottom: 28px;
}
.hero-sub {
  font-family: var(--font-serif);
  font-size: clamp(0.96rem, 1.49vw, 1.17rem);
  font-weight: 300;
  font-style: italic;
  letter-spacing: 0.18em;
  color: rgba(225, 238, 248, 0.78);
  margin-top: 7px;
}

.scroll-hint {
  position: absolute;
  bottom: 44px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  z-index: 15;
  transition: opacity 0.3s ease;
  pointer-events: none;
}
.scroll-line {
  display: block;
  width: 1px;
  height: 52px;
  background: linear-gradient(to bottom, transparent, var(--color-accent));
  animation: scrollPulse 2.2s ease-in-out infinite;
}
@keyframes scrollPulse {
  0%, 100% { opacity: 0.3; transform: scaleY(1); }
  50%       { opacity: 1;   transform: scaleY(1.1); }
}
.scroll-label {
  font-family: var(--font-serif);
  font-size: 12px;
  font-weight: 300;
  letter-spacing: 0.45em;
  color: rgba(200,225,240,0.58);
  text-transform: uppercase;
  margin-top: 8px;
}

@media (max-width: 768px) {
  .hero-video   { object-fit: cover; }
  .hero-title   { font-size: clamp(2.8rem, 13vw, 5rem); margin-bottom: 16px; }
  .hero-sub     { font-size: clamp(0.85rem, 3.74vw, 1.06rem); letter-spacing: 0.10em; }
  .hero-tagline { font-size: 13px; margin-bottom: 12px; }
  .scroll-hint  { bottom: 28px; }
}
</style>
