/**
 * Body scroll lock — evita que el fondo scrollee cuando hay un modal abierto.
 * Técnica position:fixed para preservar la posición de scroll al desbloquear.
 */

let _savedScrollY = 0
let _lockCount    = 0

export function lockBodyScroll () {
  _lockCount++
  if (_lockCount > 1) return   // ya bloqueado por otro modal
  _savedScrollY = window.scrollY
  const body = document.body
  body.style.overflow = 'hidden'
  body.style.position = 'fixed'
  body.style.top      = `-${_savedScrollY}px`
  body.style.width    = '100%'
}

export function unlockBodyScroll () {
  _lockCount = Math.max(0, _lockCount - 1)
  if (_lockCount > 0) return   // todavía hay otro modal abierto
  const body = document.body
  body.style.overflow = ''
  body.style.position = ''
  body.style.top      = ''
  body.style.width    = ''
  window.scrollTo(0, _savedScrollY)
}
