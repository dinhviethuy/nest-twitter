import { z } from 'zod'
import { isISOString } from '../utils/utils'
import { UserVerifyStatus } from '../constants/users.contants'

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

export type UserType = z.infer<typeof UserSchema>
