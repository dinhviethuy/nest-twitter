import { z } from 'zod'

export const LikeSchema = z.object({
  id: z.number(),
  userId: z.number(),
  tweetId: z.number(),
  createdAt: z.date(),
})

export const CreateLikeBodySchema = z
  .object({
    tweetId: z.number(),
  })
  .strict()

export const DeleteLikeParamsSchema = z
  .object({
    tweetId: z.coerce.number(),
  })
  .strict()

export type CreateLikeBodyType = z.infer<typeof CreateLikeBodySchema>
export type DeleteLikeParamsType = z.infer<typeof DeleteLikeParamsSchema>
