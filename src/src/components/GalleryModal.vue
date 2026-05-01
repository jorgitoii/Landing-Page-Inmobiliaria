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
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const open = ref(false)
const activeTab = ref('exterior')
const lightbox = ref({ open: false, src: '', alt: '' })

const tabs = [
  { id: 'exterior', label: 'Exterior' },
  { id: 'interior', label: 'Interior' },
  { id: 'lobby', label: 'Lobby' },
]

const allImages = {
  exterior: [
    { src: '/assets/Imagenes/Exterior/Exterior3.png', alt: 'Exterior — Amanecer' },
    { src: '/assets/Imagenes/Exterior/Exterior4.png', alt: 'Exterior — Jardín' },
    { src: '/assets/Imagenes/Exterior/Exterior5.png', alt: 'Exterior — Noche' },
    { src: '/assets/Imagenes/Exterior/Exterior2.png', alt: 'Exterior — Fachada' },
  ],
  interior: [
    { src: '/assets/Imagenes/Interior/Interior2.png', alt: 'Interior — Suite' },
    { src: '/assets/Imagenes/Interior/Interior3.png', alt: 'Interior — Sala' },
    { src: '/assets/Imagenes/Interior/Interior4.png', alt: 'Interior — Baño' },
    { src: '/assets/Imagenes/Interior/Interior1.png', alt: 'Interior — Habitación' },
  ],
  lobby: [
    { src: '/assets/Imagenes/Lobby/Lobby2.png', alt: 'Lobby — Recepción' },
    { src: '/assets/Imagenes/Lobby/Lobby1.png', alt: 'Lobby — Acceso' },
  ],
}

const currentImages = computed(() => allImages[activeTab.value] || [])

const close = () => { open.value = false }
const openLightbox = (img) => { lightbox.value = { open: true, ...img } }
const closeLightbox = () => { lightbox.value.open = false }

const onGalleryEvent = () => { open.value = true }

onMounted(() => {
  window.addEventListener('open-gallery', onGalleryEvent)
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') { close(); closeLightbox() } })
})
onUnmounted(() => {
  window.removeEventListener('open-gallery', onGalleryEvent)
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
  color: rgba(255,255,255,0.4);
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
</style>
