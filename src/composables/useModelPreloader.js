import { ref } from 'vue'

const GLB_URL = 'https://pub-c06678eb8f2c47aeaf4b1a80eef991aa.r2.dev/assets/3D/Maqueta.glb'

// ── Shared reactive state (module-level singleton) ──────────────────────────
export const glbLoadPct = ref(0)    // 0–100, raw download progress
export const glbBlobUrl = ref(null) // ObjectURL once fully downloaded

let _loading = false

// ── Kick off the download (idempotent — safe to call multiple times) ────────
export function startGlbPreload () {
  if (_loading || glbBlobUrl.value) return
  _loading = true

  const xhr = new XMLHttpRequest()
  xhr.open('GET', GLB_URL, true)
  xhr.responseType = 'blob'

  xhr.onprogress = (e) => {
    if (e.lengthComputable) {
      glbLoadPct.value = Math.min(99, Math.round((e.loaded / e.total) * 100))
    }
  }

  xhr.onload = () => {
    if (xhr.status === 200) {
      glbBlobUrl.value = URL.createObjectURL(xhr.response)
      glbLoadPct.value = 100
    }
    _loading = false
  }

  xhr.onerror  = () => { _loading = false }
  xhr.onabort  = () => { _loading = false }

  xhr.send()
}
