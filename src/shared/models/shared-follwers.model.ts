import { z } from 'zod'

export const FollowerSchema = z.object({
  id: z.number().positive(),
  userId: z.number().positive(),
  followedUserId: z.number().positive(),
  createdAt: z.date(),
})

export type FollowerType = z.infer<typeof FollowerSchema>
