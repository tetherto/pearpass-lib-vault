import { Validator } from 'pear-apps-utils-validator'

import {
  isValidCustomFieldType,
  migrateCustomFieldNoteToText
} from './migrateCustomFieldNoteToText'

export const customFieldSchema = Validator.object({
  type: Validator.string().required(),
  content: Validator.string()
})

/**
 * Validates and prepares custom fields, migrating legacy format to new format.
 *
 * Legacy format: { type: 'note', note: 'content' }
 * New format: { type: 'text', content: 'content' }
 *
 * @param {Array} customFields - Array of custom field objects
 * @returns {Array} - Array of validated and migrated custom field objects
 */
export const validateAndPrepareCustomFields = (customFields) => {
  const customFieldsData =
    customFields?.map((customField) => {
      // Support both legacy 'note' type and new 'text' type
      if (isValidCustomFieldType(customField.type)) {
        return migrateCustomFieldNoteToText(customField)
      }

      throw new Error(`Invalid custom field type: ${customField.type}`)
    }) ?? []

  return customFieldsData
}
