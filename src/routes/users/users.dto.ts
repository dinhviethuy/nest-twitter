import { createZodDto } from 'nestjs-zod'
import { RegisterBodySchema, UserResponseSchema, LoginBodySchema, RefreshTokenBodySchema } from './users.model'

export class RegisterBodyDTO extends createZodDto(RegisterBodySchema) {}
export class UserResponseDTO extends createZodDto(UserResponseSchema) {}
export class LoginBodyDTO extends createZodDto(LoginBodySchema) {}
export class RefreshTokenBodyDTO extends createZodDto(RefreshTokenBodySchema) {}
