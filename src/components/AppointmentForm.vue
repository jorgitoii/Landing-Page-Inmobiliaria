<template>
  <Teleport to="body">
    <Transition name="appt-fade">
      <div class="appt-overlay" v-if="open" @click.self="close">
        <div class="appt-panel">

          <!-- Header del panel -->
          <div class="appt-header">
            <button class="appt-back" @click="close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
            </button>
            <div class="appt-title-wrap">
              <p class="appt-eyebrow">Hotel Lain</p>
              <h2 class="appt-title">Agendar estancia</h2>
            </div>
          </div>

          <div class="appt-rule"></div>

          <!-- Formulario -->
          <form class="appt-form" @submit.prevent="onSubmit">

            <div class="appt-row">
              <div class="appt-field">
                <label>Nombre completo</label>
                <input type="text" v-model="form.name" placeholder="Tu nombre" required />
              </div>
              <div class="appt-field">
                <label>Correo electrónico</label>
                <div class="email-wrap" v-click-outside="() => showEmailDrop = false">
                  <input
                    type="email"
                    v-model="form.email"
                    placeholder="correo@ejemplo.com"
                    required
                    autocomplete="off"
                    @input="onEmailInput"
                    @keydown.down.prevent="emailFocus = Math.min(emailFocus + 1, emailSuggestions.length - 1)"
                    @keydown.up.prevent="emailFocus = Math.max(emailFocus - 1, 0)"
                    @keydown.enter.prevent="emailFocus >= 0 && emailSuggestions.length ? pickEmail(emailSuggestions[emailFocus]) : null"
                    @keydown.escape="showEmailDrop = false"
                  />
                  <Transition name="csel-drop">
                    <div class="email-drop" v-if="showEmailDrop && emailSuggestions.length">
                      <div
                        v-for="(sug, i) in emailSuggestions" :key="sug"
                        class="email-opt" :class="{ focused: i === emailFocus }"
                        @mousedown.prevent="pickEmail(sug)"
                      >
                        <span class="email-opt-user">{{ emailUser }}</span>
                        <span class="email-opt-domain">@{{ sug }}</span>
                      </div>
                    </div>
                  </Transition>
                </div>
              </div>
            </div>

            <div class="appt-row">
              <div class="appt-field">
                <label>Check-in</label>
                <input type="date" v-model="form.checkin" required />
              </div>
              <div class="appt-field">
                <label>Check-out</label>
                <input type="date" v-model="form.checkout" required />
              </div>
            </div>

            <div class="appt-row">
              <div class="appt-field">
                <label>Tipo de suite</label>
                <div class="csel" :class="{ open: openDropdown === 'suite', error: formErrors.suite }" v-click-outside="() => closeDropdown('suite')">
                  <button type="button" class="csel-trigger" @click="toggleDropdown('suite')">
                    <span>{{ suiteLabel }}</span>
                    <svg class="csel-chevron" viewBox="0 0 12 8" fill="none">
                      <path d="M1 1.5l5 5 5-5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
                    </svg>
                  </button>
                  <Transition name="csel-drop">
                    <div class="csel-menu" v-if="openDropdown === 'suite'">
                      <div v-for="opt in suiteOpts.filter(o => o.value)" :key="opt.value"
                           class="csel-opt" :class="{ active: form.suite === opt.value }"
                           @click="pick('suite', opt.value)">{{ opt.label }}</div>
                    </div>
                  </Transition>
                </div>
              </div>
              <div class="appt-field">
                <label>Huéspedes</label>
                <div class="csel" :class="{ open: openDropdown === 'guests', error: formErrors.guests }" v-click-outside="() => closeDropdown('guests')">
                  <button type="button" class="csel-trigger" @click="toggleDropdown('guests')">
                    <span>{{ guestsLabel }}</span>
                    <svg class="csel-chevron" viewBox="0 0 12 8" fill="none">
                      <path d="M1 1.5l5 5 5-5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
                    </svg>
                  </button>
                  <Transition name="csel-drop">
                    <div class="csel-menu" v-if="openDropdown === 'guests'">
                      <div v-for="opt in guestsOpts.filter(o => o.value)" :key="opt.value"
                           class="csel-opt" :class="{ active: form.guests === opt.value }"
                           @click="pick('guests', opt.value)">{{ opt.label }}</div>
                    </div>
                  </Transition>
                </div>
              </div>
            </div>

            <div class="appt-field appt-field--full">
              <label>Notas o peticiones especiales</label>
              <textarea v-model="form.notes" rows="3" placeholder="Alergias, celebraciones, preferencias..."></textarea>
            </div>

            <div class="appt-submit-wrap">
              <button type="submit" class="appt-submit">
                <span>Enviar solicitud</span>
                <svg viewBox="0 0 20 20" fill="none">
                  <path d="M4 10h12M12 6l4 4-4 4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>

          </form>

          <!-- Scroll hint mobile -->
          <div class="scroll-hint-bar"></div>

        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Modal Alert -->
  <Teleport to="body">
    <div class="modal-alert-scene" v-if="showModal" ref="modalScene">
      <div class="modal-trees-wrap" ref="modalTreesEl"></div>
      <div class="modal-gradient" ref="modalGradientEl"></div>
      <div class="modal-msg" ref="modalMsgEl">
        <p class="modal-eyebrow">Hotel Lain</p>
        <h2 class="modal-title">Tu estancia ha sido agendada</h2>
        <p class="modal-sub">Nos pondremos en contacto en menos de 24 horas</p>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import gsap from 'gsap'

