import { matchPatternToValue } from 'pear-apps-utils-pattern-search'

import { selectRecords } from './selectRecords'

jest.mock('pear-apps-utils-pattern-search', () => ({
  matchPatternToValue: jest.fn()
}))

describe('selectRecords', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    matchPatternToValue.mockReturnValue(false)
  })

  const mockState = {
    vault: {
      isLoading: false,
      data: {
        records: [
          {
            id: '1',
            folder: 'work',
            data: {
              title: 'Work Password',
              username: 'john@work.com',
              websites: ['https://work.example.com']
            },
            type: 'login',
            isFavorite: true,
            createdAt: 100,
            updatedAt: 200
          },
          {
            id: '2',
            folder: 'personal',
            data: {
              title: 'Personal Password',
              username: 'john@personal.com',
              note: 'My personal login'
            },
            type: 'login',
            isFavorite: false,
            createdAt: 300,
            updatedAt: 400
          },
          {
            id: '3',
            folder: 'work',
            data: { title: 'Work Note', note: 'Important work notes' },
            type: 'note',
            isFavorite: false,
            createdAt: 150,
            updatedAt: 250
          },
          {
            id: '4',
            folder: null,
            data: { title: 'No Folder' },
            type: 'password',
            isFavorite: false,
            createdAt: 50,
            updatedAt: 150
          },
          {
            id: '5',
            folder: 'documents',
            isFavorite: false,
            createdAt: 200,
            updatedAt: 300
          },
          {
            id: '6',
            folder: 'finance',
            data: {
              title: 'My Credit Card',
              name: 'John Doe',
              note: 'Primary card'
            },
            type: 'creditCard',
            isFavorite: false,
            createdAt: 250,
            updatedAt: 350
          },
          {
            id: '7',
            folder: 'home',
            data: { title: 'Home WiFi', note: 'Router password' },
            type: 'wifiPassword',
            isFavorite: false,
            createdAt: 275,
            updatedAt: 375
          },
          {
            id: '8',
            folder: 'personal',
            data: {
              title: 'My Identity',
              email: 'john@identity.com',
              note: 'Personal identity'
            },
            type: 'identity',
            isFavorite: false,
            createdAt: 280,
            updatedAt: 380
          }
        ]
      }
    }
  }

  test('should return all records when no filters are provided', () => {
    const selector = selectRecords()
    const result = selector(mockState)

    expect(result.isLoading).toBe(false)
    expect(result.data).toHaveLength(7)
    expect(result.data[0].id).toBe('1')
  })

  test('should filter by folder', () => {
    const selector = selectRecords({ filters: { folder: 'work' } })
    const result = selector(mockState)

    expect(result.data).toHaveLength(2)
    expect(result.data.every((record) => record.folder === 'work')).toBe(true)
  })

  test('should filter by null folder', () => {
    const selector = selectRecords({ filters: { folder: null } })
    const result = selector(mockState)

    expect(result.data).toHaveLength(1)
    expect(result.data[0].id).toBe('4')
  })

  test('should filter by type', () => {
    const selector = selectRecords({ filters: { type: 'note' } })
    const result = selector(mockState)

    expect(result.data).toHaveLength(1)
    expect(result.data[0].type).toBe('note')
  })

  test('should filter by favorites', () => {
    const selector = selectRecords({ filters: { isFavorite: true } })
    const result = selector(mockState)

    expect(result.data).toHaveLength(1)
    expect(result.data[0].isFavorite).toBe(true)
  })

  test('should include folders when isFolder filter is true', () => {
    const selector = selectRecords({ filters: { isFolder: true } })
    const result = selector(mockState)

    expect(result.data).toHaveLength(8)
  })

  test('should filter by search pattern matching title', () => {
    matchPatternToValue.mockImplementation((pattern, value) => {
      if (value && pattern === 'work') {
        return value.toLowerCase().includes('work')
      }
      return false
    })

    const selector = selectRecords({ filters: { searchPattern: 'work' } })
    const result = selector(mockState)

    expect(matchPatternToValue).toHaveBeenCalled()
    expect(result.data.length).toBeGreaterThan(0)
  })

  test('should filter by search pattern matching username', () => {
    matchPatternToValue.mockImplementation((pattern, value) => {
      if (value && pattern === 'john@work') {
        return value.toLowerCase().includes('john@work')
      }
      return false
    })

    const selector = selectRecords({ filters: { searchPattern: 'john@work' } })
    const result = selector(mockState)

    expect(matchPatternToValue).toHaveBeenCalled()
    expect(result.data).toHaveLength(1)
    expect(result.data[0].id).toBe('1')
  })

  test('should filter by search pattern matching email in identity', () => {
    matchPatternToValue.mockImplementation((pattern, value) => {
      if (value && pattern === 'identity.com') {
        return value.toLowerCase().includes('identity.com')
      }
      return false
    })

    const selector = selectRecords({
      filters: { searchPattern: 'identity.com' }
    })
    const result = selector(mockState)

    expect(matchPatternToValue).toHaveBeenCalled()
    expect(result.data).toHaveLength(1)
    expect(result.data[0].id).toBe('8')
  })

  test('should filter by search pattern matching website', () => {
    matchPatternToValue.mockImplementation((pattern, value) => {
      if (value && pattern === 'work.example') {
        return value.toLowerCase().includes('work.example')
      }
      return false
    })

    const selector = selectRecords({
      filters: { searchPattern: 'work.example' }
    })
    const result = selector(mockState)

    expect(matchPatternToValue).toHaveBeenCalled()
    expect(result.data).toHaveLength(1)
    expect(result.data[0].id).toBe('1')
  })

  test('should filter by search pattern matching note content', () => {
    matchPatternToValue.mockImplementation((pattern, value) => {
      if (value && pattern === 'router') {
        return value.toLowerCase().includes('router')
      }
      return false
    })

    const selector = selectRecords({ filters: { searchPattern: 'router' } })
    const result = selector(mockState)

    expect(matchPatternToValue).toHaveBeenCalled()
    expect(result.data).toHaveLength(1)
    expect(result.data[0].id).toBe('7')
  })

  test('should filter by search pattern matching name on card', () => {
    matchPatternToValue.mockImplementation((pattern, value) => {
      if (value && pattern === 'john doe') {
        return value.toLowerCase().includes('john doe')
      }
      return false
    })

    const selector = selectRecords({ filters: { searchPattern: 'john doe' } })
    const result = selector(mockState)

    expect(matchPatternToValue).toHaveBeenCalled()
    expect(result.data).toHaveLength(1)
    expect(result.data[0].id).toBe('6')
  })

  test('should search only within selected type', () => {
    matchPatternToValue.mockImplementation((pattern, value) => {
      if (value && pattern === 'personal') {
        return value.toLowerCase().includes('personal')
      }
      return false
    })

    const selector = selectRecords({
      filters: { searchPattern: 'personal', type: 'login' }
    })
    const result = selector(mockState)

    expect(matchPatternToValue).toHaveBeenCalled()
    expect(result.data.length).toBe(1)
    expect(result.data[0].type).toBe('login')
  })

  test('should search only within selected folder', () => {
    matchPatternToValue.mockImplementation((pattern, value) => {
      if (value && pattern === 'work') {
        return value.toLowerCase().includes('work')
      }
      return false
    })

    const selector = selectRecords({
      filters: { searchPattern: 'work', folder: 'work' }
    })
    const result = selector(mockState)

    expect(matchPatternToValue).toHaveBeenCalled()
    expect(result.data.every((record) => record.folder === 'work')).toBe(true)
  })

  test('should return all records when no search pattern provided', () => {
    const selector = selectRecords({ filters: { searchPattern: '' } })
    const result = selector(mockState)

    // matchPatternToValue should not be called for empty search
    expect(result.data).toHaveLength(7)
  })

  test('should sort by updatedAt in ascending order', () => {
    const selector = selectRecords({
      sort: { key: 'updatedAt', direction: 'asc' }
    })
    const result = selector(mockState)

    expect(result.data[0].id).toBe('1')
    expect(result.data[1].updatedAt).toBeLessThan(result.data[2].updatedAt)
  })

  test('should sort by updatedAt in descending order', () => {
    const selector = selectRecords({
      sort: { key: 'updatedAt', direction: 'desc' }
    })
    const result = selector(mockState)

    expect(result.data[0].id).toBe('1')
    expect(result.data[1].updatedAt).toBeGreaterThan(result.data[2].updatedAt)
  })

  test('should sort by createdAt', () => {
    const selector = selectRecords({
      sort: { key: 'createdAt', direction: 'desc' }
    })
    const result = selector(mockState)

    expect(result.data[0].id).toBe('1')
    expect(result.data[1].createdAt).toBeGreaterThan(result.data[2].createdAt)
  })

  test('should filter by hasOtp — only records with otpPublic', () => {
    const stateWithOtp = {
      vault: {
        isLoading: false,
        data: {
          records: [
            {
              id: '1',
              data: { title: 'With OTP' },
              type: 'login',
              otpPublic: { type: 'TOTP', currentCode: '123456' }
            },
            {
              id: '2',
              data: { title: 'Without OTP' },
              type: 'login'
            },
            {
              id: '3',
              data: { title: 'Also with OTP' },
              type: 'login',
              otpPublic: { type: 'HOTP', currentCode: '654321' }
            }
          ]
        }
      }
    }

    const selector = selectRecords({ filters: { hasOtp: true } })
    const result = selector(stateWithOtp)

    expect(result.data).toHaveLength(2)
    expect(result.data.map((r) => r.id)).toEqual(['1', '3'])
  })

  test('should return all records when hasOtp is false or not set', () => {
    const stateWithOtp = {
      vault: {
        isLoading: false,
        data: {
          records: [
            {
              id: '1',
              data: { title: 'With OTP' },
              type: 'login',
              otpPublic: { type: 'TOTP', currentCode: '123456' }
            },
            {
              id: '2',
              data: { title: 'Without OTP' },
              type: 'login'
            }
          ]
        }
      }
    }

    const selector = selectRecords({ filters: { hasOtp: false } })
    const result = selector(stateWithOtp)

    expect(result.data).toHaveLength(2)
  })

  test('should handle empty state gracefully', () => {
    const emptyState = { vault: {} }
    const selector = selectRecords()
    const result = selector(emptyState)

    expect(result.data).toEqual([])
  })
})
