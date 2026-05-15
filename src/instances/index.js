export let pearpassVaultClient

let currentDeviceNameValue = null
let envelopeSubscription = null
let newListenerSubscription = null
let masterUpdateSubscription = null

/**
 * @param {object} instance
 * @param {{ currentDeviceName: string }} options
 */
export const setPearpassVaultClient = (
  instance,
  { currentDeviceName } = {}
) => {
  detachEnvelopeListener()
  detachNewListenerHook()
  detachMasterUpdateHook()

  pearpassVaultClient = instance
  currentDeviceNameValue = currentDeviceName ?? null

  attachEnvelopeListener()
  attachNewListenerHook()
  attachMasterUpdateHook()
}

/**
 * @returns {string | null}
 */
export const getCurrentDeviceName = () => currentDeviceNameValue

/**
 * @param {string} path
 */
export const setStoragePath = async (path) => {
  await pearpassVaultClient.setStoragePath(path)
}

// Dynamic imports avoid a load-time cycle (inbox + actionRunner read
// pearpassVaultClient from this module).
const attachEnvelopeListener = () => {
  if (!pearpassVaultClient?.on) return
  if (envelopeSubscription) return

  envelopeSubscription = async (message) => {
    try {
      const { acceptInboundEnvelope } = await import('../api/inbox.js')
      await acceptInboundEnvelope(message)
      const { runActionScan } = await import('../api/actionRunner.js')
      runActionScan().catch(() => {})
    } catch {}
  }
  pearpassVaultClient.on('personal-swarm-envelope', envelopeSubscription)
}

const detachEnvelopeListener = () => {
  const sub = envelopeSubscription
  envelopeSubscription = null
  if (sub && pearpassVaultClient?.off) {
    pearpassVaultClient.off('personal-swarm-envelope', sub)
  }
}

// Re-run processInbox when a consumer subscribes to an event our handlers
// emit, so envelopes that arrived before the listener mounted can still be
// delivered.
const attachNewListenerHook = () => {
  if (!pearpassVaultClient?.on) return
  if (newListenerSubscription) return

  newListenerSubscription = async (event) => {
    if (event !== 'vault-access-revoked') return
    try {
      const { runActionScan } = await import('../api/actionRunner.js')
      runActionScan().catch(() => {})
    } catch {}
  }
  pearpassVaultClient.on('newListener', newListenerSubscription)
}

const detachNewListenerHook = () => {
  const sub = newListenerSubscription
  newListenerSubscription = null
  if (sub && pearpassVaultClient?.off) {
    pearpassVaultClient.off('newListener', sub)
  }
}

// Drain inbox/outbox whenever the master vault mutates from another process.
// Covers the extension-write -> desktop-process flow: the extension writes an
// outbox entry via the proxied vaultsAdd, the master vault emits 'update',
// and this hook kicks the desktop's runActionScan to deliver the entry.
const attachMasterUpdateHook = () => {
  if (!pearpassVaultClient?.on) return
  if (masterUpdateSubscription) return

  masterUpdateSubscription = async () => {
    try {
      const { runActionScan } = await import('../api/actionRunner.js')
      runActionScan().catch(() => {})
    } catch {}
  }
  pearpassVaultClient.on('master-update', masterUpdateSubscription)
}

const detachMasterUpdateHook = () => {
  const sub = masterUpdateSubscription
  masterUpdateSubscription = null
  if (sub && pearpassVaultClient?.off) {
    pearpassVaultClient.off('master-update', sub)
  }
}
