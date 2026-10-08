import type { Ref } from 'vue'

/**
 * Staging Buffer → Fixed Audio Block Generator widget — the live site's
 * SVG simulation, ported as a small engine the Vue component mounts once.
 * The SVG is built client-side only (like the live page), so SSR renders
 * the empty stage and hydration never conflicts.
 */

const NS = 'http://www.w3.org/2000/svg'

/** Data-encoding palette — the live widget's --sb-* colors. */
export const SBFG_COLORS = {
  usb: '#4fc3f7',
  stage: '#ffb74d',
  ring: '#81c784',
  block: '#ba68c8',
  silence: '#7a7f8c',
}

/** Legend dot colors, in live order. */
export const SBFG_LEGEND = [
  SBFG_COLORS.usb,
  SBFG_COLORS.stage,
  SBFG_COLORS.ring,
  SBFG_COLORS.block,
  SBFG_COLORS.silence,
]

const BLOCK_BYTES = 12
const FRAME_BYTES = 4
const USB_PACKET_SIZES = [6, 10, 14, 8, 18, 4, 16, 10, 22, 12]

// Theme colors ride on Tailwind classes instead of getComputedStyle vars.
const F_TEXT = 'fill-foreground'
const F_DIM = 'fill-muted-foreground'
const S_LINE = 'stroke-current text-muted-foreground'
const S_EMPTY = 'stroke-current text-foreground/15'
const S_FRAME = 'stroke-current text-foreground'

export interface SbfgStats {
  blocks: number
  ring: number
  underrun: number
  staging: number
}

export interface Sbfg {
  play: () => void
  pause: () => void
  step: () => void
  reset: () => void
  setSpeed: (ms: number) => void
  dispose: () => void
}

type Attrs = Record<string, string | number>

