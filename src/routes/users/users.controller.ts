import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query, Res } from '@nestjs/common'
import { UsersService } from './users.service'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  UserResponseDTO,
  RegisterBodyDTO,
  LoginBodyDTO,
  RefreshTokenBodyDTO,
  EmailVerifyTokenDTO,
  GetUserResponseDTO,
  ForgotPasswordBodyDTO,
  VerifyForgotPasswordTokenBodyDTO,
  ResetPasswordBodyDTO,
  UpdateMeProfileBodyDTO,
  GetUserParamResponseDTO,
  GetUserParamsDTO,
  UserFollwerBodyDTO,
  UserUnfollowParamsDTO,
  ChangePasswordBodyDTO,
  CreateTweetCircleBodyDTO,
} from './users.dto'
import { MessageResponse } from '@/shared/decorators/message.decorator'
import { IsPublic } from '@/shared/decorators/auth.decorator'
import { ActiveUser } from '@/shared/decorators/active-user.decorator'
import { EmptyBodyDTO } from '@/shared/dtos/request.dto'
import { UserVerifyStatus } from '@prisma/client'
import { AccessTokenPayload } from '@/shared/types/jwt.types'
import { Response } from 'express'
import envConfig from '@/shared/config'
import { GoogleService } from './google.service'

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly googleService: GoogleService,
  ) {}

  @Post('login')
  @IsPublic()
  @ZodSerializerDto(UserResponseDTO)
  @MessageResponse('Đăng nhập thành công')
  login(@Body() body: LoginBodyDTO) {
    return this.usersService.login(body)
  }

  @Post('register')
  @IsPublic()
  @ZodSerializerDto(UserResponseDTO)
  @MessageResponse('Đăng ký thành công')
  register(@Body() body: RegisterBodyDTO) {
    return this.usersService.register(body)
  }

  @Post('refresh-token')
  @ZodSerializerDto(UserResponseDTO)
  @MessageResponse('Làm mới token thành công')
  refreshToken(@Body() body: RefreshTokenBodyDTO, @ActiveUser('userId') userId: number) {
    return this.usersService.refreshToken({
      data: body,
      userIdRequest: userId,
    })
  }

  @Post('logout')
  @MessageResponse('Đăng xuất thành công')
  logout(@Body() body: RefreshTokenBodyDTO, @ActiveUser('userId') userId: number) {
    return this.usersService.logout({
      data: body,
      userIdRequest: userId,
    })
  }

  @Post('verify-email')
  @IsPublic()
  @HttpCode(HttpStatus.OK)
  @MessageResponse('Xác thực email thành công')
  async verifyEmail(@Body() body: EmailVerifyTokenDTO) {
    const result = await this.usersService.verifyEmail(body.emailVerifyToken)
    if (result === UserVerifyStatus.VERIFIED) {
      return {
        __customMessage: 'Email đã được xác thực. Không cần xác thực lại.',
      }
    }
    return result
  }

  @Post('resend-verify-email')
  @HttpCode(HttpStatus.OK)
  @MessageResponse('Gửi lại email xác thực thành công')
  async resendVerifyEmail(@Body() _: EmptyBodyDTO, @ActiveUser('userId') userId: number) {
    const result = await this.usersService.resendVerifyEmail(userId)
    if (result === UserVerifyStatus.VERIFIED) {
      return {
        __customMessage: 'Email đã được xác thực. Không cần gửi lại.',
      }
    }
    return result
  }

  @Get('me')
  @ZodSerializerDto(GetUserResponseDTO)
  @MessageResponse('Lấy thông tin người dùng thành công')
  getMe(@ActiveUser('userId') userId: number) {
    return this.usersService.getMe(userId)
  }

  @Post('forgot-password')
  @IsPublic()
  @HttpCode(HttpStatus.OK)
  @MessageResponse('Gửi email khôi phục mật khẩu thành công')
  forgotPassword(@Body() body: ForgotPasswordBodyDTO) {
    return this.usersService.forgotPassword(body.email)
  }

  @Post('verify-forgot-password')
  @IsPublic()
  @HttpCode(HttpStatus.OK)
  @MessageResponse('Xác thực khôi phục mật khẩu thành công')
  verifyForgotPassword(@Body() body: VerifyForgotPasswordTokenBodyDTO) {
    return this.usersService.verifyForgotPassword(body)
  }

  @Post('reset-password')
  @IsPublic()
  @HttpCode(HttpStatus.OK)
  @MessageResponse('Đặt lại mật khẩu thành công')
  resetPassword(@Body() body: ResetPasswordBodyDTO) {
    return this.usersService.resetPassword(body)
  }

  @Post('me')
  @ZodSerializerDto(GetUserResponseDTO)
  @MessageResponse('Cập nhật thông tin người dùng thành công')
  async updateMeProfile(@Body() body: UpdateMeProfileBodyDTO, @ActiveUser('userId') userId: number) {
    return this.usersService.updateMeProfile({
      data: body,
      userId,
    })
  }

  @Get(':username')
  @IsPublic()
  @ZodSerializerDto(GetUserParamResponseDTO)
  @MessageResponse('Lấy thông tin người dùng thành công')
  getProfile(@Param() param: GetUserParamsDTO) {
    return this.usersService.getProfile(param)
  }

  @Post('follow')
  @MessageResponse('Theo dõi người dùng thành công')
  followUser(@Body() body: UserFollwerBodyDTO, @ActiveUser() user: AccessTokenPayload) {
    return this.usersService.follow({
      data: body,
      userId: user.userId,
      verify: user.verify,
    })
  }

  @Delete('follow/:followedUserId')
  @MessageResponse('Bỏ theo dõi người dùng thành công')
  unfollowUser(@Param() param: UserUnfollowParamsDTO, @ActiveUser() user: AccessTokenPayload) {
    return this.usersService.unfollow({
      data: param,
      userId: user.userId,
      verify: user.verify,
    })
  }

  @Put('change-password')
  @MessageResponse('Đổi mật khẩu thành công')
  async changePassword(@Body() body: ChangePasswordBodyDTO, @ActiveUser('userId') userId: number) {
    return this.usersService.changePassword({
      data: body,
      userId,
    })
  }

  @Get('oauth/google')
  @IsPublic()
  @MessageResponse('Đăng nhập bằng Google thành công')
  async googleLogin(@Query('code') code: string, @Res() res: Response) {
    try {
      const data = await this.googleService.googleCallback(code)
      return res.redirect(
        `${envConfig.CLIENT_REDIRECT_URI}?accessToken=${data.accessToken}&refreshToken=${data.refreshToken}&new_user=${data.new_user}`,
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định'
      return res.redirect(`${envConfig.CLIENT_REDIRECT_URI}?errorMessage=${message}`)
    }
  }

  @Post('tweet-circle')
  @ZodSerializerDto(GetUserResponseDTO)
  @MessageResponse('Thay đổi cài đặt Tweet Circle thành công')
  tweetCircle(@Body() body: CreateTweetCircleBodyDTO, @ActiveUser() user: AccessTokenPayload) {
    return this.usersService.tweetCircle({
      data: body,
      userId: user.userId,
      verify: user.verify,
    })
  }
}