/* ── Directiva click-outside ── */
const vClickOutside = {
  mounted(el, binding) {
    el._outside = e => { if (!el.contains(e.target)) binding.value(e) }
    document.addEventListener('mousedown', el._outside)
  },
  unmounted(el) { document.removeEventListener('mousedown', el._outside) }
}

const open      = ref(false)
const submitted = ref(false)

/* ── Modal Alert ── */
const showModal      = ref(false)
const modalScene     = ref(null)
const modalTreesEl   = ref(null)
const modalGradientEl= ref(null)
const modalMsgEl     = ref(null)

const TREE_URL = 'https://pub-c06678eb8f2c47aeaf4b1a80eef991aa.r2.dev/assets/Imagenes/Iconos/Modal_alert/arbol.webp'

const runModalAnim = async () => {
  await nextTick()
  const container = modalTreesEl.value
  if (!container) return

  gsap.set(modalGradientEl.value, { opacity: 0 })
  gsap.set(modalMsgEl.value,      { opacity: 0, y: 24, xPercent: -50, yPercent: -50 })

  const NUM_TREES  = 20
  const COVERAGE   = 100  // % del ancho que deben cubrir
  const segmentW   = COVERAGE / NUM_TREES  // 5% por segmento

  // Índices mezclados para que el stagger no siga un orden izq→der
  const order = Array.from({ length: NUM_TREES }, (_, i) => i)
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]]
  }

  const trees = []
  for (let i = 0; i < NUM_TREES; i++) {
    const img = document.createElement('img')
    img.src = TREE_URL
    img.className = 'modal-tree'
    const scale    = gsap.utils.random(0.2, 0.9)
    const opacity  = gsap.utils.random(0.35, 1.0)
    // Posición dentro de su segmento + jitter de ±1.5%
    const segStart = order[i] * segmentW
    const leftPos  = segStart + gsap.utils.random(0, segmentW) + gsap.utils.random(-1.5, 1.5)
    const yOffset  = gsap.utils.random(-3, 5)
    gsap.set(img, { left: `${leftPos}%`, scale, opacity, yPercent: 100, zIndex: Math.floor(scale * 10) })
    container.appendChild(img)
    trees.push({ element: img, targetY: yOffset })
  }

  const tl = gsap.timeline()

  // Fondo sube de 0.20 a 0.60
  tl.to(modalScene.value, { backgroundColor: 'rgba(2,5,12,0.60)', duration: 6.0, ease: 'power1.inOut' }, 0)

  // Árboles emergen
  trees.forEach(t => {
    tl.to(t.element, {
      yPercent: 0, y: t.targetY,
      duration: gsap.utils.random(1.9, 2.3),
      ease: 'power3.out'
    }, '<0.08')
  })

  // Gradiente entra 0.4s antes que el texto para preparar legibilidad
  tl.to(modalGradientEl.value, { opacity: 1, duration: 1.8, ease: 'power2.inOut' }, 2.8)
  tl.to(modalMsgEl.value,      { opacity: 1, y: 0, duration: 3.0, ease: 'power3.out' }, 3.2)

  // ── Salida ── texto pleno en 5.0s + 4s de protagonismo = 9.0s
  tl.addLabel('exit', 9.0)

  // Texto y gradiente desaparecen juntos
  tl.to(modalMsgEl.value,      { opacity: 0, y: -16, duration: 1.0, ease: 'power2.in' }, 'exit')
  tl.to(modalGradientEl.value, { opacity: 0, duration: 1.0, ease: 'power2.in' }, 'exit')

  // Árboles descienden (stagger aleatorio)
  trees.forEach(t => {
    tl.to(t.element, {
      yPercent: 110,
      duration: gsap.utils.random(1.0, 2.0),
      ease: 'power2.in'
    }, `exit+=${gsap.utils.random(0, 0.6)}`)
  })

  // Fondo baja a 0
  tl.to(modalScene.value, { backgroundColor: 'rgba(2,5,12,0)', duration: 1.5, ease: 'power2.in' }, 'exit+=0.8')
}

