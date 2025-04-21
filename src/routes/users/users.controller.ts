import { Body, Controller, Post } from '@nestjs/common'
import { UsersService } from './users.service'
import { ZodSerializerDto } from 'nestjs-zod'
import { UserResponseDTO, RegisterBodyDTO, LoginBodyDTO, RefreshTokenBodyDTO } from './users.dto'
import { MessageResponse } from '@/shared/decorators/message.decorator'
import { IsPublic } from '@/shared/decorators/auth.decorator'

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
  refreshToken(@Body() body: RefreshTokenBodyDTO) {
    return this.usersService.refreshToken(body)
  }
}
