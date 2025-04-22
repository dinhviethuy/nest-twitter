import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../shared/services/prisma.service'
import { TokenService } from '../../shared/services/token.service'
import { HashingService } from '../../shared/services/hashing.service'
import { RegisterBodyType, UserResponseType } from './users.model'
import { TokenType } from '@/shared/constants/token.constants'
import { UserVerifyStatus } from '@/shared/constants/users.contants'

@Injectable()
export class UsersRepo {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly tokenService: TokenService,
    private readonly hashingService: HashingService,
  ) {}

  async login(userId: number): Promise<UserResponseType> {
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.signAccessToken({ userId, token_type: TokenType.AccessToken }),
      this.tokenService.signRefreshToken({ userId, token_type: TokenType.RefreshToken }),
    ])
    const { exp } = await this.tokenService.verifyRefreshToken(refreshToken)
    await this.createRefreshToken({
      expiresAt: new Date(exp * 1000),
      token: refreshToken,
      userId,
    })

    return {
      accessToken,
      refreshToken,
    }
  }

  async register(data: RegisterBodyType): Promise<UserResponseType> {
    const hashedPassword = await this.hashingService.hash(data.password)
    const user = await this.prismaService.user.create({
      data: {
        email: data.email,
        dateOfBirth: data.dateOfBirth,
        name: data.name,
        password: hashedPassword,
      },
    })
    const [accessToken, refreshToken, emailVerifyToken] = await Promise.all([
      this.tokenService.signAccessToken({ userId: user.id, token_type: TokenType.AccessToken }),
      this.tokenService.signRefreshToken({ userId: user.id, token_type: TokenType.RefreshToken }),
      this.tokenService.signEmailVerifyToken({
        userId: user.id,
        token_type: TokenType.EmailVerifyToken,
      }),
    ])
    await this.prismaService.user.update({
      where: { id: user.id },
      data: {
        emailVerifyToken,
      },
    })
    console.log('emailVerifyToken: ', emailVerifyToken)
    const { exp } = await this.tokenService.verifyRefreshToken(refreshToken)
    await this.createRefreshToken({
      expiresAt: new Date(exp * 1000),
      token: refreshToken,
      userId: user.id,
    })
    return {
      accessToken,
      refreshToken,
    }
  }

  async deleteRefreshToken(token: string) {
    await this.prismaService.refreshToken.delete({
      where: {
        token,
      },
    })
  }

  async findUniqueRefreshTokenIncludeUserRole(uniqueObject: { token: string }) {
    return this.prismaService.refreshToken.findUnique({
      where: uniqueObject,
    })
  }

  createRefreshToken(data: { userId: number; token: string; expiresAt: Date }) {
    return this.prismaService.refreshToken.create({
      data,
    })
  }

  async verifyEmail(user_id: number) {
    return this.prismaService.user.update({
      where: { id: user_id },
      data: {
        emailVerifyToken: '',
        verify: UserVerifyStatus.Verified,
      },
    })
  }

  async resendVerifyEmail(userId: number) {
    const emailVerifyToken = this.tokenService.signEmailVerifyToken({
      userId,
      token_type: TokenType.EmailVerifyToken,
    })
    console.log('Resend emailVerifyToken: ', emailVerifyToken)
    return this.prismaService.user.update({
      where: { id: userId },
      data: {
        emailVerifyToken,
      },
    })
  }
}
