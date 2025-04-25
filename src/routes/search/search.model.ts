import { z } from 'zod'

export const SearchQuerySchema = z
  .object({
    content: z.string().trim().min(1, 'Search content is required'),
    media_type: z
      .enum(['IMAGE', 'VIDEO', 'image', 'video'])
      .optional()
      .transform((val: string | undefined): 'IMAGE' | 'VIDEO' | undefined => {
        if (typeof val === 'string') {
          return val.toUpperCase() as any
        }
        return val
      }),
    people_follow: z
      .custom<boolean>((val) => {
        if (typeof val === 'string' && val.toLowerCase() === 'true') return true
        return false
      })
      .optional(),
    limit: z.number().default(10),
    page: z.number().default(1),
  })
  .strict()

export type SearchQueryType = z.infer<typeof SearchQuerySchema>