const form = reactive({
  name: '', email: '', checkin: '', checkout: '',
  suite: '', guests: '', notes: ''
})

/* ── Email autocomplete ── */
const emailDomains = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'icloud.com', 'live.com', 'msn.com', 'me.com']
const showEmailDrop = ref(false)
const emailFocus    = ref(0)
const emailUser     = ref('')

const emailSuggestions = computed(() => {
  if (!showEmailDrop.value) return []
  const afterAt = form.email.split('@')[1] ?? ''
  return afterAt
    ? emailDomains.filter(d => d.startsWith(afterAt))
    : emailDomains
})

const onEmailInput = () => {
  const atIdx = form.email.indexOf('@')
  if (atIdx !== -1) {
    emailUser.value   = form.email.slice(0, atIdx)
    showEmailDrop.value = true
    emailFocus.value    = 0
  } else {
    showEmailDrop.value = false
  }
}

const pickEmail = (domain) => {
  const user = form.email.split('@')[0]
  form.email = `${user}@${domain}`
  showEmailDrop.value = false
}

/* ── Custom selects ── */
const openDropdown = ref(null)
const toggleDropdown = k => { openDropdown.value = openDropdown.value === k ? null : k }
const closeDropdown  = k => { if (openDropdown.value === k) openDropdown.value = null }
const pick = (k, v) => { form[k] = v; openDropdown.value = null }

const suiteOpts  = [
  { value: '',       label: 'Selecciona una opción' },
  { value: 'forest', label: 'Suite Bosque' },
  { value: 'onsen',  label: 'Suite Onsen' },
  { value: 'temple', label: 'Suite Templo' },
  { value: 'zen',    label: 'Suite Zen' },
]
const guestsOpts = [
  { value: '',  label: 'Selecciona una opción' },
  { value: '1', label: '1 huésped' },
  { value: '2', label: '2 huéspedes' },
  { value: '3', label: '3 huéspedes' },
  { value: '4', label: '4 huéspedes' },
]
const suiteLabel  = computed(() => suiteOpts.find(o => o.value === form.suite)?.label  || 'Selecciona una opción')
const guestsLabel = computed(() => guestsOpts.find(o => o.value === form.guests)?.label || 'Selecciona una opción')

const close = () => { open.value = false; submitted.value = false }

const formErrors = ref({})

const resetForm = () => {
  form.name = ''; form.email = ''; form.checkin = '';
  form.checkout = ''; form.suite = ''; form.guests = ''; form.notes = ''
  formErrors.value = {}
}

const slowScrollTo = (targetId) => {
  document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' })
}

