<template>
  <section class="intro-canvas" ref="introEl">
    <div class="intro-text-wrap" :class="{ 'slide-out': slidOut }">
      <div class="intro-lines">
        <span
          v-for="(line, i) in lines"
          :key="i"
          class="intro-line"
          :class="{ visible: lineVisible[i] }"
          :style="{ transitionDelay: `${i * 0.28}s` }"
        >{{ line }}</span>
      </div>
    </div>

    <div class="brand-transform" :class="{ visible: brandVisible, 'slide-in': slidOut }">
      <span class="brand-t-hotel">Hotel</span>
      <span class="brand-t-lain">Lain</span>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const introEl = ref(null)
const lines = ['La paz', 'se respira', 'aquí...']
const lineVisible = ref([false, false, false])
const slidOut = ref(false)
const brandVisible = ref(false)

onMounted(() => {
  // Animate lines in sequence
  lines.forEach((_, i) => {
    setTimeout(() => {
      lineVisible.value[i] = true
    }, 600 + i * 320)
  })

  // After all lines shown, wait then trigger slide-out + brand reveal
  setTimeout(() => {
    slidOut.value = true
    brandVisible.value = true
  }, 2400)

  // Observe scroll to manage hero reveal
  const handleScroll = () => {
    if (introEl.value) {
      const progress = window.scrollY / window.innerHeight
      if (progress > 0.1) {
        slidOut.value = true
        brandVisible.value = true
      }
    }
  }
  window.addEventListener('scroll', handleScroll, { passive: true })
  onUnmounted(() => window.removeEventListener('scroll', handleScroll))
})
</script>

<style scoped>
.intro-canvas {
  position: relative;
  width: 100%;
  height: 100vh;
  background: var(--color-black);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.intro-text-wrap {
  position: absolute;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  transform: translateX(0);
  transition: transform 1.1s cubic-bezier(0.76, 0, 0.24, 1), opacity 1.1s ease;
}

.intro-text-wrap.slide-out {
  transform: translateX(45vw);
  opacity: 0;
  pointer-events: none;
}

.intro-lines {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.15em;
}

.intro-line {
  display: block;
  font-family: var(--font-serif);
  font-size: clamp(2.8rem, 6vw, 5.5rem);
  font-weight: 300;
  color: var(--color-white);
  letter-spacing: 0.04em;
  line-height: 1.15;
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.7s ease, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}

.intro-line.visible {
  opacity: 1;
  transform: translateY(0);
}

.brand-transform {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  opacity: 0;
  transform: translateX(60px);
  transition: opacity 0.9s ease 0.2s, transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.2s;
  pointer-events: none;
}

.brand-transform.visible {
  opacity: 1;
}

.brand-transform.slide-in {
  transform: translateX(0);
  pointer-events: auto;
}

.brand-t-hotel {
  font-family: var(--font-serif);
  font-size: clamp(1.4rem, 3vw, 2.6rem);
  font-weight: 300;
  letter-spacing: 0.35em;
  color: rgba(255,255,255,0.6);
  text-transform: uppercase;
}

.brand-t-lain {
  font-family: var(--font-serif);
  font-size: clamp(3.5rem, 8vw, 7rem);
  font-weight: 300;
  letter-spacing: 0.08em;
  color: var(--color-white);
  line-height: 0.9;
}
</style>
