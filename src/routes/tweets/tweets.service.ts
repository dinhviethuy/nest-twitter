import { Injectable } from '@nestjs/common'
import { TweetsRepo } from './tweets.repo'
import { CreateTweetBodyType } from './tweets.model'
import { UserVerifyStatusType } from '@/shared/constants/users.contants'
import { SharedUserRepo } from '@/shared/repositories/shared-user.repo'

@Injectable()
export class TweetsService {
  constructor(
    private readonly tweetsRepo: TweetsRepo,
    private readonly sharedUserRepo: SharedUserRepo,
  ) {}

  async createTweet(data: CreateTweetBodyType, userId: number, verify: UserVerifyStatusType) {
    this.sharedUserRepo.checkUserVerify(verify)
    const tweet = await this.tweetsRepo.createTweet(data, userId)
    return tweet
  }
}
