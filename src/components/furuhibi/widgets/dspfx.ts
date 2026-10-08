/**
 * DSP FX widget — the live site's seven per-effect animations, ported as an
 * engine the Vue component mounts once. Tab labels and descriptions live in
 * the locale files; this module only draws (SVG is built client-side only).
 */

const NS = 'http://www.w3.org/2000/svg'

/** Data-encoding palette — the live widget's --dsp-* colors. */
export const DSPFX_IN = '#7a7f8c'
export const DSPFX_OUT = '#4fc3f7'
const A = '#ffb74d'
const A2 = '#ba68c8'
const A3 = '#81c784'

/** Live tab order — labels/descriptions come from `furuhibi.dspFx.effects`. */
export const DSPFX_ORDER = [
  'eq',
  'loudness',
  'widening',
  'surround',
  'clipper',
  'clarity',
  'reverb',
] as const

export type DspfxKey = (typeof DSPFX_ORDER)[number]

const F_TEXT = 'fill-foreground'
const F_DIM = 'fill-muted-foreground'
const S_BORDER = 'stroke-current text-foreground/25'
const MONO = 'ui-monospace,Menlo,monospace'

type Attrs = Record<string, string | number>

export interface Dspfx {
  activate: (key: DspfxKey) => void
  dispose: () => void
}

