import { validateAndPrepareCustomFields } from './validateAndPrepareCustomFields'

describe('validateAndPrepareCustomFields', () => {
  test('returns empty array when customFields is null', () => {
    const result = validateAndPrepareCustomFields(null)
    expect(result).toEqual([])
  })

  test('returns empty array when customFields is undefined', () => {
    const result = validateAndPrepareCustomFields(undefined)
    expect(result).toEqual([])
  })

  describe('new format (type: text, content property)', () => {
    test('processes text type custom fields correctly', () => {
      const customFields = [{ type: 'text', content: 'Test content' }]
      const result = validateAndPrepareCustomFields(customFields)
      expect(result).toEqual([{ type: 'text', content: 'Test content' }])
    })

    test('processes multiple text type custom fields correctly', () => {
      const customFields = [
        { type: 'text', content: 'Test content 1' },
        { type: 'text', content: 'Test content 2' }
      ]
      const result = validateAndPrepareCustomFields(customFields)
      expect(result).toEqual([
        { type: 'text', content: 'Test content 1' },
        { type: 'text', content: 'Test content 2' }
      ])
    })
  })

  describe('legacy format migration (type: note, note property)', () => {
    test('migrates legacy note type to text type', () => {
      const customFields = [{ type: 'note', note: 'Test note' }]
      const result = validateAndPrepareCustomFields(customFields)
      expect(result).toEqual([{ type: 'text', content: 'Test note' }])
    })

    test('migrates multiple legacy note type custom fields', () => {
      const customFields = [
        { type: 'note', note: 'Test note 1' },
        { type: 'note', note: 'Test note 2' }
      ]
      const result = validateAndPrepareCustomFields(customFields)
      expect(result).toEqual([
        { type: 'text', content: 'Test note 1' },
        { type: 'text', content: 'Test note 2' }
      ])
    })

    test('prefers content over note when both exist', () => {
      const customFields = [
        { type: 'note', note: 'Legacy note', content: 'New content' }
      ]
      const result = validateAndPrepareCustomFields(customFields)
      expect(result).toEqual([{ type: 'text', content: 'New content' }])
    })
  })

  describe('mixed format handling', () => {
    test('handles mix of legacy and new format custom fields', () => {
      const customFields = [
        { type: 'note', note: 'Legacy note' },
        { type: 'text', content: 'New content' }
      ]
      const result = validateAndPrepareCustomFields(customFields)
      expect(result).toEqual([
        { type: 'text', content: 'Legacy note' },
        { type: 'text', content: 'New content' }
      ])
    })
  })

  test('throws error for invalid custom field type', () => {
    const customFields = [{ type: 'invalid', content: 'Test content' }]
    expect(() => {
      validateAndPrepareCustomFields(customFields)
    }).toThrow('Invalid custom field type: invalid')
  })

  test('throws error if one of multiple fields has invalid type', () => {
    const customFields = [
      { type: 'note', note: 'Valid note' },
      { type: 'invalid', note: 'Invalid type' }
    ]
    expect(() => {
      validateAndPrepareCustomFields(customFields)
    }).toThrow('Invalid custom field type: invalid')
  })
})
