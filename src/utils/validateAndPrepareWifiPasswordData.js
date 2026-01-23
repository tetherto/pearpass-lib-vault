import { Validator } from 'pear-apps-utils-validator'

import {
  customFieldSchema,
  validateAndPrepareCustomFields
} from './validateAndPrepareCustomFields'
import { migrateNoteToComment } from './migrateNoteToComment'

export const wifiPasswordSchema = Validator.object({
  title: Validator.string().required(),
  password: Validator.string().required(),
  comment: Validator.string(),
  customFields: Validator.array().items(customFieldSchema)
})

export const validateAndPrepareWifiPasswordData = (wifiPassword) => {
  const wifiPasswordData = {
    title: wifiPassword.title,
    password: wifiPassword.password,
    comment: migrateNoteToComment(wifiPassword),
    customFields: validateAndPrepareCustomFields(wifiPassword.customFields)
  }

  const errors = wifiPasswordSchema.validate(wifiPasswordData)

  if (errors) {
    throw new Error(
      `Invalid wifi password data: ${JSON.stringify(errors, null, 2)}`
    )
  }

  return wifiPasswordData
}
