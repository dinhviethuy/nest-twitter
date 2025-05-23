import {
  ConflictException,
  HttpException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common'
import { UsersRepo } from './users.repo'
import {
  ChangePasswordBodyType,
  CreateTweetCircleBodyType,
  GetUserParamsType,
  LoginBodyType,
  RefreshTokenBodyType,
  RegisterBodyType,
  ResetPasswordBodyType,
  UpdateMeProfileBodyType,
  UserFollwerBodyType,
  VerifyForgotPasswordTokenBodyType,
} from './users.model'
import {
  isForeignKeyConstraintPrismaError,
  isNotFoundPrismaError,
  isUniqueConstraintPrismaError,
} from '@/shared/utils/utils'
import { SharedUserRepo } from '../../shared/repositories/shared-user.repo'
import { HashingService } from '../../shared/services/hashing.service'
import { TokenService } from '@/shared/services/token.service'
import { TokenType } from '@/shared/constants/token.constants'
import { UserVerifyStatus, UserVerifyStatusType } from '@/shared/constants/users.contants'
import { SharedFollwerRepo } from '@/shared/repositories/shared-follwer.repo'

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepo: UsersRepo,
    private readonly sharedUserRepo: SharedUserRepo,
    private readonly sharedFollwerRepo: SharedFollwerRepo,
    private readonly hashingService: HashingService,
    private readonly tokenService: TokenService,
  ) {}

  async getMe(userId: number) {
    const user = await this.sharedUserRepo.findUnique({ id: userId })
    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại')
    }
    return user
  }

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
    return this.usersRepo.login(user.id, user.verify)
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

  async generateTokens(userId: number, verify: UserVerifyStatusType) {
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.signAccessToken({
        userId,
        token_type: TokenType.AccessToken,
        verify,
      }),
      this.tokenService.signRefreshToken({
        userId,
        token_type: TokenType.RefreshToken,
        verify,
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

  async refreshToken({ data, userIdRequest }: { data: RefreshTokenBodyType; userIdRequest: number }) {
    try {
      const { token_type, userId, verify } = await this.tokenService.verifyRefreshToken(data.refreshToken)
      if (userId !== userIdRequest) {
        throw new UnauthorizedException('Refresh token không hợp lệ')
      }
      if (token_type !== TokenType.RefreshToken) {
        throw new UnauthorizedException('Refresh token không hợp lệ')
      }
      const refreshTokenInDb = await this.usersRepo.findUniqueRefreshToken({ token: data.refreshToken })
      if (!refreshTokenInDb) {
        throw new UnauthorizedException('Refresh token không tồn tại')
      }

      const $createRefreshToken = this.generateTokens(userId, verify)
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

  async logout({ data, userIdRequest }: { data: RefreshTokenBodyType; userIdRequest: number }) {
    try {
      const { token_type, userId } = await this.tokenService.verifyRefreshToken(data.refreshToken)
      if (userId !== userIdRequest) {
        throw new UnauthorizedException('Refresh token không hợp lệ')
      }
      if (token_type !== TokenType.RefreshToken) {
        throw new UnauthorizedException('Refresh token không hợp lệ')
      }
      const refreshTokenInDb = await this.usersRepo.findUniqueRefreshToken({ token: data.refreshToken })
      if (!refreshTokenInDb) {
        throw new UnauthorizedException('Refresh token không tồn tại')
      }

      const $deleteRefreshToken = this.usersRepo.deleteRefreshToken(data.refreshToken)

      await Promise.all([$deleteRefreshToken])
      return true
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new UnauthorizedException('Refresh token không hợp lệ')
    }
  }

  async verifyEmail(emailVerifyToken: string) {
    try {
      const { token_type, userId } = await this.tokenService.verifyEmailVerifyToken(emailVerifyToken)
      if (token_type !== TokenType.EmailVerifyToken) {
        throw new UnauthorizedException('Xác thực email không hợp lệ')
      }
      const user = await this.sharedUserRepo.findUnique({ id: userId })
      if (!user) {
        throw new NotFoundException('Người dùng không tồn tại')
      } else if (user.emailVerifyToken === '') {
        return UserVerifyStatus.Verified
      } else if (user.id !== userId || user.emailVerifyToken !== emailVerifyToken) {
        throw new UnauthorizedException('Xác thực email không hợp lệ')
      }
      const result = await this.usersRepo.verifyEmail(userId)
      return result
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new UnauthorizedException('Xác thực email không hợp lệ')
    }
  }

  async resendVerifyEmail(userId: number) {
    const user = await this.sharedUserRepo.findUnique({ id: userId })
    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại')
    } else if (user.emailVerifyToken === '') {
      return UserVerifyStatus.Verified
    }
    await this.usersRepo.resendVerifyEmail({
      userId,
      verify: user.verify,
    })
    return true
  }

  async forgotPassword(email: string) {
    const user = await this.sharedUserRepo.findUnique({ email })
    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại')
    }
    await this.usersRepo.forgotPassword({
      userId: user.id,
      verify: user.verify,
    })
    return true
  }

  async verifyForgotPassword(data: VerifyForgotPasswordTokenBodyType) {
    try {
      const { token_type, userId } = await this.tokenService.verifyForgotPasswordToken(data.forgotPasswordToken)
      if (token_type !== TokenType.ForgotPasswordToken) {
        throw new UnauthorizedException('Xác thực email không hợp lệ')
      }
      const user = await this.sharedUserRepo.findUnique({ id: userId })
      if (!user) {
        throw new NotFoundException('Người dùng không tồn tại')
      } else if (user.id !== userId || user.forgotPasswordToken !== data.forgotPasswordToken) {
        throw new UnauthorizedException('Xác thực email không hợp lệ')
      }
      return true
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new UnauthorizedException('Xác thực email không hợp lệ')
    }
  }

  async resetPassword(data: ResetPasswordBodyType) {
    try {
      const { token_type, userId } = await this.tokenService.verifyForgotPasswordToken(data.forgotPasswordToken)
      if (token_type !== TokenType.ForgotPasswordToken) {
        throw new UnauthorizedException('Xác thực email không hợp lệ')
      }
      const user = await this.sharedUserRepo.findUnique({ id: userId })
      if (!user) {
        throw new NotFoundException('Người dùng không tồn tại')
      } else if (user.id !== userId || user.forgotPasswordToken !== data.forgotPasswordToken) {
        throw new UnauthorizedException('Xác thực email không hợp lệ')
      }
      await this.usersRepo.resetPassword({ data, userId })
      return true
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new UnauthorizedException('Xác thực email không hợp lệ')
    }
  }

  async updateMeProfile({ userId, data }: { userId: number; data: UpdateMeProfileBodyType }) {
    try {
      const user = await this.sharedUserRepo.findUnique({ id: userId })
      if (!user) {
        throw new NotFoundException('Người dùng không tồn tại')
      }
      this.sharedUserRepo.checkUserVerify(user.verify)
      const userUpdate = await this.usersRepo.updateMeProfile({ userId, data })
      return userUpdate
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw new ConflictException('Tên người dùng đã tồn tại')
      }
      if (error instanceof HttpException) {
        throw error
      }
      throw new UnprocessableEntityException('Cập nhật thông tin không thành công')
    }
  }

  async getProfile(data: GetUserParamsType) {
    const user = await this.sharedUserRepo.findUnique({ username: data.username })
    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại')
    }
    return user
  }

  async follow({ userId, data, verify }: { userId: number; data: UserFollwerBodyType; verify: UserVerifyStatusType }) {
    try {
      this.sharedUserRepo.checkUserVerify(verify)
      if (userId === data.followedUserId) {
        throw new UnprocessableEntityException('Không thể theo dõi chính mình')
      }
      const result = await this.sharedFollwerRepo.createFollower({
        userId,
        followedUserId: data.followedUserId,
      })
      return result
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw new ConflictException('Người dùng đã được theo dõi')
      }
      if (isForeignKeyConstraintPrismaError(error)) {
        throw new NotFoundException('Người dùng mà bạn đang theo dõi không tồn tại')
      }
      throw error
    }
  }

  async unfollow({
    userId,
    data,
    verify,
  }: {
    userId: number
    data: UserFollwerBodyType
    verify: UserVerifyStatusType
  }) {
    try {
      this.sharedUserRepo.checkUserVerify(verify)
      if (userId === data.followedUserId) {
        throw new UnprocessableEntityException('Không thể bỏ theo dõi chính mình')
      }
      await this.sharedFollwerRepo.deleteFollower({
        userId,
        followedUserId: data.followedUserId,
      })
      return true
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw new NotFoundException('Người dùng mà bạn đang bỏ theo dõi không tồn tại')
      }
      throw error
    }
  }

  async changePassword({ userId, data }: { userId; data: ChangePasswordBodyType }) {
    const user = await this.sharedUserRepo.findUnique({ id: userId })
    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại')
    }
    this.sharedUserRepo.checkUserVerify(user.verify)
    const isPasswordValid = await this.hashingService.compare(data.oldPassword, user.password)
    if (!isPasswordValid) {
      throw new UnprocessableEntityException('Mật khẩu không chính xác')
    }
    if (data.newPassword === data.oldPassword) {
      throw new UnprocessableEntityException('Mật khẩu mới không được giống mật khẩu cũ')
    }
    await this.usersRepo.changePassword({ userId, data })
    return true
  }

  async tweetCircle({
    data,
    userId,
    verify,
  }: {
    userId: number
    data: CreateTweetCircleBodyType
    verify: UserVerifyStatusType
  }) {
    this.sharedUserRepo.checkUserVerify(verify)
    try {
      const tweetCircle = await this.usersRepo.tweetCircle({ userId, data })
      return tweetCircle
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw new NotFoundException('Người dùng không tồn tại')
      }
      throw error
    }
  }
}
