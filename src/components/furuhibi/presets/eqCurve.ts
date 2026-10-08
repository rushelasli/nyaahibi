import type { PeqBand } from './presetsApi'

/**
 * Frequency-response curve for preset cards — the live preset.html math
 * ported verbatim (adapted from dsp.html, without the band dots). Colors
 * resolve from the hub theme's CSS variables at draw time so the graph
 * follows dark/light mode.
 */
const FS = 48000
const N_POINTS = 300
const DB_RANGE = 20
const F_MIN = 20
const F_MAX = 20000
const GRID_FREQS = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000]
const GRID_FREQS_L = ['20', '50', '100', '200', '500', '1k', '2k', '5k', '10k', '20k']
const GRID_DBS = [-18, -12, -6, -3, 0, 3, 6, 12, 18]

interface Coeff {
  b0: number
  b1: number
  b2: number
  a1: number
  a2: number
}

function freqToX(f: number, W: number): number {
  return (W * Math.log(f / F_MIN)) / Math.log(F_MAX / F_MIN)
}

function dbToY(db: number, plotH: number, padY: number): number {
  return padY + plotH * (1 - (db + DB_RANGE) / (2 * DB_RANGE))
}

export function calcBiquad(band: PeqBand): Coeff[] {
  if (band.type === 0 || band.bypass) return [{ b0: 1, b1: 0, b2: 0, a1: 0, a2: 0 }]

  if (band.type === 4) {
    // Paired shelving sections around freq..q.
    const fLow = Math.max(20, Math.min(20000, band.freq))
    const fHigh = Math.max(20, Math.min(20000, band.q))
    const actualLow = Math.min(fLow, fHigh)
    const actualHigh = Math.max(fLow, fHigh)
    const targetGain = Math.max(-18.0, Math.min(18.0, band.gain))
    const qShelf = 0.7071

    const A1 = Math.pow(10, targetGain / 40)
    const w01 = (2 * Math.PI * actualLow) / FS
    const cosw1 = Math.cos(w01)
    const sinw1 = Math.sin(w01)
    const alpha1 = sinw1 / (2 * qShelf)
    const sqrtA1 = Math.sqrt(A1)

    const a01 = A1 + 1 - (A1 - 1) * cosw1 + 2 * sqrtA1 * alpha1
    const hs1: Coeff = {
      b0: (A1 * (A1 + 1 + (A1 - 1) * cosw1 + 2 * sqrtA1 * alpha1)) / a01,
      b1: (-2 * A1 * (A1 - 1 + (A1 + 1) * cosw1)) / a01,
      b2: (A1 * (A1 + 1 + (A1 - 1) * cosw1 - 2 * sqrtA1 * alpha1)) / a01,
      a1: (2 * (A1 - 1 - (A1 + 1) * cosw1)) / a01,
      a2: (A1 + 1 - (A1 - 1) * cosw1 - 2 * sqrtA1 * alpha1) / a01,
    }

    const A2 = Math.pow(10, -targetGain / 40)
    const w02 = (2 * Math.PI * actualHigh) / FS
    const cosw2 = Math.cos(w02)
    const sinw2 = Math.sin(w02)
    const alpha2 = sinw2 / (2 * qShelf)
    const sqrtA2 = Math.sqrt(A2)

    const a02 = A2 + 1 - (A2 - 1) * cosw2 + 2 * sqrtA2 * alpha2
    const hs2: Coeff = {
      b0: (A2 * (A2 + 1 + (A2 - 1) * cosw2 + 2 * sqrtA2 * alpha2)) / a02,
      b1: (-2 * A2 * (A2 - 1 + (A2 + 1) * cosw2)) / a02,
      b2: (A2 * (A2 + 1 + (A2 - 1) * cosw2 - 2 * sqrtA2 * alpha2)) / a02,
      a1: (2 * (A2 - 1 - (A2 + 1) * cosw2)) / a02,
      a2: (A2 + 1 - (A2 - 1) * cosw2 - 2 * sqrtA2 * alpha2) / a02,
    }
    return [hs1, hs2]
  }

  const g = Math.max(-18.0, Math.min(18.0, band.gain))
  const q = Math.max(0.1, band.q)
  const f = Math.max(20.0, Math.min(20000.0, band.freq))
  const A = Math.pow(10, g / 40)
  const w0 = (2 * Math.PI * f) / FS
  const cosW = Math.cos(w0)
  const sinW = Math.sin(w0)
  const alpha = sinW / (2 * q)
  const sqrtA = Math.sqrt(A)
  let b0 = 1
  let b1 = 0
  let b2 = 0
  let a0 = 1
  let a1 = 0
  let a2 = 0
  switch (band.type) {
    case 1:
      b0 = 1 + alpha * A
      b1 = -2 * cosW
      b2 = 1 - alpha * A
      a0 = 1 + alpha / A
      a1 = -2 * cosW
      a2 = 1 - alpha / A
      break
    case 2:
      b0 = A * (A + 1 - (A - 1) * cosW + 2 * sqrtA * alpha)
      b1 = 2 * A * (A - 1 - (A + 1) * cosW)
      b2 = A * (A + 1 - (A - 1) * cosW - 2 * sqrtA * alpha)
      a0 = A + 1 + (A - 1) * cosW + 2 * sqrtA * alpha
      a1 = -2 * (A - 1 + (A + 1) * cosW)
      a2 = A + 1 + (A - 1) * cosW - 2 * sqrtA * alpha
      break
    case 3:
      b0 = A * (A + 1 + (A - 1) * cosW + 2 * sqrtA * alpha)
      b1 = -2 * A * (A - 1 + (A + 1) * cosW)
      b2 = A * (A + 1 + (A - 1) * cosW - 2 * sqrtA * alpha)
      a0 = A + 1 - (A - 1) * cosW + 2 * sqrtA * alpha
      a1 = 2 * (A - 1 - (A + 1) * cosW)
      a2 = A + 1 - (A - 1) * cosW - 2 * sqrtA * alpha
      break
    case 5:
      b0 = (1 - cosW) / 2
      b1 = 1 - cosW
      b2 = (1 - cosW) / 2
      a0 = 1 + alpha
      a1 = -2 * cosW
      a2 = 1 - alpha
      break
    case 6:
      b0 = (1 + cosW) / 2
      b1 = -(1 + cosW)
      b2 = (1 + cosW) / 2
      a0 = 1 + alpha
      a1 = -2 * cosW
      a2 = 1 - alpha
      break
  }
  return [
    { b0: b0 / a0, b1: b1 / a0, b2: b2 / a0, a1: a1 / a0, a2: a2 / a0 },
  ]
}

