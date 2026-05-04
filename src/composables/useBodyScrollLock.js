/**
 * Body scroll lock — evita que el fondo scrollee cuando hay un modal abierto.
 * Técnica overflow:hidden pura — no mueve el scroll position, sin recorrido al cerrar.
 */

let _lockCount = 0

export function lockBodyScroll () {
  _lockCount++
  if (_lockCount > 1) return   // ya bloqueado por otro modal
  document.body.style.overflow = 'hidden'
}

export function unlockBodyScroll () {
  _lockCount = Math.max(0, _lockCount - 1)
  if (_lockCount > 0) return   // todavía hay otro modal abierto
  document.body.style.overflow = ''
}
