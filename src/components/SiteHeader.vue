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
      <nav class="header-nav">
        <a href="#" @click.prevent="scrollTo('inicio')">Inicio</a>
        <a href="#" @click.prevent="scrollTo('arquitectos')">Arquitectos</a>
        <a href="#" @click.prevent="scrollTo('location')">Ubicación</a>
        <a href="#" @click.prevent="scrollTo('gaussian')">Modelo 3D</a>
        <a href="#" @click.prevent="scrollTo('restaurante')">Restaurante</a>
        <a href="#" @click.prevent="scrollTo('tarifas')">Tarifas</a>
        <a href="#" @click.prevent="openGallery">Galería</a>
        <a href="#" @click.prevent="scrollTo('contact')" class="nav-contact">Contacto</a>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue"
const headerVisible = ref(false)
const scrollTo = (id) => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }) }
const openGallery = () => { window.dispatchEvent(new CustomEvent("open-gallery")) }
const onScroll = () => { headerVisible.value = window.scrollY > 80 }
onMounted(() => { window.addEventListener("scroll", onScroll, { passive: true }) })
onUnmounted(() => { window.removeEventListener("scroll", onScroll) })
</script>

<style scoped>
.site-header {
  position: fixed; top: 0; left: 0; width: 100%; z-index: 100;
  padding: 0 56px; height: 72px; display: flex; align-items: center;
  background: rgba(2,6,14,0.6);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(122,180,212,0.1);
  transform: translateY(-100%); opacity: 0;
  transition: transform 0.65s cubic-bezier(0.16,1,0.3,1), opacity 0.65s ease;
}
.site-header.visible { transform: translateY(0); opacity: 1; }
.header-inner { display: flex; align-items: center; justify-content: space-between; width: 100%; }
.header-left  { display: flex; align-items: center; gap: 14px; }
.logo-mark svg { width: 34px; height: 34px; }
.brand-name   { display: flex; flex-direction: column; line-height: 1; }
.brand-main   { font-family: var(--font-serif); font-size: 14px; font-weight: 400; letter-spacing: 0.3em; color: var(--color-white); }
.brand-sub    { font-family: var(--font-jp); font-size: 11px; font-weight: 200; letter-spacing: 0.2em; color: var(--color-accent); margin-top: 3px; }
.header-nav   { display: flex; align-items: center; gap: 24px; }
.header-nav a { font-family: var(--font-serif); font-size: 11.5px; font-weight: 400; letter-spacing: 0.20em; color: rgba(200,225,240,0.65); text-decoration: none; text-transform: uppercase; transition: color 0.3s ease; position: relative; }
.header-nav a::after { content: ""; position: absolute; bottom: -3px; left: 0; width: 0; height: 1px; backgro