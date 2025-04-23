import { PrismaService } from '@/shared/services/prisma.service'
import { Injectable } from '@nestjs/common'
import { CreateLikeBodyType } from './likes.model'

@Injectable()
export class LikeRepo {
  constructor(private readonly prismaService: PrismaService) {}

  async like(data: CreateLikeBodyType, userId: number) {
    return this.prismaService.tweet.update({
      where: {
        id: data.tweetId,
        OR: [
          { audience: 'EVERYONE' },
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
          { userId },
        ],
        type: 'TWEET', // chỉ cho phép like tweet
      },
      data: {
        likes: {
          create: {
            userId,
          },
        },
      },
    })
  }

  async dislike(tweetId: number, userId: number) {
    return this.prismaService.like.delete({
      where: {
        userId_tweetId: {
          tweetId,
          userId,
        },
      },
    })
  }
}
