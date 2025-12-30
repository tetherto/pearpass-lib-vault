/**
 * Migrates a legacy custom field format to the new format.
 *
 * Legacy format: { type: 'note', note: 'content' }
 * New format: { type: 'text', content: 'content' }
 *
 * Migration rules:
 * 1. If type is 'note' (legacy), convert to 'text'
 * 2. If type is 'text' (new), keep as is
 * 3. If 'content' property exists, use it
 * 4. If only 'note' property exists (legacy), migrate it to 'content'
 * 5. If both exist, prefer 'content' (newer data takes precedence)
 *
 * @param {Object} customField - The custom field object to migrate
 * @returns {Object} - The migrated custom field in new format
 */
export const migrateCustomFieldNoteToText = (customField) => {
  if (customField === null || customField === undefined) {
    return customField
  }

  // Determine the new type (convert legacy 'note' to 'text')
  const newType =
    customField.type === 'note' || customField.type === 'text'
      ? 'text'
      : customField.type

  // Determine the content value (prefer 'content' over legacy 'note')
  let contentValue
  if (customField.content !== undefined) {
    contentValue = customField.content
  } else if (customField.note !== undefined) {
    contentValue = customField.note
  }

  return {
    type: newType,
    content: contentValue
  }
}

/**
 * Checks if a custom field type is valid (either legacy 'note' or new 'text')
 *
 * @param {string} type - The custom field type to check
 * @returns {boolean} - True if the type is valid
 */
export const isValidCustomFieldType = (type) => {
  return type === 'note' || type === 'text'
}

