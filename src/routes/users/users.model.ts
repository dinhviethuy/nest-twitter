import { UserVerifyStatus } from '@/shared/constants/users.contants'
import { isISOString } from '@/shared/utils/utils'
import { z } from 'zod'

export const UserSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(255),
  email: z.string().email(),
  password: z.string().min(6),
  dateOfBirth: z
    .custom<string>((value: string) => {
      if (typeof value !== 'string') return false
      return isISOString(value)
    })
    .transform((value: string) => new Date(value)),
  createdAt: z.date(),
  updatedAt: z.date(),
  verify: z
    .enum([UserVerifyStatus.Unverified, UserVerifyStatus.Verified, UserVerifyStatus.Banned])
    .default(UserVerifyStatus.Unverified),
  emailVerifyToken: z.string().default(''),
  forgotPasswordToken: z.string().default(''),
  bio: z.string().default(''),
  location: z.string().default(''),
  website: z.string().default(''),
  username: z.string(),
  avatar: z.string().default(''),
  coverPhoto: z.string().default(''),
})

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

export const UserResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
})

export type UserType = z.infer<typeof UserSchema>
export type UserResponseType = z.infer<typeof UserResponseSchema>
export type RegisterBodyType = z.infer<typeof RegisterBodySchema>
