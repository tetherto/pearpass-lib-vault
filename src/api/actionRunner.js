import { processPendingActions } from './processPendingActions'
import { logger } from '../utils/logger'

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
      try {
        await processPendingActions()
      } catch (err) {
        logger.error('runActionScan: processPendingActions failed', err)
      }
    } while (pendingRescan)
  } finally {
    isProcessing = false
  }
}