export function createDspfx(svg: SVGSVGElement): Dspfx {
  /* Layout in CSS pixels so type stays legible at any container width;
     horizontal positions recompute from the container on resize. */
  const L = { W: 900, H: 260, narrow: false, xl: 40, xr: 860, xc: 450, fs: 12, fsS: 10 }

  function measure() {
    let w = Math.round(svg.getBoundingClientRect().width)
    if (!w) w = 900
    w = Math.max(w, 240)
    L.W = w
    L.H = 260
    L.narrow = w < 560
    const pad = L.narrow ? 14 : 40
    L.xl = pad
    L.xr = w - pad
    L.xc = w / 2
    L.fs = L.narrow ? 13 : 12
    L.fsS = L.narrow ? 11 : 10
    svg.setAttribute('viewBox', `0 0 ${L.W} ${L.H}`)
  }

  function el(tag: string, attrs: Attrs): SVGElement {
    const node = document.createElementNS(NS, tag)
    for (const key in attrs) node.setAttribute(key, String(attrs[key]))
    return node
  }

  function txt(x: number, y: number, str: string, opts: Attrs = {}): SVGElement {
    const node = el('text', { x, y, 'font-family': MONO, 'font-size': String(L.fs), ...opts })
    if (!('fill' in opts) && !('class' in opts)) node.setAttribute('class', F_DIM)
    node.textContent = str
    return node
  }

  function ttl(x: number, y: number, str: string, anchor = 'middle'): SVGElement {
    return txt(x, y, str, {
      'text-anchor': anchor,
      'font-weight': '700',
      'font-size': String(L.fs + 1),
      class: F_TEXT,
    })
  }

  function ptsToD(pts: number[][]): string {
    return `M ${pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' L ')}`
  }

  /** Sine-based waveform y-values for x from x0..x1. */
  function wave(
    y0: number,
    amp: number,
    freq: number,
    phase: number,
    n: number,
    x0: number,
    x1: number,
    shaper?: (y: number, tt: number) => number,
  ): number[][] {
    const pts: number[][] = []
    for (let i = 0; i <= n; i++) {
      const tt = i / n
      const x = x0 + (x1 - x0) * tt
      let y = Math.sin(tt * Math.PI * 2 * freq + phase)
      if (shaper) y = shaper(y, tt)
      pts.push([x, y0 - y * amp])
    }
    return pts
  }

  function hline(
    g: SVGElement,
    y: number,
    x1: number,
    x2: number,
    stroke: string,
    w: number,
    dash?: string,
    op?: number,
  ) {
    const attrs: Attrs = { x1, y1: y, x2, y2: y, 'stroke-width': w }
    if (stroke.startsWith('#')) attrs.stroke = stroke
    else attrs.class = stroke
    if (dash) attrs['stroke-dasharray'] = dash
    if (op !== undefined) attrs.opacity = op
    g.appendChild(el('line', attrs))
  }

  function baseAxes(g: SVGElement, label1: string, label2: string) {
    g.appendChild(ttl(L.xl, 40, label1, 'start'))
    g.appendChild(ttl(L.xl, 160, label2, 'start'))
    hline(g, 70, L.xl, L.xr, S_BORDER, 1, '2 4', 0.4)
    hline(g, 190, L.xl, L.xr, S_BORDER, 1, '2 4', 0.4)
  }

  interface Effect {
    init: (root: SVGElement) => any
    tick: (state: any, t: number) => void
  }

  const EFFECTS: Record<DspfxKey, Effect> = {
    eq: {
      init(root) {
        root.innerHTML = ''
        const g = el('g', {})
        root.appendChild(g)
        const x0 = L.xl + (L.narrow ? 0 : 20)
        const x1 = L.xr
        const sp = x1 - x0
        const mid = x0 + sp / 2
        g.appendChild(ttl(L.xc, 24, 'RESPONS FREKUENSI'))
        hline(g, 150, x0, x1, S_BORDER, 1)
        g.appendChild(txt(x0, 172, 'Low'))
        g.appendChild(txt(mid, 172, 'Mid', { 'text-anchor': 'middle' }))
        g.appendChild(txt(x1, 172, 'High', { 'text-anchor': 'end' }))
        g.appendChild(txt(x0, 62, '+dB', { fill: A }))
        g.appendChild(txt(x0, 238, '-dB', { fill: A }))
        for (const i of [1, 2, 3]) {
          const x = x0 + (sp * i) / 4
          g.appendChild(
            el('line', {
              x1: x,
              y1: 60,
              x2: x,
              y2: 230,
              class: S_BORDER,
              'stroke-width': '0.5',
              opacity: '0.3',
            }),
          )
        }
        hline(g, 150, x0, x1, DSPFX_IN, 1.5, '3 5', 0.6)
        const curve = el('path', {
          fill: 'none',
          stroke: DSPFX_OUT,
          'stroke-width': '3',
          'stroke-linecap': 'round',
        })
        g.appendChild(curve)
        const dot = el('circle', { r: 5, fill: A })
        g.appendChild(dot)
        return { curve, dot, x0, sp, mid }
      },
      tick(s, t) {
        const boostAmt = 55 + Math.sin(t * 1.3) * 28 // breathing gain
        const sig = s.sp * 0.175
        const pts: number[][] = []
        const n = 80
        for (let k = 0; k <= n; k++) {
          const x = s.x0 + (s.sp * k) / n
          const d = (x - s.mid) / sig
          pts.push([x, 150 - boostAmt * Math.exp(-d * d)])
        }
        s.curve.setAttribute('d', ptsToD(pts))
        s.dot.setAttribute('cx', String(s.mid))
        s.dot.setAttribute('cy', String(150 - boostAmt))
      },
    },

    loudness: {
      init(root) {
        root.innerHTML = ''
        const g = el('g', {})
        root.appendChild(g)
        baseAxes(
          g,
          L.narrow ? 'INPUT (pelan)' : 'INPUT (volume rendah)',
          L.narrow ? 'OUTPUT (loudness)' : 'OUTPUT (loudness aktif)',
        )
        const inPath = el('path', {
          fill: 'none',
          stroke: DSPFX_IN,
          'stroke-width': '1.5',
          'stroke-dasharray': '4 4',
          opacity: '0.7',
        })
        const outPath = el('path', { fill: 'none', stroke: DSPFX_OUT, 'stroke-width': '2.5' })
        g.appendChild(inPath)
        g.appendChild(outPath)
        return { inPath, outPath }
      },
      tick(s, t) {
        const f = L.narrow ? 3.5 : 5
        const inPts = wave(70, 14, f, t * 1.6, 160, L.xl, L.xr)
        const outPts = wave(190, 14, f, t * 1.6, 160, L.xl, L.xr, (y, tt) => {
          const bass = Math.sin(tt * Math.PI * 2 * 1 + t * 1.6) * 0.6
          return y * 2.1 + bass
        })
        s.inPath.setAttribute('d', ptsToD(inPts))
        s.outPath.setAttribute('d', ptsToD(outPts))
      },
    },

    widening: {
      init(root) {
        root.innerHTML = ''
        const g = el('g', {})
        root.appendChild(g)
        g.appendChild(txt(L.xl, 24, 'CH-L', { fill: DSPFX_OUT, 'font-weight': '700' }))
        g.appendChild(txt(L.xl, 140, 'CH-R', { fill: A, 'font-weight': '700' }))
        hline(g, 60, L.xl, L.xr, S_BORDER, 1, '2 4', 0.4)
        hline(g, 175, L.xl, L.xr, S_BORDER, 1, '2 4', 0.4)
        const Lp = el('path', { fill: 'none', stroke: DSPFX_OUT, 'stroke-width': '2.5' })
        const Rp = el('path', { fill: 'none', stroke: A, 'stroke-width': '2.5' })
        g.appendChild(Lp)
        g.appendChild(Rp)
        g.appendChild(
          txt(L.xc, 246, L.narrow ? '◀ soundstage melebar ▶' : '◀ lebar soundstage bertambah seiring waktu ▶', {
            'text-anchor': 'middle',
          }),
        )
        const arrowL = el('line', {
          x1: L.xc,
          y1: 222,
          x2: L.xc,
          y2: 222,
          stroke: A3,
          'stroke-width': '2',
        })
        g.appendChild(arrowL)
        return { Lp, Rp, arrowL }
      },
      tick(s, t) {
        const width = Math.sin(t * 0.7) * 0.5 + 0.5 // 0..1
        const phase = width * 1.1
        const f = L.narrow ? 3 : 4
        const Lw = wave(60, 16, f, t * 1.6, 150, L.xl, L.xr)
        const Rw = wave(175, 16, f, t * 1.6 + phase, 150, L.xl, L.xr, (y) => y * (1 + width * 0.4))
        s.Lp.setAttribute('d', ptsToD(Lw))
        s.Rp.setAttribute('d', ptsToD(Rw))
        const half = (L.xr - L.xl) * (0.025 + width * 0.27)
        s.arrowL.setAttribute('x1', String(L.xc - half))
        s.arrowL.setAttribute('x2', String(L.xc + half))
      },
    },

    surround: {
      init(root) {
        root.innerHTML = ''
        const g = el('g', {})
        root.appendChild(g)
        g.appendChild(ttl(L.xc, 24, L.narrow ? 'DIFFUSION RUANG STEREO' : 'DIFFUSION KE RUANG STEREO'))
        const cx = L.xc
        const cy = 145
        g.appendChild(el('circle', { cx, cy, r: 5, fill: A }))
        g.appendChild(txt(cx, cy - 14, 'SOURCE', { 'text-anchor': 'middle', 'font-size': String(L.fsS) }))
        const off = L.narrow ? 22 : 60
        const speakers: [number, number, string][] = [
          [L.xl + off, 145, 'L'],
          [L.xr - off, 145, 'R'],
        ]
        for (const [x, y, lab] of speakers) {
          g.appendChild(
            el('rect', {
              x: x - 10,
              y: y - 10,
              width: 20,
              height: 20,
              rx: 4,
              fill: 'none',
              class: S_BORDER,
              'stroke-width': '1.5',
            }),
          )
          g.appendChild(txt(x, y + 32, lab, { 'text-anchor': 'middle' }))
        }
        g.appendChild(
          el('rect', {
            x: L.xc - 10,
            y: 225,
            width: 20,
            height: 20,
            rx: 4,
            fill: 'none',
            class: S_BORDER,
            'stroke-width': '1.5',
          }),
        )
        g.appendChild(txt(L.xc + 18, 240, 'C', { 'text-anchor': 'start' }))
        const ringsG = el('g', {})
        g.appendChild(ringsG)
        return { ringsG, cx, cy }
      },
      tick(s, t) {
        s.ringsG.innerHTML = ''
        const P = (L.xr - L.xl) * (L.narrow ? 0.4 : 0.27) // max ring reach
        const ratio = L.narrow ? 0.6 : 0.5
        for (let i = 0; i < 4; i++) {
          const phase = (t * P * 0.18 + (i * P) / 4) % P
          const r = 10 + phase
          const op = Math.max(0, 1 - phase / P)
          s.ringsG.appendChild(
            el('ellipse', {
              cx: s.cx,
              cy: s.cy,
              rx: r,
              ry: r * ratio,
              fill: 'none',
              stroke: DSPFX_OUT,
              'stroke-width': '1.5',
              opacity: op.toFixed(2),
            }),
          )
        }
      },
    },

    clipper: {
      init(root) {
        root.innerHTML = ''
        const g = el('g', {})
        root.appendChild(g)
        baseAxes(
          g,
          L.narrow ? 'INPUT (keras)' : 'INPUT (level tinggi)',
          L.narrow ? 'OUTPUT (clipped)' : 'OUTPUT (soft-clipped)',
        )
        hline(g, 38, L.xl, L.xr, A, 1, '3 4', 0.5)
        hline(g, 102, L.xl, L.xr, A, 1, '3 4', 0.5)
        g.appendChild(
          txt(L.xr - 2, 33, 'clip ceiling', {
            'text-anchor': 'end',
            fill: A,
            'font-size': String(L.fsS),
          }),
        )
        const inPath = el('path', {
          fill: 'none',
          stroke: DSPFX_IN,
          'stroke-width': '1.5',
          'stroke-dasharray': '4 4',
          opacity: '0.7',
        })
        const outPath = el('path', { fill: 'none', stroke: DSPFX_OUT, 'stroke-width': '2.5' })
        g.appendChild(inPath)
        g.appendChild(outPath)
        return { inPath, outPath }
      },
      tick(s, t) {
        const drive = 1.4 + Math.sin(t * 0.9) * 0.5 // varying loudness
        const f = L.narrow ? 3 : 4.5
        const inPts = wave(70, 32 * Math.max(drive, 1), f, t * 2.2, 160, L.xl, L.xr)
        const outPts = wave(190, 32, f, t * 2.2, 160, L.xl, L.xr, (y) => Math.tanh(y * drive))
        s.inPath.setAttribute('d', ptsToD(inPts))
        s.outPath.setAttribute('d', ptsToD(outPts))
      },
    },

    clarity: {
      init(root) {
        root.innerHTML = ''
        const g = el('g', {})
        root.appendChild(g)
        const lc = (L.xl + L.xc) / 2
        const rc = (L.xc + L.xr) / 2
        g.appendChild(ttl(lc, 24, L.narrow ? 'SEBELUM' : 'SEBELUM (menumpuk)'))
        g.appendChild(ttl(rc, 24, L.narrow ? 'SESUDAH' : 'SESUDAH (terpisah & jernih)'))
        g.appendChild(
          el('line', {
            x1: L.xc,
            y1: 40,
            x2: L.xc,
            y2: 235,
            class: S_BORDER,
            'stroke-width': '1',
            'stroke-dasharray': '3 5',
            opacity: '0.4',
          }),
        )
        const r = L.narrow ? 7 : 9
        const colors = [DSPFX_OUT, A, A2, A3, DSPFX_IN]
        const dotsIn: SVGElement[] = []
        const dotsOut: SVGElement[] = []
        for (let i = 0; i < 5; i++) {
          const dIn = el('circle', { r, fill: colors[i], opacity: '0.75' })
          const dOut = el('circle', { r, fill: colors[i] })
          g.appendChild(dIn)
          g.appendChild(dOut)
          dotsIn.push(dIn)
          dotsOut.push(dOut)
        }
        return { dotsIn, dotsOut, lc, rc, r }
      },
      tick(s, t) {
        const spread = Math.sin(t * 0.8) * 0.5 + 0.5 // 0 clustered .. 1 separated
        const n = s.dotsIn.length
        const jx = L.narrow ? 6 : 10
        const rxMax = Math.min(115, (L.xr - L.xc) / 2 - s.r - 4)
        const ryMax = 70
        for (let i = 0; i < n; i++) {
          const cx = s.lc + Math.sin(i * 2.1) * jx
          const cy = 135 + Math.cos(i * 2.1) * 8
          s.dotsIn[i].setAttribute('cx', String(cx))
          s.dotsIn[i].setAttribute('cy', String(cy))
          const angle = (i / n) * Math.PI * 2
          const k = 0.2 + spread * 0.8
          const ox = s.rc + Math.cos(angle) * rxMax * k
          const oy = 135 + Math.sin(angle) * ryMax * k
          s.dotsOut[i].setAttribute('cx', String(ox))
          s.dotsOut[i].setAttribute('cy', String(oy))
        }
      },
    },

    reverb: {
      init(root) {
        root.innerHTML = ''
        const g = el('g', {})
        root.appendChild(g)
        g.appendChild(ttl(L.xc, 24, L.narrow ? 'IMPULSE → EKOR REVERB' : 'IMPULSE → EKOR REVERB (DECAY)'))
        hline(g, 150, L.xl, L.xr, S_BORDER, 1)
        const barsG = el('g', {})
        g.appendChild(barsG)
        return { barsG }
      },
      tick(s, t) {
        s.barsG.innerHTML = ''
        const period = 2.4
        const cycles = 3
        const nBars = 18
        const step = (L.xr - L.xl - 20) / (nBars - 1)
        const bw = Math.max(5, Math.min(12, step * 0.55))
        for (let c = 0; c < cycles; c++) {
          const age = (t + (c * period) / cycles) % period
          for (let i = 0; i < nBars; i++) {
            const delay = i * 0.055
            const localAge = age - delay
            if (localAge < 0) continue
            const decay = Math.exp(-localAge * 2.6)
            const h = i === 0 ? 110 : 110 * decay * (0.5 + 0.5 * Math.sin(i * 1.7))
            if (h < 1) continue
            const x = L.xl + 10 + i * step
            const op = Math.max(0, decay)
            s.barsG.appendChild(
              el('rect', {
                x: x - bw / 2,
                y: 150 - h,
                width: bw,
                height: h,
                rx: 2,
                fill: i === 0 ? A : DSPFX_OUT,
                opacity: op.toFixed(2),
              }),
            )
          }
        }
      },
    },
  }

  let current: DspfxKey = 'eq'
  let state: any = null
  let raf: number | undefined
  let startT: number | null = null

  function stop() {
    if (raf !== undefined) cancelAnimationFrame(raf)
    raf = undefined
  }

  function loop(now: number) {
    if (startT === null) startT = now
    const t = (now - startT) / 1000
    EFFECTS[current].tick(state, t)
    raf = requestAnimationFrame(loop)
  }

  function activate(key: DspfxKey) {
    stop()
    current = key
    startT = null
    state = EFFECTS[key].init(svg)
    raf = requestAnimationFrame(loop)
  }

  // Diagram width follows the container: remeasure on width changes.
  function checkSize() {
    const w = Math.round(svg.getBoundingClientRect().width)
    if (w && Math.abs(Math.max(w, 240) - L.W) > 1) {
      measure()
      activate(current)
    }
  }

  let observer: ResizeObserver | undefined
  measure()
  // This module only ever runs in the browser (mounted client-side).
  observer = new ResizeObserver(checkSize)
  observer.observe(svg)

  return {
    activate,
    dispose() {
      stop()
      observer?.disconnect()
    },
  }
}
