import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../shared/services/prisma.service'
import { CreateTweetBodyType } from './tweets.model'
import { AccessTokenPayload } from '@/shared/types/jwt.types'
import { TweetType } from '@/shared/constants/tweet.constants'

@Injectable()
export class TweetsRepo {
  constructor(private readonly prismaService: PrismaService) {}

  createTweet(data: CreateTweetBodyType, userId: number) {
    return this.prismaService.tweet.create({
      data: {
        content: data.content,
        audience: data.audience,
        type: data.type,
        parentId: data.parentId,
        userId,
        hashtags: {
          connectOrCreate: data.hashtags.map((hashtag) => ({
            where: { name: hashtag },
            create: { name: hashtag },
          })),
        },
        mentions: {
          connect: data.mentions.map((mention) => ({
            id: mention,
          })),
        },
        medias: {
          create: data.medias.map((media) => ({
            type: media.type,
            url: media.url,
          })),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        hashtags: {
          select: {
            id: true,
            name: true,
          },
        },
        mentions: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
        medias: {
          select: {
            id: true,
            type: true,
            url: true,
          },
        },
      },
    })
  }

  async getTweetById(tweet_id: number, user: AccessTokenPayload | undefined) {
    const tweet = await this.prismaService.tweet.findFirst({
      where: {
        id: tweet_id,
        ...(user
          ? {
              OR: [
                { audience: 'EVERYONE' },
                {
                  audience: 'TWITTER_CIRCLE',
                  user: {
                    tweet_circle: {
                      some: {
                        id: user.userId,
                      },
                    },
                  },
                },
                {
                  userId: user.userId,
                },
              ],
            }
          : {
              audience: 'EVERYONE',
            }),
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        hashtags: {
          select: {
            id: true,
            name: true,
          },
        },
        mentions: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
        medias: {
          select: {
            id: true,
            type: true,
            url: true,
          },
        },
      },
    })
    if (!tweet) return null
    const [comments, quote_tweets, retweets, bookmarks, likes] = await Promise.all([
      this.prismaService.tweet.count({
        where: {
          parentId: tweet.id,
          type: TweetType.COMMENT,
        },
      }),
      this.prismaService.tweet.count({
        where: {
          parentId: tweet.id,
          type: TweetType.QUOTE_TWEET,
        },
      }),
      this.prismaService.tweet.count({
        where: {
          parentId: tweet.id,
          type: TweetType.RETWEET,
        },
      }),
      this.prismaService.bookMark.count({
        where: {
          tweetId: tweet.id,
        },
      }),
      this.prismaService.like.count({
        where: {
          tweetId: tweet.id,
        },
      }),
    ])
    return {
      ...tweet,
      comments,
      views: tweet.guest_view + tweet.user_view,
      quote_tweets,
      retweets,
      bookmarks,
      likes,
    }
  }
}
