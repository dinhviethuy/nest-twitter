import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common'
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
} from './users.dto'
import { MessageResponse } from '@/shared/decorators/message.decorator'
import { IsPublic } from '@/shared/decorators/auth.decorator'
import { ActiveUser } from '@/shared/decorators/active-user.decorator'
import { EmptyBodyDTO } from '@/shared/dtos/request.dto'
import { UserVerifyStatus } from '@prisma/client'

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
}
