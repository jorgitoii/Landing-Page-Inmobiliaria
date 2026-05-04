<template>
  <header :class="['site-header', { visible: headerVisible }]">
    <div class="header-inner">
      <div class="header-left">
        <div class="logo-mark">
          <svg viewBox="0 0 48 48" fill="none">
            <rect x="4" y="4" width="40" height="40" stroke="#7ab4d4" stroke-width="1"/>
            <line x1="24" y1="4" x2="24" y2="44" stroke="#7ab4d4" stroke-width="0.5"/>
            <line x1="4" y1="24" x2="44" y2="24" stroke="#7ab4d4" stroke-width="0.5"/>
            <circle cx="24" cy="24" r="8" stroke="#7ab4d4" stroke-width="1"/>
          </svg>
        </div>
        <div class="brand-name">
          <span class="brand-main">HOTEL LAIN</span>
          <span class="brand-sub">Rain Hotel</span>
        </div>
      </div>

      <!-- Desktop nav -->
      <nav class="header-nav">
        <a href="#" @click.prevent="scrollTo('inicio')">Inicio</a>
        <a href="#" @click.prevent="scrollTo('arquitectos')">Arquitectos</a>

        <!-- Galería con dropdown hover -->
        <div
          class="nav-dropdown-wrap"
          @mouseenter="galleryOpen = true"
          @mouseleave="galleryOpen = false"
        >
          <a href="#" @click.prevent class="nav-dropdown-trigger">
            Galería
            <svg class="nav-chevron" viewBox="0 0 12 8" fill="none">
              <path d="M1 1.5l5 5 5-5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
            </svg>
          </a>
          <Transition name="dropdown-fade">
            <div class="nav-dropdown" v-if="galleryOpen">
              <a href="#" @click.prevent="scrollTo('galeria'); galleryOpen = false">
                <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.2">
                  <circle cx="9" cy="9" r="7"/>
                  <ellipse cx="9" cy="9" rx="7" ry="3"/>
                  <line x1="9" y1="2" x2="9" y2="16"/>
                </svg>
                Panorámicas
              </a>
              <a href="#" @click.prevent="openGallery(); galleryOpen = false">
                <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.2">
                  <rect x="1" y="3" width="16" height="12" rx="1"/>
                  <circle cx="6" cy="8" r="1.5"/>
                  <path d="M1 13l4-4 3 3 3-4 5 5"/>
                </svg>
                Colección completa
              </a>
            </div>
          </Transition>
        </div>

        <a href="#" @click.prevent="scrollTo('location')">Ubicación</a>
        <a href="#" @click.prevent="scrollTo('restaurante')">Restaurante</a>
        <a href="#" @click.prevent="scrollTo('tarifas')">Tarifas</a>
        <a href="#" @click.prevent="scrollTo('gaussian')">Portal</a>
        <a href="#" @click.prevent="scrollTo('contact')" class="nav-contact">Contacto</a>
      </nav>

      <!-- CITA button (mobile only) -->
      <button class="btn-test-appt btn-cita-mobile" @click="openAppointment">
        <svg viewBox="0 0 20 20" fill="none" stroke="white" stroke-width="1.5">
          <rect x="3" y="4" width="14" height="13" rx="1"/>
          <path d="M3 8h14M7 2v3M13 2v3"/>
        </svg>
        CITA
      </button>

      <!-- Hamburger (mobile only) -->
      <button class="hamburger" @click="menuOpen = !menuOpen" :class="{ open: menuOpen }" aria-label="Menú">
        <span></span><span></span><span></span>
      </button>
    </div>

    <!-- Mobile menu -->
    <Transition name="mob-menu">
      <nav class="mobile-nav" v-if="menuOpen" @click="menuOpen = false">
        <a href="#" @click.prevent="nav('inicio')">Inicio</a>
        <a href="#" @click.prevent="nav('arquitectos')">Arquitectos</a>
        <a href="#" @click.prevent="nav('location')">Ubicación</a>
        <a href="#" @click.prevent="nav('restaurante')">Restaurante</a>
        <a href="#" @click.prevent="nav('tarifas')">Tarifas</a>
        <a href="#" @click.prevent="nav('gaussian')">Portal</a>
        <a href="#" @click.prevent="nav('galeria')">Panorámicas</a>
        <a href="#" @click.prevent="navGallery">Colección completa</a>
        <a href="#" @click.prevent="nav('contact')" class="nav-contact">Contacto</a>
      </nav>
    </Transition>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue"
const headerVisible = ref(false)
const menuOpen      = ref(false)
const galleryOpen   = ref(false)
const scrollTo      = (id) => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }) }
const openGallery      = () => { window.dispatchEvent(new CustomEvent("open-gallery")) }
const openAppointment  = () => { window.dispatchEvent(new CustomEvent("open-appointment")) }
const nav           = (id) => { menuOpen.value = false; setTimeout(() => scrollTo(id), 180) }
const navGallery    = ()   => { menuOpen.value = false; setTimeout(openGallery, 180) }
const onScroll      = () => { headerVisible.value = window.scrollY > 80 }
onMounted(() => { window.addEventListener("scroll", onScroll, { passive: true }) })
onUnmounted(() => { window.removeEventListener("scroll", onScroll) })
</script>

