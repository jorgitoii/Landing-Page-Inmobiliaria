<template>
  <section class="arch-section" ref="sectionEl" id="arquitectos">
    <div class="arch-bg" :style="bgStyle">
      <img src="https://pub-c06678eb8f2c47aeaf4b1a80eef991aa.r2.dev/assets/Imagenes/Arquitectos/Arquitectos_large.png" alt="Arquitectos" />
      <div class="arch-overlay"></div>
    </div>
    <!-- Overlay de entrada oscura — se desvanece al entrar en viewport (como Hero inicial) -->
    <div class="arch-intro-overlay" :style="{ opacity: introOp }"></div>
    <div class="arch-text">
      <span class="arch-signed" :class="{ visible: tv }">signed by</span>
      <span class="arch-liebheart">
        <span v-for="(ch,i) in chars" :key="i" class="arch-char"
          :class="{ typed: cv[i] }" :style="cs(i)">{{ ch }}</span>
      </span>
      <span class="arch-architects" :class="{ visible: tv }">architects</span>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
const sectionEl = ref(null)
const tv      = ref(false)   // textVisible
const cv      = ref([])      // charVisible
const sp      = ref(0)       // scrollProgress
const introOp = ref(1)       // overlay oscuro inicial (1=negro → 0=transparente)

const chars = 'Liebheart'.split('')
cv.value = Array(chars.length).fill(false)
const cs = (i) => ({ transitionDelay: (i * 0.065) + 's' })

const bgStyle = computed(() => ({
  transform: 'scale(' + (1.04 - sp.value * 0.04) + ') translateY(' + (sp.value * -20) + 'px)'
}))

const onScroll = () => {
  if (!sectionEl.value) return
  const r  = sectionEl.value.getBoundingClientRect()
  const vh = window.innerHeight
  sp.value = Math.max(0, Math.min(1, (vh - r.top) / (vh + r.height)))

  // Discovery overlay: opacidad 1 hasta que el usuario pisa el 10% de la sección
  const enterProgress = (vh - r.top) / r.height
  introOp.value = Math.max(0, 1 - enterProgress / 0.10)

  if (r.top < vh * 0.8 && !tv.value) {
    tv.value = true
    setTimeout(() => {
      chars.forEach((_, i) => setTimeout(() => { cv.value[i] = true }, 203 + i * 92))
    }, 1000)
  }
}
onMounted(() => { window.addEventListener('scroll', onScroll, { passive: true }); onScroll() })
onUnmounted(() => { window.removeEventListener('scroll', onScroll) })
</script>

<style scoped>
/* Section height respects 3296x973 ratio (3.39:1) */
.arch-section {
  position: relative;
  width: 100%;
  /* at full width, natural height = width/3.39. Use aspect-ratio */
  aspect-ratio: 3296 / 973;
  min-height: 320px;
  max-height: 60vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.arch-bg {
  position: absolute; inset: -3%;
  will-change: transform; transition: transform 0.12s linear;
}
.arch-bg img {
  width: 100%; height: 100%;
  object-fit: cover;
  object-position: center center;
  filter: brightness(0.52) saturate(0.6) hue-rotate(190deg);  /* +30% brillo: 0.4×1.3 */
}
.arch-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(90deg,
    rgba(2,6,14,0.7) 0%,
    rgba(3,8,18,0.2) 30%,
    rgba(3,8,18,0.2) 70%,
    rgba(2,6,14,0.7) 100%);
}
.arch-intro-overlay {
  position: absolute; inset: 0; z-index: 3;
  background: var(--color-black);
  pointer-events: none;
  transition: opacity 0.9s ease;
}
.arch-text {
  position: relative; z-index: 4;
  display: flex; flex-direction: column;
  align-items: center; text-align: center;
  pointer-events: none; gap: 0;
}
.arch-signed {
  font-family: var(--font-serif); font-style: italic;
  font-size: clamp(0.85rem, 1.6vw, 1.3rem); font-weight: 300;
  letter-spacing: 0.28em; color: rgba(200,225,240,0.65);
  opacity: 0; transform: translateY(12px);
  transition: opacity 0.8s ease, transform 0.8s ease; margin-bottom: 4px;
}
.arch-signed.visible { opacity: 1; transform: translateY(0); }
.arch-liebheart {
  display: flex; font-family: var(--font-serif); font-style: italic;
  font-size: clamp(2.5rem, 6vw, 6rem); font-weight: 300;
  color: #7ab4d4; letter-spacing: 0.03em; line-height: 1.1;
}
.arch-char {
  display: inline-block; opacity: 0;
  transform: translateY(8px) scale(0.9);
  transition: opacity 0.49s ease, transform 0.49s cubic-bezier(0.16,1,0.3,1);
}
.arch-char.typed { opacity: 1; transform: translateY(0) scale(1); }
.arch-architects {
  font-family: var(--font-serif); font-style: italic;
  font-size: clamp(0.85rem, 1.6vw, 1.3rem); font-weight: 300;
  letter-spacing: 0.28em; color: rgba(200,225,240,0.65);
  opacity: 0; transform: translateY(-12px);
  transition: opacity 0.8s ease 0.55s, transform 0.8s ease 0.55s; margin-top: 4px;
}
.arch-architects.visible { opacity: 1; transform: translateY(0); }
</style>
