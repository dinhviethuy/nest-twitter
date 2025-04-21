import { createZodDto } from 'nestjs-zod'
import { RegisterBodySchema, UserResponseSchema } from './users.model'

export class RegisterBodyDTO extends createZodDto(RegisterBodySchema) {}
export class UserResponseDTO extends createZodDto(UserResponseSchema) {}
