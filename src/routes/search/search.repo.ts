import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../shared/services/prisma.service'
import { TweetType } from '@/shared/constants/tweet.constants'
import { SearchQueryType } from './search.model'

@Injectable()
export class SearchRepo {
  constructor(private readonly prismaService: PrismaService) {}

  async searchContent({ search, userId }: { search: SearchQueryType; userId: number | undefined }) {
    const [tweets, totals] = await Promise.all([
      this.prismaService.tweet.findMany({
        where: {
          content: {
            contains: search.content,
            mode: 'insensitive',
          },
          medias: {
            some: {
              type: search.media_type,
            },
          },
          ...(search.people_follow &&
            userId && {
              user: {
                followers: {
                  some: {
                    userId,
                  },
                },
              },
            }),
          OR: [
            {
              audience: 'EVERYONE',
            },
            {
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
        take: search.limit,
        skip: (search.page - 1) * search.limit,
      }),
      this.prismaService.tweet.count({
        where: {
          content: {
            contains: search.content,
            mode: 'insensitive',
          },
          medias: {
            some: {
              type: search.media_type,
            },
          },
          ...(search.people_follow &&
            userId && {
              user: {
                followers: {
                  some: {
                    userId,
                  },
                },
              },
            }),
          OR: [
            {
              audience: 'EVERYONE',
            },
            {
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
      }),
    ])
    const res = await Promise.all([
      ...tweets.map(async (tweet) => {
        const [tweetUpdate, comments, quote_tweets, retweets, bookmarks, likes] = await Promise.all([
          this.prismaService.tweet.update({
            where: {
              id: tweet.id,
            },
            data: {
              ...(userId
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
    return {
      result: res,
      total: totals,
      page: search.page,
      limit: search.limit,
      total_page: Math.ceil(totals / search.limit),
    }
  }
}