const onSubmit = () => {
  formErrors.value = {}
  if (!form.suite)  formErrors.value.suite  = true
  if (!form.guests) formErrors.value.guests = true
  if (Object.keys(formErrors.value).length) return

  showModal.value = true
  runModalAnim()

  // Cierre gradual del formulario al 90% de la animación (~10.2s)
  setTimeout(() => {
    const overlay = document.querySelector('.appt-overlay')
    if (overlay) {
      overlay.style.transition = 'opacity 1.2s ease'
      overlay.style.opacity = '0'
      setTimeout(() => { open.value = false }, 1200)
    } else {
      open.value = false
    }
  }, 10200)

  // Scroll overlapping con el exit del modal (9.5s — 0.5s después del exit label)
  setTimeout(() => {
    slowScrollTo('inicio')
    setTimeout(() => {
      showModal.value = false
      resetForm()
    }, 1700)
  }, 9500)
}

const onEvent = () => { open.value = true; submitted.value = false }
const onKey   = e  => { if (e.key === 'Escape') close() }

onMounted(() => {
  window.addEventListener('open-appointment', onEvent)
  window.addEventListener('keydown', onKey)
})
onUnmounted(() => {
  window.removeEventListener('open-appointment', onEvent)
  window.removeEventListener('keydown', onKey)
})
</script>

<style scoped>
.appt-overlay {
  position: fixed; inset: 0; z-index: 300;
  background: rgba(2,5,12,0.7);
  backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
  padding: 24px;
}

.appt-panel {
  position: relative;
  background: rgba(4,10,24,0.55);
  border: 1px solid rgba(122,180,212,0.15);
  width: 100%; max-width: 680px;
  max-height: 90vh;
  overflow: hidden;
  padding: 36px 40px 40px;
}
.appt-panel::before {
  content: "";
  position: absolute; inset: -40px;
  background: url('https://pub-c06678eb8f2c47aeaf4b1a80eef991aa.r2.dev/assets/Imagenes/Estaticas/Exterior/Exterior3.png') center/cover no-repeat;
  filter: blur(70px) brightness(0.45);
  z-index: 0;
}
.appt-panel > * { position: relative; z-index: 1; }

/* ── Header ── */
.appt-header {
  display: flex; align-items: flex-start; gap: 20px;
  margin-bottom: 24px;
}
.appt-back {
  background: none; border: 1px solid rgba(122,180,212,0.2);
  color: rgba(200,225,240,0.65);
  width: 40px; height: 40px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.3s; margin-top: 4px;
}
.appt-back:hover { border-color: var(--color-accent); color: var(--color-accent); }
.appt-back svg   { width: 18px; height: 18px; }

.appt-eyebrow {
  font-family: var(--font-serif); font-size: 10px;
  letter-spacing: 0.5em; text-transform: uppercase;
  color: var(--color-accent); margin-bottom: 6px;
}
.appt-title {
  font-family: var(--font-serif); font-size: clamp(1.6rem, 3vw, 2.2rem);
  font-weight: 300; letter-spacing: 0.08em; color: var(--color-white);
}

.appt-rule {
  width: 100%; height: 1px;
  background: rgba(122,180,212,0.12);
  margin-bottom: 28px;
}

/* ── Form ── */
.appt-form { display: flex; flex-direction: column; gap: 20px; }

.appt-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.appt-field {
  display: flex; flex-direction: column; gap: 7px;
}
.appt-field--full { grid-column: 1 / -1; }

.appt-field label {
  font-family: var(--font-serif); font-size: 12px;
  letter-spacing: 0.35em; text-transform: uppercase;
  color: rgba(200,225,240,0.5);
}

