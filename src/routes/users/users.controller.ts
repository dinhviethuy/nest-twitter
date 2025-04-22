import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { UsersService } from './users.service'
import { ZodSerializerDto } from 'nestjs-zod'
import { UserResponseDTO, RegisterBodyDTO, LoginBodyDTO, RefreshTokenBodyDTO, EmailVerifyTokenDTO } from './users.dto'
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
}
