export const EXPIRY_THRESHOLD_SECONDS = 5

/**
 * @param {number | null} timeRemaining
 * @returns {boolean}
 */
export const isExpiring = (timeRemaining) =>
  timeRemaining !== null && timeRemaining <= EXPIRY_THRESHOLD_SECONDS
