<template>
  <footer class="site-footer" id="contact">
    <div class="footer-top">
      <div class="footer-brand">
        <div class="footer-logo">
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="4" width="40" height="40" stroke="#7ab4d4" stroke-width="1"/>
            <line x1="24" y1="4" x2="24" y2="44" stroke="#7ab4d4" stroke-width="0.5"/>
            <line x1="4" y1="24" x2="44" y2="24" stroke="#7ab4d4" stroke-width="0.5"/>
            <circle cx="24" cy="24" r="8" stroke="#7ab4d4" stroke-width="1"/>
          </svg>
        </div>
        <div>
          <p class="footer-brand-main">HOTEL LAIN</p>
          <p class="footer-brand-jp">レイン　ホテル</p>
          <p class="footer-brand-tagline">La paz se respira aquí</p>
        </div>
      </div>

      <div class="footer-cols">
        <div class="footer-col">
          <p class="footer-col-title">Contacto</p>
          <a href="mailto:reservas@hotellain.jp">reservas@hotellain.jp</a>
          <a href="tel:+81123456789">+81 123 456 789</a>
          <p class="footer-address">Bosque de Shirakawa, Gifu, Japón</p>
        </div>

        <div class="footer-col">
          <p class="footer-col-title">Navegar</p>
          <a href="#" @click.prevent="scrollTo('location')">Ubicación</a>
          <a href="#" @click.prevent="openGallery">Galería</a>
          <a href="#">Reservaciones</a>
        </div>

        <div class="footer-col">
          <p class="footer-col-title">Proyecto</p>
          <p>Arquitectura: Liebheart Architects</p>
          <p>Diseño de interiores: Lain Studio</p>
          <p>Apertura: 2026</p>
        </div>
      </div>
    </div>

    <div class="footer-divider"></div>

    <div class="footer-bottom">
      <p class="footer-copy">© 2026 Hotel Lain — Todos los derechos reservados</p>
      <p class="footer-kanji">静寂は、ここに宿る</p>
    </div>
  </footer>
</template>

<script setup>
const scrollTo = (id) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}
const openGallery = () => {
  window.dispatchEvent(new CustomEvent('open-gallery'))
}
</script>

<style scoped>
.site-footer {
  background: linear-gradient(180deg, var(--color-bg-mid) 0%, var(--color-black) 100%);
  border-top: 1px solid rgba(122,180,212,0.1);
  padding: 100px 0 52px;
}

.footer-top {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 48px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 60px;
  flex-wrap: wrap;
}

.footer-brand {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  flex-shrink: 0;
}

.footer-logo svg {
  width: 44px;
  height: 44px;
}

.footer-brand-main {
  font-family: var(--font-serif);
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 0.35em;
  color: var(--color-white);
}

.footer-brand-jp {
  font-family: var(--font-jp);
  font-size: 10px;
  font-weight: 200;
  letter-spacing: 0.3em;
  color: var(--color-accent);
  margin-top: 3px;
}

.footer-brand-tagline {
  font-family: var(--font-serif);
  font-size: 11px;
  font-weight: 300;
  ;
  color: rgba(255,255,255,0.35);
  margin-top: 10px;
}

.footer-cols {
  display: flex;
  gap: 60px;
  flex-wrap: wrap;
}

.footer-col {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 160px;
}

.footer-col-title {
  font-family: var(--font-serif);
  font-size: 10px;
  font-weight: 400;
  letter-spacing: 0.4em;
  color: var(--color-accent);
  text-transform: uppercase;
  margin-bottom: 6px;
}

.footer-col a,
.footer-col p {
  font-family: var(--font-serif);
  font-size: 13px;
  font-weight: 300;
  color: rgba(255,255,255,0.45);
  text-decoration: none;
  letter-spacing: 0.04em;
  transition: color 0.3s ease;
  line-height: 1.5;
}

.footer-col a:hover {
  color: var(--color-accent);
}

.footer-address {
  font-family: var(--font-serif);
  font-size: 13px;
  color: rgba(255,255,255,0.35);
  letter-spacing: 0.04em;
  line-height: 1.5;
  margin-top: 4px;
}

.footer-divider {
  max-width: 1200px;
  margin: 48px auto 32px;
  padding: 0 48px;
  height: 1px;
  background: rgba(255,255,255,0.06);
}

.footer-bottom {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 48px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.footer-copy {
  font-family: var(--font-serif);
  font-size: 11px;
  font-weight: 300;
  letter-spacing: 0.15em;
  color: rgba(255,255,255,0.2);
}

.footer-kanji {
  font-family: var(--font-jp);
  font-size: 12px;
  font-weight: 200;
  letter-spacing: 0.2em;
  color: rgba(122,180,212,0.3);
  ;
}
</style>