.appt-field input,
.appt-field select,
.appt-field textarea {
  background: rgba(122,180,212,0.04);
  border: 1px solid rgba(122,180,212,0.15);
  color: rgba(200,225,240,0.9);
  font-family: var(--font-serif); font-size: 18px;
  padding: 12px 14px;
  outline: none;
  transition: border-color 0.3s;
  width: 100%;
}
.appt-field input:focus,
.appt-field select:focus,
.appt-field textarea:focus {
  border-color: rgba(122,180,212,0.45);
}
.appt-field input::placeholder,
.appt-field textarea::placeholder { color: rgba(200,225,240,0.2); }
.appt-field input[type="date"] {
  padding-right: 4px;
  accent-color: #7ab4d4;
  color-scheme: dark;
  -webkit-tap-highlight-color: transparent;
}
.appt-field input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(0.7) sepia(0.3) saturate(2) hue-rotate(180deg) brightness(1.4);
  cursor: pointer;
  opacity: 1;
  width: 32px;
  height: 32px;
  padding: 6px;
  margin: 0;
  border: 1px solid rgba(122,180,212,0.35);
  background-color: rgba(122,180,212,0.08);
  transition: background-color 0.25s, border-color 0.25s;
  box-sizing: border-box;
  border-radius: 0;
  margin-right: 9px;
}
.appt-field input[type="date"]::-webkit-calendar-picker-indicator:hover {
  background-color: rgba(122,180,212,0.18);
  border-color: var(--color-accent);
}
/* ── Email autocomplete ── */
.email-wrap { position: relative; }
.email-wrap input { width: 100%; }

.email-drop {
  position: absolute; top: calc(100% + 2px); left: 0; right: 0;
  z-index: 99;
  background: rgba(4,10,24,0.55);
  backdrop-filter: blur(32px);
  -webkit-backdrop-filter: blur(32px);
  border: 1px solid rgba(122,180,212,0.18);
  overflow: hidden;
}

.email-opt {
  padding: 11px 16px;
  font-family: var(--font-serif); font-size: 15px;
  color: rgba(200,225,240,0.7); cursor: pointer;
  transition: background 0.2s, color 0.2s;
  border-bottom: 1px solid rgba(122,180,212,0.06);
  display: flex; align-items: baseline; gap: 0;
}
.email-opt:last-child { border-bottom: none; }
.email-opt:hover,
.email-opt.focused { background: rgba(122,180,212,0.08); color: rgba(200,225,240,1); }

.email-opt-user   { color: rgba(200,225,240,0.4); font-size: 13px; }
.email-opt-domain { color: rgba(200,225,240,0.9); }
.email-opt.focused .email-opt-domain,
.email-opt:hover .email-opt-domain { color: var(--color-accent); }

/* ── Custom select ── */
.csel { position: relative; }

.csel-trigger {
  width: 100%; display: flex; align-items: center; justify-content: space-between;
  background: rgba(122,180,212,0.04);
  border: 1px solid rgba(122,180,212,0.15);
  color: rgba(200,225,240,0.9);
  font-family: var(--font-serif); font-size: 18px;
  padding: 12px 14px; cursor: pointer; text-align: left;
  transition: border-color 0.3s;
}
.csel-trigger:hover,
.csel.open .csel-trigger { border-color: rgba(122,180,212,0.45); }
.csel.error .csel-trigger { border-color: rgba(200,80,80,0.7); }
.csel.error .csel-trigger:hover { border-color: rgba(200,80,80,1); }

.csel-chevron {
  width: 11px; height: 11px; flex-shrink: 0; opacity: 0.5;
  transition: transform 0.3s ease;
}
.csel.open .csel-chevron { transform: rotate(180deg); opacity: 1; }

.csel-menu {
  position: absolute; top: calc(100% + 2px); left: 0; right: 0;
  z-index: 99;
  background: rgba(4,10,24,0.90);
  backdrop-filter: blur(32px);
  -webkit-backdrop-filter: blur(32px);
  border: 1px solid rgba(122,180,212,0.18);
  overflow: hidden;
}

.csel-opt {
  padding: 13px 16px;
  font-family: var(--font-serif); font-size: 16px;
  color: rgba(200,225,240,0.7); cursor: pointer;
  transition: background 0.2s, color 0.2s;
  border-bottom: 1px solid rgba(122,180,212,0.06);
}
.csel-opt:last-child { border-bottom: none; }
.csel-opt:hover  { background: rgba(122,180,212,0.08); color: rgba(200,225,240,1); }
.csel-opt.active { color: var(--color-accent); }

