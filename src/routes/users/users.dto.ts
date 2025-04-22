import { createZodDto } from 'nestjs-zod'
import {
  RegisterBodySchema,
  UserResponseSchema,
  LoginBodySchema,
  RefreshTokenBodySchema,
  EmailVerifyTokenSchema,
  GetUserResponseSchema,
  ForgotPasswordBodySchema,
  VerifyForgotPasswordTokenBodySchema,
  ResetPasswordBodySchema,
  UpdateMeProfileBodySchema,
  GetUserParamsSchema,
  GetUserParamResponseSchema,
  UserFollwerBodySchema,
  UserUnfollowParamsSchema,
  ChangePasswordBodySchema,
} from './users.model'

export class RegisterBodyDTO extends createZodDto(RegisterBodySchema) {}
export class UserResponseDTO extends createZodDto(UserResponseSchema) {}
export class LoginBodyDTO extends createZodDto(LoginBodySchema) {}
export class RefreshTokenBodyDTO extends createZodDto(RefreshTokenBodySchema) {}
export class EmailVerifyTokenDTO extends createZodDto(EmailVerifyTokenSchema) {}
export class GetUserResponseDTO extends createZodDto(GetUserResponseSchema) {}
export class ForgotPasswordBodyDTO extends createZodDto(ForgotPasswordBodySchema) {}
export class VerifyForgotPasswordTokenBodyDTO extends createZodDto(VerifyForgotPasswordTokenBodySchema) {}
export class ResetPasswordBodyDTO extends createZodDto(ResetPasswordBodySchema) {}
export class UpdateMeProfileBodyDTO extends createZodDto(UpdateMeProfileBodySchema) {}
export class GetUserParamsDTO extends createZodDto(GetUserParamsSchema) {}
export class GetUserParamResponseDTO extends createZodDto(GetUserParamResponseSchema) {}
export class UserFollwerBodyDTO extends createZodDto(UserFollwerBodySchema) {}
export class UserUnfollowParamsDTO extends createZodDto(UserUnfollowParamsSchema) {}
export class ChangePasswordBodyDTO extends createZodDto(ChangePasswordBodySchema) {}
