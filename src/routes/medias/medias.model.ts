import { z } from 'zod'

export const GetVideoStatusEncodeSchema = z
  .object({
    name: z.string(),
  })
  .strict()
