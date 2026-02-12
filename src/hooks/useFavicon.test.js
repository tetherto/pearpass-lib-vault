import { renderHook, waitFor } from '@testing-library/react'

import { useFavicon } from './useFavicon'
import { fetchFavicon } from '../api/fetchFavicon'

jest.mock('../api/fetchFavicon', () => ({
  fetchFavicon: jest.fn()
}))

describe('useFavicon', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    console.warn = jest.fn()
  })

  test('should return initial state correctly', () => {
    const { result } = renderHook(() => useFavicon({ url: '' }))

    expect(result.current).toEqual({
      faviconSrc: null,
      isLoading: false,
      hasError: false
    })
  })

  test('should fetch favicon successfully', async () => {
    const mockFavicon = 'blob:http://example.com/favicon'
    fetchFavicon.mockResolvedValue({ favicon: mockFavicon })

    const { result } = renderHook(() =>
      useFavicon({ url: 'http://example.com' })
    )

    // Initially loading should be true
    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current).toEqual({
      faviconSrc: mockFavicon,
      isLoading: false,
      hasError: false
    })
    expect(fetchFavicon).toHaveBeenCalledWith('http://example.com')
  })

  test('should handle missing favicon in response', async () => {
    fetchFavicon.mockResolvedValue({ favicon: null })

    const { result } = renderHook(() =>
      useFavicon({ url: 'http://example.com' })
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current).toEqual({
      faviconSrc: null,
      isLoading: false,
      hasError: true
    })
  })

  test('should handle fetch errors', async () => {
    const error = new Error('Network error')
    fetchFavicon.mockRejectedValue(error)

    const { result } = renderHook(() =>
      useFavicon({ url: 'http://example.com' })
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current).toEqual({
      faviconSrc: null,
      isLoading: false,
      hasError: true
    })
    expect(console.warn).toHaveBeenCalledWith('Favicon fetch failed:', error)
  })

  test('should not fetch if url is empty', () => {
    const { result } = renderHook(() => useFavicon({ url: '' }))

    expect(result.current.faviconSrc).toBeNull()
    expect(fetchFavicon).not.toHaveBeenCalled()
  })

  test('should update when url changes', async () => {
    const mockFavicon1 = 'blob:1'
    const mockFavicon2 = 'blob:2'

    fetchFavicon
      .mockResolvedValueOnce({ favicon: mockFavicon1 })
      .mockResolvedValueOnce({ favicon: mockFavicon2 })

    const { result, rerender } = renderHook(({ url }) => useFavicon({ url }), {
      initialProps: { url: 'http://example.com/1' }
    })

    await waitFor(() => {
      expect(result.current.faviconSrc).toBe(mockFavicon1)
    })

    rerender({ url: 'http://example.com/2' })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.faviconSrc).toBe(mockFavicon2)
    })

    expect(fetchFavicon).toHaveBeenCalledTimes(2)
  })
})
