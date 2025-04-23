import { Injectable } from '@nestjs/common'
import { TweetsRepo } from './tweets.repo'
import { CreateTweetBodyType } from './tweets.model'
import { UserVerifyStatusType } from '@/shared/constants/users.contants'
import { SharedUserRepo } from '@/shared/repositories/shared-user.repo'
import { isForeignKeyConstraintPrismaError } from '@/shared/utils/utils'

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
}