.csel-drop-enter-active, .csel-drop-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.csel-drop-enter-from,   .csel-drop-leave-to     { opacity: 0; transform: translateY(-6px); }
.appt-field textarea { resize: vertical; min-height: 80px; }

/* ── Submit ── */
.appt-submit-wrap { display: flex; justify-content: flex-end; margin-top: 4px; }
.appt-submit {
  display: inline-flex; align-items: center; gap: 10px;
  background: none; border: 1px solid rgba(122,180,212,0.35);
  color: rgba(200,225,240,0.75); padding: 12px 28px;
  font-family: var(--font-serif); font-size: 12px; font-weight: 300;
  letter-spacing: 0.38em; text-transform: uppercase;
  cursor: pointer; transition: all 0.35s;
}
.appt-submit:hover { border-color: var(--color-accent); color: var(--color-accent); background: rgba(122,180,212,0.06); }
.appt-submit svg   { width: 16px; height: 16px; transition: transform 0.3s; }
.appt-submit:hover svg { transform: translateX(4px); }

/* ── Transitions ── */
.appt-fade-enter-active, .appt-fade-leave-active { transition: opacity 0.35s ease; }
.appt-fade-enter-from,   .appt-fade-leave-to     { opacity: 0; }
/* ── Responsive ── */
@media (max-width: 600px) {
  .appt-panel {
    padding: 24px 20px 28px;
    overflow-y: auto;
    overflow-x: hidden;
  }
  .appt-row { grid-template-columns: 1fr; }

}

/* Scroll hint — solo mobile */
.scroll-hint-bar { display: none; }

@media (max-width: 600px) {
  .scroll-hint-bar {
    display: block;
    position: sticky;
    bottom: 0;
    left: 0; right: 0;
    height: 52px;
    margin-top: -52px;
    background: linear-gradient(to top, rgba(200,225,240,0.22) 0%, transparent 100%);
    pointer-events: none;
    z-index: 2;
    animation: scroll-hint 1.8s ease-in-out infinite;
  }
}

@keyframes scroll-hint {
  0%, 100% { opacity: 0.25; }
  50%       { opacity: 1; }
}

/* ── Modal Alert ── */
.modal-alert-scene {
  position: fixed; inset: 0; z-index: 500;
  background: rgba(2,5,12,0.20);
  overflow: hidden;
}

.modal-trees-wrap {
  position: absolute; bottom: 0; left: 0;
  width: 100%; height: 100%;
  pointer-events: none;
}

:global(.modal-tree) {
  position: absolute;
  bottom: 0;
  transform-origin: bottom center;
  will-change: transform;
  max-height: 55vh;
  width: auto;
}

.modal-gradient {
  position: absolute; inset: 0;
  background: linear-gradient(to bottom, rgba(2,5,12,0) 0%, rgba(2,5,12,1) 100%);
  opacity: 0;
  pointer-events: none;
  z-index: 10;
}

.modal-msg {
  position: absolute;
  top: 50%; left: 50%;
  text-align: center;
  opacity: 0;
  z-index: 20;
  width: 90%; max-width: 640px;
}

.modal-eyebrow {
  font-family: var(--font-serif);
  font-size: 11px;
  letter-spacing: 0.5em;
  text-transform: uppercase;
  color: var(--color-accent);
  margin-bottom: 18px;
}

.modal-title {
  font-family: var(--font-serif);
  font-size: clamp(1.8rem, 4vw, 3rem);
  font-weight: 300;
  letter-spacing: 0.07em;
  color: var(--color-white);
  line-height: 1.15;
  margin-bottom: 16px;
}

.modal-sub {
  font-family: var(--font-serif);
  font-size: 17px;
  font-weight: 300;
  letter-spacing: 0.22em;
  color: rgba(255,255,255,1);
  background: rgba(122,180,212,0.72);
  padding: 8px 18px;
  display: inline-block;
}
</style>
