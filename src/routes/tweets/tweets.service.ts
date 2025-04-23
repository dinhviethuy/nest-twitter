import { Injectable } from '@nestjs/common'
import { TweetsRepo } from './tweets.repo'
import { CreateTweetBodyType } from './tweets.model'

@Injectable()
export class TweetsService {
  constructor(private readonly tweetsRepo: TweetsRepo) {}

  async createTweet(data: CreateTweetBodyType, userId: number) {
    const tweet = await this.tweetsRepo.createTweet(data, userId)
    return tweet
  }
}