<style scoped>
.site-header {
  position: fixed; top: 0; left: 0; width: 100%; z-index: 100;
  padding: 0 56px;
  background: rgba(2,6,14,0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(122,180,212,0.1);
  transform: translateY(-100%); opacity: 0;
  transition: transform 0.65s cubic-bezier(0.16,1,0.3,1), opacity 0.65s ease;
}
.site-header.visible { transform: translateY(0); opacity: 1; }

.header-inner {
  display: flex; align-items: center; justify-content: space-between;
  width: 100%; height: 72px;
}
.header-left  { display: flex; align-items: center; gap: 14px; }
.logo-mark svg { width: 34px; height: 34px; }
.brand-name   { display: flex; flex-direction: column; line-height: 1; }
.brand-main   { font-family: var(--font-serif); font-size: 14px; font-weight: 400; letter-spacing: 0.3em; color: var(--color-white); }
.brand-sub    { font-family: var(--font-jp); font-size: 11px; font-weight: 200; letter-spacing: 0.2em; color: var(--color-accent); margin-top: 3px; }

/* Desktop nav */
.header-nav   { display: flex; align-items: center; gap: 8px; }
.header-nav a { font-family: var(--font-serif); font-size: 11.5px; font-weight: 400; letter-spacing: 0.20em; color: rgba(200,225,240,0.65); text-decoration: none; text-transform: uppercase; transition: color 0.3s ease; position: relative; padding: 10px 12px; }
.header-nav a::after { content: ""; position: absolute; bottom: -3px; left: 0; width: 0; height: 1px; background: var(--color-accent); transition: width 0.35s ease; }
.header-nav a:hover { color: rgba(200,225,240,1); }
.header-nav a:hover::after { width: 100%; }
.nav-contact { color: var(--color-accent) !important; opacity: 0.9; }

/* Dropdown Galería */
.nav-dropdown-wrap {
  position: relative;
}
.nav-dropdown-trigger {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: default !important;
}
.nav-chevron {
  width: 10px; height: 10px;
  transition: transform 0.3s ease;
  opacity: 0.6;
}
.nav-dropdown-wrap:hover .nav-chevron { transform: rotate(180deg); opacity: 1; }

.nav-dropdown {
  position: absolute; top: 100%; left: 50%;
  transform: translateX(-50%);
  background: rgba(2,6,14,0.6);
  border: 1px solid rgba(122,180,212,0.1);
  min-width: 0;
  width: max-content;
  padding: 0;
  display: flex; flex-direction: column;
}
.nav-dropdown a {
  display: flex; align-items: center; gap: 10px;
  padding: 16px 24px;
  font-size: 11px; letter-spacing: 0.18em;
  color: rgba(200,225,240,0.7) !important;
  white-space: nowrap;
  transition: color 0.25s, background 0.25s;
}
.nav-dropdown a:hover {
  color: rgba(200,225,240,1) !important;
  background: rgba(122,180,212,0.07);
}
.nav-dropdown a svg { width: 15px; height: 15px; flex-shrink: 0; opacity: 0.75; }
.nav-dropdown a::after { display: none !important; }

/* Dropdown transition */
.dropdown-fade-enter-active, .dropdown-fade-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.dropdown-fade-enter-from, .dropdown-fade-leave-to { opacity: 0; transform: translateX(-50%) translateY(-6px); }

/* Hamburger */
.hamburger {
  display: none;
  flex-direction: column; justify-content: space-between;
  width: 28px; height: 18px;
  background: none; border: none; cursor: pointer; padding: 0;
}
.hamburger span {
  display: block; width: 100%; height: 1px;
  background: rgba(200,225,240,0.75);
  transition: transform 0.35s ease, opacity 0.25s ease;
}
.hamburger.open span:nth-child(1) { transform: translateY(8.5px) rotate(45deg); }
.hamburger.open span:nth-child(2) { opacity: 0; }
.hamburger.open span:nth-child(3) { transform: translateY(-8.5px) rotate(-45deg); }

/* Mobile nav */
.mobile-nav {
  display: flex; flex-direction: column;
  background: rgba(2,6,14,0.98);
  border-top: 1px solid rgba(122,180,212,0.1);
  padding: 16px 28px 24px;
  gap: 2px;
}
.mobile-nav a {
  font-family: var(--font-serif); font-size: 12px;
  letter-spacing: 0.22em; text-transform: uppercase;
  color: rgba(200,225,240,0.7); text-decoration: none;
  padding: 13px 0;
  border-bottom: 1px solid rgba(122,180,212,0.07);
  transition: color 0.25s;
}
.mobile-nav a:last-child { border-bottom: none; }
.mobile-nav a:hover { color: rgba(200,225,240,1); }
.mobile-nav .nav-contact { color: var(--color-accent) !important; }

/* Mobile menu transition */
.mob-menu-enter-active, .mob-menu-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.mob-menu-enter-from, .mob-menu-leave-to { opacity: 0; transform: translateY(-8px); }

/* Botón CITA */
.btn-cita-mobile { display: none; }
.btn-test-appt {
  background: linear-gradient(160deg, #4a1020 0%, #6e1e30 100%);
  color: white; border: none;
  padding: 6px 10px; font-size: 11px; cursor: pointer; font-weight: 400;
  font-family: var(--font-serif); letter-spacing: 0.25em;
  display: inline-flex; align-items: center; gap: 6px;
}
.btn-test-appt svg { width: 17px; height: 17px; }

/* Responsive */
@media (max-width: 900px) {
  .site-header { padding: 0 24px; }
  .header-nav  { display: none; }
  .hamburger   { display: flex; }
  .btn-cita-mobile { display: inline-flex; }
}
</style>
