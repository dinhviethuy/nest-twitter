import { CanActivate, ExecutionContext, HttpException, Injectable, UnauthorizedException } from '@nestjs/common'
import { AccessTokenPayload } from '../types/jwt.types'
import { TokenType } from '../constants/token.constants'
import { REQUEST_USER_KEY } from '../constants/users.contants'
import { TokenService } from '../services/token.service'

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    await this.extractAndValidateToken(request)
    return true
  }

  private extractAccessTokenFromHeader(request: any): string {
    const accessToken = request.headers['authorization']?.split(' ')[1]
    if (!accessToken) {
      throw new UnauthorizedException('Không tìm thấy access token trong header')
    }
    return accessToken
  }

  private async extractAndValidateToken(request: any): Promise<AccessTokenPayload> {
    const accessToken = this.extractAccessTokenFromHeader(request)
    try {
      const decodedAccessToken = await this.tokenService.verifyAccessToken(accessToken)
      const { token_type } = decodedAccessToken
      if (token_type !== TokenType.AccessToken) {
        throw new UnauthorizedException('Access token không hợp lệ')
      }
      request[REQUEST_USER_KEY] = decodedAccessToken
      return decodedAccessToken
    } catch (error) {
      console.error('Error verifying access token:', error)
      if (error instanceof HttpException) {
        throw error
      }
      throw new UnauthorizedException('Access token không hợp lệ')
    }
  }
}
