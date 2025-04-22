import { TokenTypeType } from '../constants/token.constants'

export interface AccessTokenPayloadCreate {
  userId: number
  token_type: TokenTypeType
}

export interface AccessTokenPayload extends AccessTokenPayloadCreate {
  iat: number
  exp: number
}

export interface RefreshTokenPayloadCreate {
  userId: number
  token_type: TokenTypeType
}

export interface RefreshTokenPayload extends RefreshTokenPayloadCreate {
  iat: number
  exp: number
}

export interface EmailVerifyTokenPayloadCreate {
  userId: number
  token_type: TokenTypeType
}

export interface EmailVerifyTokenPayload extends EmailVerifyTokenPayloadCreate {
  iat: number
  exp: number
}
