import {
  isValidCustomFieldType,
  migrateCustomFieldNoteToText
} from './migrateCustomFieldNoteToText'

describe('migrateCustomFieldNoteToText', () => {
  describe('when customField is null or undefined', () => {
    test('should return null for null input', () => {
      expect(migrateCustomFieldNoteToText(null)).toBeNull()
    })

    test('should return undefined for undefined input', () => {
      expect(migrateCustomFieldNoteToText(undefined)).toBeUndefined()
    })
  })

  describe('when customField has new format (type: text, content property)', () => {
    test('should keep type as text and use content', () => {
      const customField = { type: 'text', content: 'Some content' }
      const result = migrateCustomFieldNoteToText(customField)
      expect(result).toEqual({ type: 'text', content: 'Some content' })
    })

    test('should handle empty content', () => {
      const customField = { type: 'text', content: '' }
      const result = migrateCustomFieldNoteToText(customField)
      expect(result).toEqual({ type: 'text', content: '' })
    })
  })

  describe('when customField has legacy format (type: note, note property)', () => {
    test('should convert type from note to text', () => {
      const customField = { type: 'note', note: 'Legacy note' }
      const result = migrateCustomFieldNoteToText(customField)
      expect(result.type).toBe('text')
    })

    test('should migrate note property to content', () => {
      const customField = { type: 'note', note: 'Legacy note' }
      const result = migrateCustomFieldNoteToText(customField)
      expect(result.content).toBe('Legacy note')
    })

    test('should handle empty note', () => {
      const customField = { type: 'note', note: '' }
      const result = migrateCustomFieldNoteToText(customField)
      expect(result).toEqual({ type: 'text', content: '' })
    })
  })

  describe('when customField has both note and content properties', () => {
    test('should prefer content over note', () => {
      const customField = {
        type: 'note',
        note: 'Legacy note',
        content: 'New content'
      }
      const result = migrateCustomFieldNoteToText(customField)
      expect(result.content).toBe('New content')
    })

    test('should prefer empty content over note', () => {
      const customField = { type: 'note', note: 'Legacy note', content: '' }
      const result = migrateCustomFieldNoteToText(customField)
      expect(result.content).toBe('')
    })
  })

  describe('when customField has neither note nor content', () => {
    test('should return undefined content', () => {
      const customField = { type: 'text' }
      const result = migrateCustomFieldNoteToText(customField)
      expect(result).toEqual({ type: 'text', content: undefined })
    })
  })
})

describe('isValidCustomFieldType', () => {
  test('should return true for legacy note type', () => {
    expect(isValidCustomFieldType('note')).toBe(true)
  })

  test('should return true for new text type', () => {
    expect(isValidCustomFieldType('text')).toBe(true)
  })

  test('should return false for invalid type', () => {
    expect(isValidCustomFieldType('invalid')).toBe(false)
  })

  test('should return false for empty string', () => {
    expect(isValidCustomFieldType('')).toBe(false)
  })

  test('should return false for undefined', () => {
    expect(isValidCustomFieldType(undefined)).toBe(false)
  })
})

