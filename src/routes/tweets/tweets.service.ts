import { Injectable, NotFoundException } from '@nestjs/common'
import { TweetsRepo } from './tweets.repo'
import { CreateTweetBodyType, GetTweetChildrenQueryType } from './tweets.model'
import { UserVerifyStatusType } from '@/shared/constants/users.contants'
import { SharedUserRepo } from '@/shared/repositories/shared-user.repo'
import { isForeignKeyConstraintPrismaError } from '@/shared/utils/utils'
import { AccessTokenPayload } from '@/shared/types/jwt.types'

@Injectable()
export class TweetsService {
  constructor(
    private readonly tweetsRepo: TweetsRepo,
    private readonly sharedUserRepo: SharedUserRepo,
  ) {}

  async createTweet(data: CreateTweetBodyType, userId: number, verify: UserVerifyStatusType) {
    this.sharedUserRepo.checkUserVerify(verify)
    try {
      const tweet = await this.tweetsRepo.createTweet(data, userId)
      return tweet
    } catch (error) {
      if (isForeignKeyConstraintPrismaError(error)) {
        throw new Error('User không tồn tại')
      }
      throw error
    }
  }

  async getTweetById(tweetId: number, user: AccessTokenPayload | undefined) {
    const tweet = await this.tweetsRepo.getTweetById(tweetId, user)
    if (!tweet) {
      throw new NotFoundException('Tweet không tồn tại, đã bị xóa hoặc không công khai')
    }
    return tweet
  }

  async getTweetChildren({
    tweetId,
    user,
    data,
  }: {
    tweetId: number
    user: AccessTokenPayload | undefined
    data: GetTweetChildrenQueryType
  }) {
    const tweet = await this.tweetsRepo.getTweetChildren({
      tweetId,
      user,
      data,
    })
    if (!tweet) {
      throw new NotFoundException('Tweet không tồn tại, đã bị xóa hoặc không công khai')
    }
    return tweet
  }
}
