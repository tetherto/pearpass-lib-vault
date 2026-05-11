import { processPendingActions } from './processPendingActions'

let isProcessing = false
let pendingRescan = false

/**
 * @returns {Promise<void>}
 */
export const runActionScan = async () => {
  if (isProcessing) {
    pendingRescan = true
    return
  }

  isProcessing = true
  try {
    do {
      pendingRescan = false
      await processPendingActions()
    } while (pendingRescan)
  } finally {
    isProcessing = false
  }
}
