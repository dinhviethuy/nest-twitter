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

export const ForgotPasswordBodySchema = UserSchema.pick({
  email: true,
}).strict()

export const VerifyForgotPasswordTokenBodySchema = z
  .object({
    forgotPasswordToken: z.string(),
  })
  .strict()

export const ResetPasswordBodySchema = z
  .object({
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
    forgotPasswordToken: z.string(),
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

export const CreateTweetCircleBodySchema = z
  .object({
    ids: z.array(z.number()),
  })
  .strict()

export const GetAuthorizationUrlResSchema = z.object({
  url: z.string().url(),
})

export const UpdateMeProfileBodySchema = UserSchema.pick({
  avatar: true,
  name: true,
  bio: true,
  dateOfBirth: true,
  coverPhoto: true,
  location: true,
  username: true,
  website: true,
})
  .strict()
  .extend({
    username: z
      .string()
      .regex(
        /(^|[^@\w])@(\w{1,15})\b/g,
        'username bắt đầu bằng @ và không có ký tự đặc biệt, có độ dài từ 1 đến 15 ký tự',
      ),
  })
  .partial()

export const GetUserParamsSchema = z.object({
  username: z.string().min(1),
})

export const GetUserParamResponseSchema = UserSchema.omit({
  email: true,
  password: true,
  emailVerifyToken: true,
  forgotPasswordToken: true,
  verify: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  dateOfBirth: z.date().transform((value: Date) => value.toISOString()),
})

export const UserFollwerBodySchema = z
  .object({
    followedUserId: z.coerce.number().int().positive(),
  })
  .strict()

export const UserUnfollowParamsSchema = UserFollwerBodySchema

export const ChangePasswordBodySchema = z
  .object({
    oldPassword: z.string().min(6),
    newPassword: z.string().min(6),
    confirmNewPassword: z.string().min(6),
  })
  .strict()
  .superRefine(({ newPassword, confirmNewPassword }, ctx) => {
    if (newPassword !== confirmNewPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Passwords do not match',
        path: ['confirmNewPassword'],
      })
    }
  })

export type UserResponseType = z.infer<typeof UserResponseSchema>
export type RegisterBodyType = z.infer<typeof RegisterBodySchema>
export type LoginBodyType = z.infer<typeof LoginBodySchema>
export type RefreshTokenBodyType = z.infer<typeof RefreshTokenBodySchema>
export type EmailVerifyTokenType = z.infer<typeof EmailVerifyTokenSchema>
export type GetUserResponseType = z.infer<typeof GetUserResponseSchema>
export type ForgotPasswordBodyType = z.infer<typeof ForgotPasswordBodySchema>
export type VerifyForgotPasswordTokenBodyType = z.infer<typeof VerifyForgotPasswordTokenBodySchema>
export type ResetPasswordBodyType = z.infer<typeof ResetPasswordBodySchema>
export type UpdateMeProfileBodyType = z.infer<typeof UpdateMeProfileBodySchema>
export type GetUserParamsType = z.infer<typeof GetUserParamsSchema>
export type GetUserParamResponseType = z.infer<typeof GetUserParamResponseSchema>
export type UserFollwerBodyType = z.infer<typeof UserFollwerBodySchema>
export type UserUnfollowParamsType = z.infer<typeof UserUnfollowParamsSchema>
export type ChangePasswordBodyType = z.infer<typeof ChangePasswordBodySchema>
export type CreateTweetCircleBodyType = z.infer<typeof CreateTweetCircleBodySchema>
