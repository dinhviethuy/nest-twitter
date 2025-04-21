import {
  ConflictException,
  HttpException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common'
import { UsersRepo } from './users.repo'
import { LoginBodyType, RefreshTokenBodyType, RegisterBodyType } from './users.model'
import { isUniqueConstraintPrismaError } from '@/shared/utils/utils'
import { SharedUserRepo } from '../../shared/repositories/shared-user.repo'
import { HashingService } from '../../shared/services/hashing.service'
import { TokenService } from '@/shared/services/token.service'
import { TokenType } from '@/shared/constants/token.constants'

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepo: UsersRepo,
    private readonly sharedUserRepo: SharedUserRepo,
    private readonly hashingService: HashingService,
    private readonly tokenService: TokenService,
  ) {}

  async login(data: LoginBodyType) {
    const user = await this.sharedUserRepo.findUnique({
      email: data.email,
    })
    if (!user) {
      throw new NotFoundException('User không tồn tại')
    }
    const isPasswordValid = await this.hashingService.compare(data.password, user.password)
    if (!isPasswordValid) {
      throw new UnprocessableEntityException('Mật khẩu không chính xác')
    }
    return this.usersRepo.login(user.id)
  }

  async register(data: RegisterBodyType) {
    try {
      const user = await this.usersRepo.register(data)
      return user
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw new ConflictException('Email đã tồn tại')
      }
      throw error
    }
  }

  async generateTokens(userId: number) {
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.signAccessToken({
        userId,
        token_type: TokenType.AccessToken,
      }),
      this.tokenService.signRefreshToken({
        userId,
        token_type: TokenType.RefreshToken,
      }),
    ])
    const decodedRefreshToken = await this.tokenService.verifyRefreshToken(refreshToken)
    await this.usersRepo.createRefreshToken({
      token: refreshToken,
      userId,
      expiresAt: new Date(decodedRefreshToken.exp * 1000),
    })
    return {
      accessToken,
      refreshToken,
    }
  }

  async refreshToken(data: RefreshTokenBodyType) {
    try {
      const { token_type, userId } = await this.tokenService.verifyRefreshToken(data.refreshToken)
      if (token_type !== TokenType.RefreshToken) {
        throw new UnauthorizedException('Refresh token không hợp lệ')
      }
      const refreshTokenInDb = await this.usersRepo.findUniqueRefreshTokenIncludeUserRole({ token: data.refreshToken })
      if (!refreshTokenInDb) {
        throw new UnauthorizedException('Refresh token không tồn tại')
      }

      const $createRefreshToken = this.generateTokens(userId)
      const $deleteRefreshToken = this.usersRepo.deleteRefreshToken(data.refreshToken)

      const [tokens] = await Promise.all([$createRefreshToken, $deleteRefreshToken])
      return tokens
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new UnauthorizedException('Refresh token không hợp lệ')
    }
  }
}
