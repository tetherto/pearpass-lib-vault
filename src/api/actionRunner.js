import { processInbox } from './inbox'
import { processOutbox } from './outbox'
import { logger } from '../utils/logger'

let isProcessing = false
let pendingRescan = false

/** @returns {Promise<void>} */
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
        await processInbox()
      } catch (err) {
        logger.error('runActionScan: processInbox failed', err)
      }

      try {
        await processOutbox()
      } catch (err) {
        logger.error('runActionScan: processOutbox failed', err)
      }
    } while (pendingRescan)
  } finally {
    isProcessing = false
  }
}