function biquadMagLinear(c: Coeff, f: number): number {
  const w = (2 * Math.PI * f) / FS
  const cw = Math.cos(w)
  const sw = Math.sin(w)
  const c2w = Math.cos(2 * w)
  const s2w = Math.sin(2 * w)
  const nr = c.b0 + c.b1 * cw + c.b2 * c2w
  const ni = -(c.b1 * sw + c.b2 * s2w)
  const dr = 1 + c.a1 * cw + c.a2 * c2w
  const di = -(c.a1 * sw + c.a2 * s2w)
  return Math.sqrt((nr * nr + ni * ni) / Math.max(dr * dr + di * di, 1e-30))
}

export function drawEqCurve(
  canvas: HTMLCanvasElement,
  bands: PeqBand[] | undefined,
  noBandText: string,
) {
  const dpr = window.devicePixelRatio || 1
  const rect = canvas.getBoundingClientRect()
  const W = rect.width
  const H = rect.height
  if (W === 0 || H === 0) return
  canvas.width = W * dpr
  canvas.height = H * dpr
  const gfx = canvas.getContext('2d')
  if (!gfx) return
  gfx.setTransform(1, 0, 0, 1, 0, 0)
  gfx.scale(dpr, dpr)

  // Hub-theme colors resolved from the CSS variables at draw time.
  const cs = getComputedStyle(canvas)
  const primary = cs.getPropertyValue('--primary').trim()
  const muted = cs.getPropertyValue('--muted-foreground').trim()
  const fg = cs.getPropertyValue('--foreground').trim()
  const curve = primary ? `hsl(${primary})` : '#cf9a5c'
  const halo = primary ? `hsl(${primary} / 0.15)` : 'rgba(91,138,160,0.15)'
  const labelColor = muted ? `hsl(${muted})` : '#6b7178'
  const gridColor = fg ? `hsl(${fg} / 0.15)` : 'rgba(58,66,74,0.5)'
  const zeroLine = 'rgba(91,138,160,0.45)'
  const mono = (size: number) => `${size}px "JetBrains Mono", ui-monospace, monospace`

  const padX = 36
  const padY = 10
  const plotW = W - padX - 8
  const plotH = H - padY * 2 - 16
  gfx.clearRect(0, 0, W, H)

  GRID_DBS.forEach((db) => {
    const y = dbToY(db, plotH, padY)
    gfx.strokeStyle = db === 0 ? zeroLine : gridColor
    gfx.lineWidth = db === 0 ? 1.5 : 0.8
    gfx.setLineDash(db === 0 ? [] : [4, 4])
    gfx.beginPath()
    gfx.moveTo(padX, y)
    gfx.lineTo(padX + plotW, y)
    gfx.stroke()
    gfx.setLineDash([])
    gfx.fillStyle = labelColor
    gfx.font = mono(10)
    gfx.textAlign = 'right'
    gfx.fillText((db > 0 ? '+' : '') + db, padX - 5, y + 3)
  })

  GRID_FREQS.forEach((f, i) => {
    const x = padX + freqToX(f, plotW)
    gfx.strokeStyle = gridColor
    gfx.lineWidth = 0.8
    gfx.setLineDash([4, 4])
    gfx.beginPath()
    gfx.moveTo(x, padY)
    gfx.lineTo(x, padY + plotH)
    gfx.stroke()
    gfx.setLineDash([])
    gfx.fillStyle = labelColor
    gfx.font = mono(9)
    gfx.textAlign = 'center'
    gfx.fillText(GRID_FREQS_L[i], x, padY + plotH + 13)
  })

  if (!Array.isArray(bands) || bands.length === 0) {
    gfx.fillStyle = labelColor
    gfx.font = mono(11)
    gfx.textAlign = 'center'
    gfx.fillText(noBandText, padX + plotW / 2, padY + plotH / 2)
    return
  }

  const freqs = Array.from(
    { length: N_POINTS },
    (_, j) => F_MIN * Math.pow(F_MAX / F_MIN, j / (N_POINTS - 1)),
  )
  const coeffs = bands.map((b) => calcBiquad(b))
  const combDB = freqs.map((f) => {
    let total = 1.0
    coeffs.forEach((biquads) =>
      biquads.forEach((c) => {
        total *= biquadMagLinear(c, f)
      }),
    )
    return 20 * Math.log10(Math.max(total, 1e-10))
  })

  // Soft halo behind the main curve.
  gfx.strokeStyle = halo
  gfx.lineWidth = 6
  gfx.beginPath()
  freqs.forEach((f, j) => {
    const x = padX + freqToX(f, plotW)
    const y = dbToY(Math.max(-DB_RANGE, Math.min(DB_RANGE, combDB[j])), plotH, padY)
    if (j === 0) gfx.moveTo(x, y)
    else gfx.lineTo(x, y)
  })
  gfx.stroke()

  gfx.strokeStyle = curve
  gfx.lineWidth = 2
  gfx.beginPath()
  freqs.forEach((f, j) => {
    const x = padX + freqToX(f, plotW)
    const y = dbToY(Math.max(-DB_RANGE, Math.min(DB_RANGE, combDB[j])), plotH, padY)
    if (j === 0) gfx.moveTo(x, y)
    else gfx.lineTo(x, y)
  })
  gfx.stroke()
}