export function createSbfg(
  svg: SVGSVGElement,
  opts: { stats: Ref<SbfgStats>; playing: Ref<boolean>; readyStatus: () => string },
): Sbfg {
  const { stats, playing } = opts

  function el(tag: string, attrs: Attrs): SVGElement {
    const node = document.createElementNS(NS, tag)
    for (const key in attrs) node.setAttribute(key, String(attrs[key]))
    return node
  }

  function text(x: number, y: number, str: string, attrs: Attrs = {}): SVGElement {
    const node = el('text', { x, y, 'font-family': 'ui-monospace,Menlo,monospace', ...attrs })
    if (!('fill' in attrs) && !('class' in attrs)) node.setAttribute('class', F_TEXT)
    node.textContent = str
    return node
  }

  const byId = (id: string) => svg.querySelector<SVGGElement>(`#${id}`)

  function arrow(x1: number, y1: number, x2: number, y2: number) {
    svg.appendChild(
      el('line', {
        x1,
        y1,
        x2,
        y2,
        class: S_LINE,
        'stroke-width': '2',
        'marker-end': 'url(#sbfgArrowhead)',
      }),
    )
  }

  function drawStatic() {
    svg.innerHTML = ''
    const cols = [
      { x: 60, label: 'USB isochronous' },
      { x: 280, label: 'Staging Buffer' },
      { x: 520, label: 'Ring Buffer' },
      { x: 740, label: 'Callback (Fixed Block)' },
    ]
    for (const col of cols) {
      svg.appendChild(text(col.x, 24, col.label, { 'font-weight': '700', 'font-size': '13' }))
    }

    svg.appendChild(
      el('rect', {
        x: 230,
        y: 120,
        width: 220,
        height: 60,
        rx: 8,
        fill: 'none',
        stroke: SBFG_COLORS.stage,
        'stroke-width': '2',
      }),
    )
    svg.appendChild(
      text(240, 112, '_stagingBuf (accumulate → drain)', {
        'font-size': '10',
        class: F_DIM,
      }),
    )
    svg.appendChild(el('g', { id: 'sbfgStagingFill' }))

    svg.appendChild(
      el('rect', {
        x: 480,
        y: 120,
        width: 220,
        height: 60,
        rx: 8,
        fill: 'none',
        stroke: SBFG_COLORS.ring,
        'stroke-width': '2',
      }),
    )
    svg.appendChild(
      text(490, 112, '_spk_ringbuf (FIFO, NOSPLIT)', { 'font-size': '10', class: F_DIM }),
    )
    svg.appendChild(el('g', { id: 'sbfgRingFill' }))

    svg.appendChild(text(700, 112, '_cb(data, _blockBytes)', { 'font-size': '10', class: F_DIM }))
    svg.appendChild(el('g', { id: 'sbfgCallbackOut' }))

    const defs = el('defs', {})
    const marker = el('marker', {
      id: 'sbfgArrowhead',
      markerWidth: '8',
      markerHeight: '8',
      refX: '6',
      refY: '3',
      orient: 'auto',
    })
    marker.appendChild(el('path', { d: 'M0,0 L6,3 L0,6 Z', class: F_DIM }))
    defs.appendChild(marker)
    svg.appendChild(defs)

    arrow(160, 150, 225, 150)
    arrow(455, 150, 475, 150)
    arrow(705, 150, 725, 150)

    svg.appendChild(el('g', { id: 'sbfgUsbTrack' }))
    svg.appendChild(
      text(230, 200, 'kelipatan _frameBytes (4B) = frame-aligned', {
        'font-size': '10',
        class: F_DIM,
      }),
    )

    svg.appendChild(
      el('text', {
        id: 'sbfgStatusText',
        x: 60,
        y: 250,
        class: F_TEXT,
        'font-size': '13',
        'font-weight': '600',
      }),
    )
    svg.appendChild(
      el('text', { id: 'sbfgStatusSub', x: 60, y: 270, class: F_DIM, 'font-size': '11' }),
    )
  }

  function setStatus(main: string, sub = '') {
    const mainEl = svg.querySelector<SVGTextElement>('#sbfgStatusText')
    const subEl = svg.querySelector<SVGTextElement>('#sbfgStatusSub')
    if (mainEl) mainEl.textContent = main
    if (subEl) subEl.textContent = sub
  }

  function renderStaging() {
    const g = byId('sbfgStagingFill')
    if (!g) return
    g.innerHTML = ''
    const x0 = 235
    const y0 = 130
    const h = 40
    const filled = Math.min(stagingBytes, 24)
    const unit = 210 / 24
    for (let i = 0; i < filled; i++) {
      const attrs: Attrs = {
        x: x0 + i * unit,
        y: y0,
        width: unit - 1,
        height: h,
        fill: i < BLOCK_BYTES ? SBFG_COLORS.stage : `${SBFG_COLORS.stage}88`,
      }
      if (i % FRAME_BYTES === 0) {
        attrs.class = S_FRAME
        attrs['stroke-width'] = '1'
        attrs['stroke-opacity'] = '0.25'
      }
      g.appendChild(el('rect', attrs))
    }
  }

  function renderRing() {
    const g = byId('sbfgRingFill')
    if (!g) return
    g.innerHTML = ''
    const maxSlots = 6
    const w = 30
    const gap = 4
    const x0 = 490
    const y0 = 130
    for (let i = 0; i < maxSlots; i++) {
      const has = i < ringItems.length
      g.appendChild(
        el('rect', {
          x: x0 + i * (w + gap),
          y: y0,
          width: w,
          height: 40,
          rx: 4,
          fill: has ? SBFG_COLORS.ring : 'none',
          ...(has ? {} : { class: S_EMPTY }),
        }),
      )
    }
  }

  function flashCallback(kind: 'data' | 'silence') {
    const g = byId('sbfgCallbackOut')
    if (!g) return
    g.innerHTML = ''
    const color = kind === 'silence' ? SBFG_COLORS.silence : SBFG_COLORS.block
    g.appendChild(
      el('rect', { x: 725, y: 125, width: 120, height: 50, rx: 8, fill: color, opacity: '0.9' }),
    )
    g.appendChild(
      text(735, 155, kind === 'silence' ? 'SILENCE (0x00...)' : 'FIXED BLOCK', {
        fill: '#fff',
        'font-weight': '700',
      }),
    )
    // Deliberately not auto-cleared: the box stays visible until the next
    // cycle calls flashCallback again, so it never "blinks away" at speed.
  }

  const activeRafs = new Set<number>()

  function spawnUsbPacket(len: number, duration: number) {
    const track = byId('sbfgUsbTrack')
    if (!track) return
    const y = 150
    const w = Math.max(20, len * 3)
    const rect = el('rect', { x: 20, y: y - 15, width: w, height: 30, rx: 6, fill: SBFG_COLORS.usb })
    const label = text(24, y + 4, `${len}B`, {
      fill: '#062028',
      'font-weight': '700',
      'font-size': '11',
    })
    track.appendChild(rect)
    track.appendChild(label)

    let start: number | null = null
    const tickFrame = (ts: number) => {
      if (!start) start = ts
      const p = Math.min(1, (ts - start) / duration)
      const x = 20 + p * 205
      rect.setAttribute('x', String(x))
      label.setAttribute('x', String(x + 4))
      if (p < 1) {
        activeRafs.add(requestAnimationFrame(tickFrame))
      } else {
        rect.remove()
        label.remove()
      }
    }
    activeRafs.add(requestAnimationFrame(tickFrame))
  }

  function renderStats() {
    stats.value = {
      blocks: blocksSent,
      ring: ringItems.length,
      underrun: underrunCount,
      staging: stagingBytes,
    }
  }

  let stagingBytes = 0
  let ringItems: unknown[] = []
  let blocksSent = 0
  let underrunCount = 0
  let pktIdx = 0
  let busy = false
  let speed = 900
  let interval: ReturnType<typeof setInterval> | undefined
  const timeouts = new Set<ReturnType<typeof setTimeout>>()

  function later(fn: () => void, ms: number) {
    const id = setTimeout(() => {
      timeouts.delete(id)
      fn()
    }, ms)
    timeouts.add(id)
  }

  function stepSim() {
    // Skip the tick when the previous cycle is still running (possible at
    // "Cepat" speed) instead of stacking timers that overwrite each other —
    // this is why the Callback box always gets to show for a full cycle.
    if (busy) return
    busy = true
    byId('sbfgCallbackOut')?.replaceChildren()

    // Scale every animation pause to the chosen speed so one cycle always
    // fits its interval (no overlap with the next tick) at any speed.
    const dArrive = Math.max(160, Math.min(550, speed * 0.45))
    const dDrain = Math.max(140, Math.min(600, speed * 0.35))
    const dConsume = Math.max(140, Math.min(500, speed * 0.3))

    const len = USB_PACKET_SIZES[pktIdx % USB_PACKET_SIZES.length]
    pktIdx++
    spawnUsbPacket(len, dArrive)
    setStatus(
      `USB isochronous mengirim ${len} byte (ukuran acak)`,
      'tud_audio_read() → memcpy ke staging buffer',
    )

    later(() => {
      stagingBytes += len
      let drained = 0
      while (stagingBytes >= BLOCK_BYTES) {
        stagingBytes -= BLOCK_BYTES
        drained++
        ringItems.push({})
      }
      if (drained > 0) {
        setStatus(
          `${drained} blok tetap terbentuk (kelipatan ${BLOCK_BYTES}B)`,
          'frame-aligned → xRingbufferSend() ke ring buffer',
        )
      } else {
        setStatus('Belum cukup untuk 1 blok tetap', `sisa ${stagingBytes}B menunggu paket berikutnya`)
      }
      renderStaging()
      renderRing()
      renderStats()

      later(() => {
        const had = ringItems.length > 0
        if (had) {
          ringItems.shift()
          renderRing()
          flashCallback('data')
          blocksSent++
          setStatus(
            'Consumer (Core1) ambil 1 blok dari ring buffer',
            '_cb(data, _blockBytes) — ukuran SELALU tetap',
          )
        } else {
          underrunCount++
          flashCallback('silence')
          setStatus(
            'Ring buffer kosong → underrun',
            'Consumer isi silence, callback tetap dapat ukuran tetap',
          )
        }
        renderStats()
        busy = false
      }, dConsume)
    }, dDrain)
  }

  function play() {
    playing.value = true
    interval = setInterval(stepSim, speed)
  }

  function pause() {
    playing.value = false
    clearInterval(interval)
    interval = undefined
  }

  function reset() {
    pause()
    stagingBytes = 0
    ringItems = []
    blocksSent = 0
    underrunCount = 0
    pktIdx = 0
    busy = false
    drawStatic()
    renderStaging()
    renderRing()
    renderStats()
    setStatus(opts.readyStatus())
  }

  function setSpeed(ms: number) {
    speed = ms
    if (playing.value) {
      pause()
      play()
    }
  }

  function dispose() {
    pause()
    for (const id of timeouts) clearTimeout(id)
    timeouts.clear()
    for (const id of activeRafs) cancelAnimationFrame(id)
    activeRafs.clear()
  }

  reset()

  return { play, pause, step: stepSim, reset, setSpeed, dispose }
}
