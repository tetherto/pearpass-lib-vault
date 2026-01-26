import { useState } from 'react'

import { MS_PER_SECOND } from 'pearpass-lib-constants'
import { useDispatch } from 'react-redux'

import { getVaultById } from '../actions/getVaultById'
import { cancelPairActiveVault as cancelPairActiveVaultApi } from '../api/cancelPairActiveVault'
import { initListener } from '../api/initListener'
import { pairActiveVault as pairActiveVaultApi } from '../api/pairActiveVault'

/**
 * @returns {{
 *  pairActiveVault: (inviteCode: string) => Promise<string>
 *  cancelPairActiveVault: () => Promise<void>,
 *  isLoading: boolean
 *  }}
 */
export const usePair = () => {
  const dispatch = useDispatch()

  const [isLoading, setIsLoading] = useState(false)

  const pairActiveVault = async (inviteCode) => {
    setIsLoading(true)

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error('Request timed out')),
          MS_PER_SECOND * 30
        )
      )

      const vaultId = await Promise.race([
        pairActiveVaultApi(inviteCode),
        timeoutPromise
      ])

      await initListener({
        vaultId,
        onUpdate: () => {
          dispatch(getVaultById({ vaultId }))
        }
      })

      setIsLoading(false)
      return vaultId
    } catch (error) {
      setIsLoading(false)
      if (error.message === 'Request timed out') {
        await cancelPairActiveVaultApi()
      }
      throw error
    }
  }

  const cancelPairActiveVault = async () => {
    setIsLoading(false)
    await cancelPairActiveVaultApi()
  }

  return { pairActiveVault, cancelPairActiveVault, isLoading }
}
