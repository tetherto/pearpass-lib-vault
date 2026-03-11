import { generateHotpNext } from './generateHotpNext'
import { pearpassVaultClient } from '../instances'

describe('generateHotpNext', () => {
  it('should call pearpassVaultClient.generateHotpNext with the record ID', async () => {
    const mockResult = { code: '123456', counter: 5 }
    pearpassVaultClient.generateHotpNext.mockResolvedValueOnce(mockResult)

    const result = await generateHotpNext('record-1')

    expect(pearpassVaultClient.generateHotpNext).toHaveBeenCalledTimes(1)
    expect(pearpassVaultClient.generateHotpNext).toHaveBeenCalledWith(
      'record-1'
    )
    expect(result).toEqual(mockResult)
  })

  it('should throw when recordId is not provided', async () => {
    await expect(generateHotpNext()).rejects.toThrow('Record ID is required')
    await expect(generateHotpNext('')).rejects.toThrow('Record ID is required')
  })

  it('should propagate errors from the client', async () => {
    const error = new Error('HOTP generation failed')
    pearpassVaultClient.generateHotpNext.mockRejectedValueOnce(error)

    await expect(generateHotpNext('record-1')).rejects.toThrow(error)
  })
})
