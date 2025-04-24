import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../shared/services/prisma.service'
import { TokenService } from '../../shared/services/token.service'
import { HashingService } from '../../shared/services/hashing.service'
import {
  ChangePasswordBodyType,
  CreateTweetCircleBodyType,
  RegisterBodyType,
  ResetPasswordBodyType,
  UpdateMeProfileBodyType,
  UserResponseType,
} from './users.model'
import { TokenType } from '@/shared/constants/token.constants'
import { UserVerifyStatus, UserVerifyStatusType } from '@/shared/constants/users.contants'
import { MailService } from '@/shared/services/mail.service'

@Injectable()
export class UsersRepo {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly tokenService: TokenService,
    private readonly hashingService: HashingService,
    private readonly mailService: MailService,
  ) {}

  async login(userId: number, verify: UserVerifyStatusType): Promise<UserResponseType> {
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.signAccessToken({ userId, token_type: TokenType.AccessToken, verify }),
      this.tokenService.signRefreshToken({ userId, token_type: TokenType.RefreshToken, verify }),
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
      this.tokenService.signAccessToken({ userId: user.id, token_type: TokenType.AccessToken, verify: user.verify }),
      this.tokenService.signRefreshToken({ userId: user.id, token_type: TokenType.RefreshToken, verify: user.verify }),
      this.tokenService.signEmailVerifyToken({
        userId: user.id,
        token_type: TokenType.EmailVerifyToken,
        verify: UserVerifyStatus.Unverified,
      }),
    ])
    await this.prismaService.user.update({
      where: { id: user.id },
      data: {
        emailVerifyToken,
      },
    })
    const { exp } = await this.tokenService.verifyRefreshToken(refreshToken)
    await this.createRefreshToken({
      expiresAt: new Date(exp * 1000),
      token: refreshToken,
      userId: user.id,
    })
    await this.mailService.sendUserConfirmation({
      email: data.email,
      name: data.name,
      token: emailVerifyToken,
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

  async findUniqueRefreshToken(uniqueObject: { token: string }) {
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
    const user = await this.prismaService.user.update({
      where: { id: user_id },
      data: {
        emailVerifyToken: '',
        verify: UserVerifyStatus.Verified,
      },
    })
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.signAccessToken({ userId: user.id, token_type: TokenType.AccessToken, verify: user.verify }),
      this.tokenService.signRefreshToken({ userId: user.id, token_type: TokenType.RefreshToken, verify: user.verify }),
    ])
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

  async resendVerifyEmail({ userId, verify }: { userId: number; verify: UserVerifyStatusType }) {
    const emailVerifyToken = this.tokenService.signEmailVerifyToken({
      userId,
      token_type: TokenType.EmailVerifyToken,
      verify,
    })
    console.log('Resend emailVerifyToken: ', emailVerifyToken)
    return this.prismaService.user.update({
      where: { id: userId },
      data: {
        emailVerifyToken,
      },
    })
  }

  async forgotPassword({ userId, verify }: { userId: number; verify: UserVerifyStatusType }) {
    const forgotPasswordToken = this.tokenService.signForgotPasswordToken({
      userId,
      token_type: TokenType.ForgotPasswordToken,
      verify,
    })
    console.log('forgotPasswordToken: ', forgotPasswordToken)
    return this.prismaService.user.update({
      where: { id: userId },
      data: {
        forgotPasswordToken,
      },
    })
  }

  async resetPassword({ data, userId }: { data: ResetPasswordBodyType; userId: number }) {
    const hashedPassword = await this.hashingService.hash(data.password)
    return this.prismaService.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        forgotPasswordToken: '',
      },
    })
  }

  async updateMeProfile({ userId, data }: { userId: number; data: UpdateMeProfileBodyType }) {
    return this.prismaService.user.update({
      where: { id: userId },
      data,
    })
  }

  async changePassword({ userId, data }: { userId: number; data: ChangePasswordBodyType }) {
    const { newPassword } = data
    const hashedPassword = await this.hashingService.hash(newPassword)
    return this.prismaService.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    })
  }

  async tweetCircle({ userId, data }: { userId: number; data: CreateTweetCircleBodyType }) {
    const tweetCircle = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        tweet_circle: true,
      },
    })
    const { ids } = data
    const tweetCircleIds = tweetCircle?.tweet_circle.map((item) => item.id) || []
    const newTweetCircleIds = ids.filter((id) => !tweetCircleIds.includes(id) && id !== userId)
    const deletedTweetCircleIds = tweetCircleIds.filter((id) => !ids.includes(id))
    return this.prismaService.user.update({
      where: { id: userId },
      data: {
        tweet_circle: {
          connect: newTweetCircleIds.map((id) => ({ id })),
          disconnect: deletedTweetCircleIds.map((id) => ({ id })),
        },
      },
    })
  }
}
