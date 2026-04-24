import { useCallback } from 'react'

import { useDispatch, useSelector } from 'react-redux'

import { createInvite as createInviteAction } from '../actions/createInvite'
import { deleteInvite as deleteInviteAction } from '../actions/deleteInvite'
import { selectInvite } from '../selectors/selectInvite'

/**
 * @returns {{
 *  isLoading: boolean
 *  data: any
 *  createInvite: () => Promise<void>
 *  deleteInvite: () => Promise<void>
 * }}
 */
export const useInvite = () => {
  const dispatch = useDispatch()
  const { isLoading, data } = useSelector(selectInvite)

  const createInvite = useCallback(
    () => dispatch(createInviteAction()),
    [dispatch]
  )

  const deleteInvite = useCallback(
    () => dispatch(deleteInviteAction()),
    [dispatch]
  )

  return {
    isLoading,
    data,
    createInvite,
    deleteInvite
  }
}
