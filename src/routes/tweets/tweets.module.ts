import { Module } from '@nestjs/common'
import { TweetsService } from './tweets.service'
import { TweetsController } from './tweets.controller'
import { TweetsRepo } from './tweets.repo'

@Module({
  controllers: [TweetsController],
  providers: [TweetsService, TweetsRepo],
})
export class TweetsModule {}
