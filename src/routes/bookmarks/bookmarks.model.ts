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

export const DeleteBookmarkParamsSchema = z
  .object({
    tweetId: z.coerce.number(),
  })
  .strict()

export type CreateBookmarkBodyType = z.infer<typeof CreateBookmarkBodySchema>
export type DeleteBookmarkParamsType = z.infer<typeof DeleteBookmarkParamsSchema>
