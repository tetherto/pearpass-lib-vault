/**
 * Generic buffer utilities for string/buffer conversions and secure clearing
 * This runs in the renderer process where sodium-native bindings are not available.
 */

/**
 * Convert string to UTF-8 encoded buffer
 * @param {string} str
 * @returns {Buffer}
 */
export const stringToBuffer = (str) => {
  if (typeof str !== 'string') {
    throw new TypeError('Input must be a string')
  }

  return Buffer.from(str, 'utf8')
}

/**
 * Convert Buffer to UTF-8 string
 * @param {Buffer} buffer
 * @returns {string}
 */
export const bufferToString = (buffer) => buffer.toString('utf8')

/**
 * Clear buffer by overwriting with zeros
 * @param {Buffer} buffer
 * @throws {TypeError} If buffer is not a valid Buffer
 */
export const clearBuffer = (buffer) => {
  if (
    !buffer ||
    typeof buffer !== 'object' ||
    typeof buffer.length !== 'number'
  ) {
    throw new TypeError('clearBuffer() requires a valid Buffer')
  }

  if (buffer.length === 0) {
    return // Empty buffer, nothing to clear
  }

  // Overwrite buffer with zeros
  buffer.fill(0)
}

/**
 * Execute callback with buffer, then clear it automatically
 * @template T
 * @param {Buffer} buffer
 * @param {(buffer: Buffer) => Promise<T>} callback
 * @returns {Promise<T>}
 */
export const withBuffer = async (buffer, callback) => {
  try {
    return await callback(buffer)
  } finally {
    clearBuffer(buffer)
  }
}

/**
 * Compare two buffers in constant time
 * @param {Buffer} a
 * @param {Buffer} b
 * @returns {boolean}
 */
export const compareBuffers = (a, b) => {
  const isBufferLike = (obj) =>
    obj && typeof obj === 'object' && typeof obj.length === 'number'

  if (!isBufferLike(a) || !isBufferLike(b)) {
    throw new TypeError('Both arguments must be Buffer')
  }

  if (a.length !== b.length) {
    return false
  }

  return Buffer.compare(a, b) === 0
}
