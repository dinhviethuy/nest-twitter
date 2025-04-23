import { z } from 'zod'

export const BookmarkSchema = z.object({
  id: z.number(),
  userId: z.number(),
  tweetId: z.number(),
  createdAt: z.date(),
})

export const CreateBookmarkBodySchema = z
  .object({
    tweetId: z.number(),
  })
  .strict()

export type CreateBookmarkBodyType = z.infer<typeof CreateBookmarkBodySchema>
