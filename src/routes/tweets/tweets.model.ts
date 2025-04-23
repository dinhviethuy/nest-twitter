import { TweetAudience, TweetType } from '@/shared/constants/tweet.constants'
import { z } from 'zod'

export const TweetShema = z.object({
  id: z.number(),
  userId: z.number(),
  parentId: z.number().nullable(),
  audience: z.enum([TweetAudience.EVERYONE, TweetAudience.TWITTER_CIRCLE]).default(TweetAudience.EVERYONE),
  type: z.enum([TweetType.TWEET, TweetType.RETWEET, TweetType.COMMENT, TweetType.QUOTE_TWEET]).default(TweetType.TWEET),
  guest_view: z.number().default(0),
  user_view: z.number().default(0),
  content: z.string().max(255),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const CreateTweetBodySchema = TweetShema.pick({
  audience: true,
  content: true,
  parentId: true,
  type: true,
})
  .extend({
    hashtags: z.array(z.string()).default([]),
    mentions: z.array(z.number()).default([]),
    media: z.array(z.string()).default([]),
    medias: z
      .array(
        z.object({
          url: z.string().url(),
          type: z.enum(['IMAGE', 'VIDEO']),
        }),
      )
      .default([]),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (!data.parentId && data.type !== TweetType.TWEET) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'parentId is required when type is not TWEET',
        path: ['parentId', 'tweetType'],
      })
    } else if (data.parentId && data.type === TweetType.TWEET) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'parentId is not allowed when type is TWEET',
        path: ['parentId', 'tweetType'],
      })
    }

    if (data.type === TweetType.RETWEET && data.content !== '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'content is not allowed when type is RETWEET',
        path: ['content', 'tweetType'],
      })
    } else if (
      data.type != TweetType.RETWEET &&
      data.hashtags.length === 0 &&
      data.mentions.length === 0 &&
      data.content === ''
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'content is required when type is not RETWEET',
        path: ['content', 'tweetType'],
      })
    }
  })

export const GetTweetParamsSchema = z
  .object({
    tweetId: z.coerce.number().int().positive(),
  })
  .strict()

export type CreateTweetBodyType = z.infer<typeof CreateTweetBodySchema>
export type GetTweetParamsType = z.infer<typeof GetTweetParamsSchema>
