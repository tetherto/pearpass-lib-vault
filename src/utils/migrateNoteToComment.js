/**
 * Migration helper for the "note → comment" field renaming.
 *
 * This function provides backward compatibility for existing vault items
 * that were created with the legacy "note" field. It automatically migrates
 * the data to use the new "comment" field name.
 *
 * Migration rules:
 * 1. If only `note` exists → use `note` value as `comment`
 * 2. If only `comment` exists → use `comment` value (new format)
 * 3. If both exist → prefer `comment` (newer data takes precedence)
 * 4. If neither exists → return undefined
 *
 * @param {Object} data - The vault item data object
 * @param {string} [data.note] - Legacy note field (deprecated)
 * @param {string} [data.comment] - New comment field
 * @returns {string|undefined} The migrated comment value
 */
export const migrateNoteToComment = (data) => {
  return data?.comment ?? data?.note ?? undefined;
}

