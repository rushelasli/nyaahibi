import { ref } from 'vue'
import { DSP_COMMAND_MAP, type DspPreset, type PeqPreset } from './presetsApi'

/**
 * One-way Web Bluetooth link (Nordic UART Service) shared by the preset
 * cards' "Apply to Device" buttons — the same protocol as the live
 * dsp.html, but only RX (write) characteristics are used here since the
 * presets page shows no realtime device state.
 */
const BLE_SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e'
const BLE_RX_UUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e'
const BLE_RX_PEQ_UUID = '6e400004-b5a3-f393-e0a9-e50e24dcca9e'

/** Web Bluetooth types aren't part of lib.dom — keep handles loosely typed. */
interface BleChar {
  writeValue: (data: BufferSource) => Promise<void>
}

interface BleDevice {
  name?: string
  addEventListener: (type: string, cb: () => void) => void
  gatt: {
    connect: () => Promise<any>
    connected: boolean
    disconnect: () => void
  }
}

const connected = ref(false)
const label = ref('')

let device: BleDevice | null = null
let rxCharacteristic: BleChar | null = null
let rxPeqCharacteristic: BleChar | null = null

function handleDisconnected() {
  device = null
  rxCharacteristic = null
  rxPeqCharacteristic = null
  connected.value = false
  label.value = ''
}

async function writeLine(characteristic: BleChar, cmd: string) {
  const encoder = new TextEncoder()
  await characteristic.writeValue(encoder.encode(`${cmd}\n`))
}

async function writeLinesSequential(characteristic: BleChar, cmds: string[]) {
  for (const cmd of cmds) {
    await writeLine(characteristic, cmd)
    await new Promise((resolve) => setTimeout(resolve, 50))
  }
}

export interface BleMessages {
  noBluetooth: string
  connectFail: string
}

export function useFuruBle() {
  async function connect(messages: BleMessages) {
    if (connected.value) return
    const bt = (navigator as any).bluetooth
    if (!bt) {
      window.alert(messages.noBluetooth)
      return
    }
    try {
      const dev: BleDevice = await bt.requestDevice({
        filters: [{ namePrefix: 'FuruHibi' }],
        optionalServices: [BLE_SERVICE_UUID],
      })
      device = dev
      dev.addEventListener('gattserverdisconnected', handleDisconnected)
      const server = await dev.gatt.connect()
      const service = await server.getPrimaryService(BLE_SERVICE_UUID)
      rxCharacteristic = await service.getCharacteristic(BLE_RX_UUID)
      rxPeqCharacteristic = await service.getCharacteristic(BLE_RX_PEQ_UUID)
      connected.value = true
      label.value = dev.name || 'FuruHibi R2R'
    } catch (err) {
      if ((err as { name?: string }).name !== 'NotFoundError') {
        window.alert(messages.connectFail)
      }
    }
  }

  function disconnect() {
    if (device?.gatt.connected) device.gatt.disconnect()
    handleDisconnected()
  }

  async function applyPeq(preset: PeqPreset) {
    if (!connected.value || !rxPeqCharacteristic) return
    const bands = Array.isArray(preset.bands) ? preset.bands : []
    const cmds = [`PEQ_BYPASS=${preset.global_bypass ? 1 : 0}`]
    for (let i = 0; i < 10; i++) {
      const b = bands[i] || { type: 1, freq: 1000, gain: 0.0, q: 1.0, bypass: true }
      cmds.push(
        `PEQ=${i},${b.type},${Math.round(b.freq)},${Math.round(b.gain * 10)},${Math.round(b.q * 10)},${b.bypass ? 1 : 0}`,
      )
    }
    await writeLinesSequential(rxPeqCharacteristic, cmds)
  }

  async function applyDsp(preset: DspPreset) {
    if (!connected.value || !rxCharacteristic) return
    const s = preset.settings || {}
    const cmds: string[] = []
    for (const key of Object.keys(DSP_COMMAND_MAP)) {
      const entry = s[key]
      if (!entry) continue
      const map = DSP_COMMAND_MAP[key]
      cmds.push(`${map.prefix}=${Math.round(entry.value)}`)
      if (map.bypassPrefix && 'bypass' in entry) {
        cmds.push(`${map.bypassPrefix}=${entry.bypass ? 1 : 0}`)
      }
    }
    await writeLinesSequential(rxCharacteristic, cmds)
  }

  return { connected, label, connect, disconnect, applyPeq, applyDsp }
}
