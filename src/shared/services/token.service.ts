import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { v4 as uuid } from 'uuid'
import envConfig from '@/shared/config'
import {
  AccessTokenPayloadCreate,
  AccessTokenPayload,
  RefreshTokenPayload,
  RefreshTokenPayloadCreate,
  EmailVerifyTokenPayloadCreate,
  EmailVerifyTokenPayload,
  ForgotPasswordTokenPayloadCreate,
  ForgotPasswordTokenPayload,
} from '../types/jwt.types'

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  signAccessToken(payload: AccessTokenPayloadCreate) {
    return this.jwtService.sign(
      {
        ...payload,
        uuid: uuid(),
      },
      {
        secret: envConfig.ACCESS_TOKEN_SECRET,
        expiresIn: envConfig.ACCESS_TOKEN_EXPIRES_IN,
        algorithm: 'HS256',
      },
    )
  }

  signRefreshToken(payload: RefreshTokenPayloadCreate) {
    return this.jwtService.sign(
      {
        ...payload,
        uuid: uuid(),
      },
      {
        secret: envConfig.REFRESH_TOKEN_SECRET,
        expiresIn: envConfig.REFRESH_TOKEN_EXPIRES_IN,
        algorithm: 'HS256',
      },
    )
  }

  verifyAccessToken(token: string): Promise<AccessTokenPayload> {
    return this.jwtService.verifyAsync(token, {
      secret: envConfig.ACCESS_TOKEN_SECRET,
    })
  }

  verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
    return this.jwtService.verifyAsync(token, {
      secret: envConfig.REFRESH_TOKEN_SECRET,
    })
  }

  signEmailVerifyToken(payload: EmailVerifyTokenPayloadCreate) {
    return this.jwtService.sign(
      {
        ...payload,
        uuid: uuid(),
      },
      {
        secret: envConfig.EMAIL_VERIFY_TOKEN_SECRET,
        expiresIn: envConfig.EMAIL_VERIFY_TOKEN_EXPIRES_IN,
        algorithm: 'HS256',
      },
    )
  }

  verifyEmailVerifyToken(token: string): Promise<EmailVerifyTokenPayload> {
    return this.jwtService.verifyAsync(token, {
      secret: envConfig.EMAIL_VERIFY_TOKEN_SECRET,
    })
  }

  signForgotPasswordToken(payload: ForgotPasswordTokenPayloadCreate) {
    return this.jwtService.sign(
      {
        ...payload,
        uuid: uuid(),
      },
      {
        secret: envConfig.FORGOT_PASSWORD_TOKEN_SECRET,
        expiresIn: envConfig.FORGOT_PASSWORD_TOKEN_EXPIRES_IN,
        algorithm: 'HS256',
      },
    )
  }

  verifyForgotPasswordToken(token: string): Promise<ForgotPasswordTokenPayload> {
    return this.jwtService.verifyAsync(token, {
      secret: envConfig.FORGOT_PASSWORD_TOKEN_SECRET,
    })
  }
}
