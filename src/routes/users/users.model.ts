import { UserSchema } from '@/shared/models/shared-users.model'
import { z } from 'zod'
export const RegisterBodySchema = UserSchema.pick({
  name: true,
  email: true,
  password: true,
  dateOfBirth: true,
})
  .extend({
    confirmPassword: z.string().min(6),
  })
  .strict()
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Passwords do not match',
        path: ['confirmPassword'],
      })
    }
  })

export const LoginBodySchema = UserSchema.pick({
  email: true,
  password: true,
}).strict()

export const UserResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
})

export const RefreshTokenBodySchema = z
  .object({
    refreshToken: z.string(),
  })
  .strict()

export const EmailVerifyTokenSchema = z
  .object({
    emailVerifyToken: z.string(),
  })
  .strict()

export const GetUserResponseSchema = UserSchema.omit({
  emailVerifyToken: true,
  password: true,
  forgotPasswordToken: true,
}).extend({
  dateOfBirth: z.date().transform((value: Date) => value.toISOString()),
})

export type UserResponseType = z.infer<typeof UserResponseSchema>
export type RegisterBodyType = z.infer<typeof RegisterBodySchema>
export type LoginBodyType = z.infer<typeof LoginBodySchema>
export type RefreshTokenBodyType = z.infer<typeof RefreshTokenBodySchema>
export type EmailVerifyTokenType = z.infer<typeof EmailVerifyTokenSchema>
export type GetUserResponseType = z.infer<typeof GetUserResponseSchema>
