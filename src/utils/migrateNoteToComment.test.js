import { migrateNoteToComment } from './migrateNoteToComment'

describe('migrateNoteToComment', () => {
  describe('when data is null or undefined', () => {
    test('should return undefined for null data', () => {
      expect(migrateNoteToComment(null)).toBeUndefined()
    })

    test('should return undefined for undefined data', () => {
      expect(migrateNoteToComment(undefined)).toBeUndefined()
    })
  })

  describe('when only comment field exists (new format)', () => {
    test('should return comment value', () => {
      const data = { comment: 'This is a comment' }
      expect(migrateNoteToComment(data)).toBe('This is a comment')
    })

    test('should return empty string if comment is empty', () => {
      const data = { comment: '' }
      expect(migrateNoteToComment(data)).toBe('')
    })

    test('should return null if comment is null', () => {
      const data = { comment: null }
      expect(migrateNoteToComment(data)).toBeNull()
    })
  })

  describe('when only note field exists (legacy format)', () => {
    test('should migrate note value to comment', () => {
      const data = { note: 'This is a legacy note' }
      expect(migrateNoteToComment(data)).toBe('This is a legacy note')
    })

    test('should migrate empty string note', () => {
      const data = { note: '' }
      expect(migrateNoteToComment(data)).toBe('')
    })

    test('should migrate null note', () => {
      const data = { note: null }
      expect(migrateNoteToComment(data)).toBeNull()
    })
  })

  describe('when both note and comment fields exist', () => {
    test('should prefer comment over note (newer data takes precedence)', () => {
      const data = { note: 'Legacy note', comment: 'New comment' }
      expect(migrateNoteToComment(data)).toBe('New comment')
    })

    test('should prefer comment even if it is empty', () => {
      const data = { note: 'Legacy note', comment: '' }
      expect(migrateNoteToComment(data)).toBe('')
    })

    test('should prefer comment even if it is null', () => {
      const data = { note: 'Legacy note', comment: null }
      expect(migrateNoteToComment(data)).toBeNull()
    })
  })

  describe('when neither note nor comment field exists', () => {
    test('should return undefined for empty object', () => {
      const data = {}
      expect(migrateNoteToComment(data)).toBeUndefined()
    })

    test('should return undefined for object with other fields', () => {
      const data = { title: 'My Title', password: 'secret' }
      expect(migrateNoteToComment(data)).toBeUndefined()
    })
  })
})

