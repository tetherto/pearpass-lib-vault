/**
 * Creates an interval that fires aligned to whole-second boundaries.
 * All callers across the app fire at the same wall-clock second,
 * keeping multiple OTP displays in sync.
 *
 * Self-correcting: each tick recalculates the delay from the current
 * wall-clock time, so slow callbacks don't cause cumulative drift.
 *
 * @param {() => void} callback
 * @returns {() => void} cleanup function
 */
export const createAlignedInterval = (callback) => {
  let id = null
  let cancelled = false

  const scheduleNext = () => {
    if (cancelled) return

    const now = Date.now()
    const delay = 1000 - (now % 1000)

    id = setTimeout(() => {
      if (cancelled) return
      callback()
      scheduleNext()
    }, delay)
  }

  scheduleNext()

  return () => {
    cancelled = true
    clearTimeout(id)
  }
}
