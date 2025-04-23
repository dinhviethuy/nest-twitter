import { SetMetadata } from '@nestjs/common'
import { AuthType, AuthTypeType, ConditionGuard, ConditionGuardType } from '../constants/users.contants'

export const AUTH_TYPE_KEY = 'authType'
export const SKIP_AUTH_KEY = 'skipAuth'
export type AuthTypeDecoratorPayload = { authTypes: AuthTypeType[]; options: { condition: ConditionGuardType } }

export const Auth = (
  authTypes: AuthTypeType[],
  options?: {
    condition: ConditionGuardType
  },
) => {
  return SetMetadata(AUTH_TYPE_KEY, {
    authTypes,
    options: options ?? { condition: ConditionGuard.And },
  })
}

export const IsPublic = () => Auth([AuthType.None])

export const SkipAuth = () => SetMetadata(SKIP_AUTH_KEY, true)
