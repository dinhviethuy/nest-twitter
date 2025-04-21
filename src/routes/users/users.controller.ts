import { Body, Controller, Post } from '@nestjs/common'
import { UsersService } from './users.service'
import { ZodSerializerDto } from 'nestjs-zod'
import { UserResponseDTO, RegisterBodyDTO } from './users.dto'
import { MessageResponse } from '@/shared/decorators/message.decorator'

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @ZodSerializerDto(UserResponseDTO)
  @MessageResponse('Đăng ký thành công')
  register(@Body() body: RegisterBodyDTO) {
    return this.usersService.register(body)
  }
}
