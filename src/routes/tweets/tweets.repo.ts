import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../shared/services/prisma.service'
import { CreateTweetBodyType, GetTweetChildrenQueryType, PaginationQueryType } from './tweets.model'
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
    const tweet = await this.prismaService.tweet.update({
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
      data: {
        ...(user
          ? {
              user_view: {
                increment: 1,
              },
            }
          : {
              guest_view: {
                increment: 1,
              },
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

  async getTweetChildren({
    data,
    user,
    tweetId,
  }: {
    data: GetTweetChildrenQueryType
    user: AccessTokenPayload | undefined
    tweetId: number
  }) {
    const skip = (data.page - 1) * data.limit
    const take = data.limit
    const tweet = await this.prismaService.tweet.findMany({
      where: {
        type: data.tweet_type,
        parentId: tweetId,
      },
      skip,
      take,
    })
    const res = await Promise.all([
      ...tweet.map(async (tweet) => {
        const [tweetUpdate, comments, quote_tweets, retweets, bookmarks, likes] = await Promise.all([
          this.prismaService.tweet.update({
            where: {
              id: tweet.id,
            },
            data: {
              ...(user
                ? {
                    user_view: {
                      increment: 1,
                    },
                  }
                : {
                    guest_view: {
                      increment: 1,
                    },
                  }),
            },
          }),
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
          ...tweetUpdate,
          comments,
          views: tweetUpdate.guest_view + tweetUpdate.user_view,
          quote_tweets,
          retweets,
          bookmarks,
          likes,
        }
      }),
    ])
    return res
  }

  async getNewFeeds({ data, userId }: { userId: number; data: PaginationQueryType }) {
    const skip = (data.page - 1) * data.limit
    const take = data.limit
    const tweets = await this.prismaService.tweet.findMany({
      where: {
        OR: [
          {
            // lấy tweet của mình
            userId,
          },
          {
            // lấy tweet của người dùng ở chế độ công khai
            audience: 'EVERYONE',
          },
          {
            // lấy tweet của người mà mình nằm tròn tweet_circle của họ
            audience: 'TWITTER_CIRCLE',
            user: {
              tweet_circle: {
                some: {
                  id: userId,
                },
              },
            },
          },
        ],
      },
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
    })
    console.log('tweets', tweets.length)
    const res = await Promise.all([
      ...tweets.map(async (tweet) => {
        const [tweetUpdate, comments, quote_tweets, retweets, bookmarks, likes] = await Promise.all([
          this.prismaService.tweet.update({
            where: {
              id: tweet.id,
            },
            data: {
              user_view: {
                increment: 1,
              },
            },
            include: {
              user: {
                select: {
                  id: true,
                  avatar: true,
                  username: true,
                  name: true,
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
          }),
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
          ...tweetUpdate,
          comments,
          views: tweetUpdate.guest_view + tweetUpdate.user_view,
          quote_tweets,
          retweets,
          bookmarks,
          likes,
        }
      }),
    ])
    return res
  }
}
