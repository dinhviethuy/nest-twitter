import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { v4 as uuid } from 'uuid'
import envConfig from '@/shared/config'

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  signAccessToken(payload: any) {
    return this.jwtService.sign(
      {
        payload,
        uuid: uuid(),
      },
      {
        secret: envConfig.ACCESS_TOKEN_SECRET,
        expiresIn: envConfig.ACCESS_TOKEN_EXPIRES_IN,
        algorithm: 'HS256',
      },
    )
  }

  signRefreshToken(payload: any) {
    return this.jwtService.sign(
      {
        payload,
        uuid: uuid(),
      },
      {
        secret: envConfig.REFRESH_TOKEN_SECRET,
        expiresIn: envConfig.REFRESH_TOKEN_EXPIRES_IN,
        algorithm: 'HS256',
      },
    )
  }

  verifyAccessToken(token: string) {
    return this.jwtService.verifyAsync(token, {
      secret: envConfig.ACCESS_TOKEN_SECRET,
    })
  }

  verifyRefreshToken(token: string) {
    return this.jwtService.verifyAsync(token, {
      secret: envConfig.REFRESH_TOKEN_SECRET,
    })
  }
}
