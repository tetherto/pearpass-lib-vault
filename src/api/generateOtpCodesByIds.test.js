import { generateOtpCodesByIds } from './generateOtpCodesByIds'
import { pearpassVaultClient } from '../instances'

describe('generateOtpCodesByIds', () => {
  it('should call pearpassVaultClient.generateOtpCodesByIds with the record IDs', async () => {
    const mockResult = [
      { recordId: 'r1', code: '123456', timeRemaining: 15 },
      { recordId: 'r2', code: '654321', timeRemaining: 15 }
    ]
    pearpassVaultClient.generateOtpCodesByIds.mockResolvedValueOnce(mockResult)

    const result = await generateOtpCodesByIds(['r1', 'r2'])

    expect(pearpassVaultClient.generateOtpCodesByIds).toHaveBeenCalledTimes(1)
    expect(pearpassVaultClient.generateOtpCodesByIds).toHaveBeenCalledWith([
      'r1',
      'r2'
    ])
    expect(result).toEqual(mockResult)
  })

  it('should throw when recordIds is empty or not provided', async () => {
    await expect(generateOtpCodesByIds([])).rejects.toThrow(
      'Record IDs are required'
    )
    await expect(generateOtpCodesByIds(null)).rejects.toThrow(
      'Record IDs are required'
    )
    await expect(generateOtpCodesByIds(undefined)).rejects.toThrow(
      'Record IDs are required'
    )
  })

  it('should propagate errors from the client', async () => {
    const error = new Error('OTP generation failed')
    pearpassVaultClient.generateOtpCodesByIds.mockRejectedValueOnce(error)

    await expect(generateOtpCodesByIds(['r1'])).rejects.toThrow(error)
  })
})
