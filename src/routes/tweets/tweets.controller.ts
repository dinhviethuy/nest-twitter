import { Body, Controller, Get, Post } from '@nestjs/common'
import { TweetsService } from './tweets.service'
import { CreateTweetBodyDTO } from './tweets.dto'
import { ActiveUser } from '@/shared/decorators/active-user.decorator'
import { AccessTokenPayload } from '@/shared/types/jwt.types'
import { SkipAuth } from '@/shared/decorators/auth.decorator'

@Controller('tweets')
export class TweetsController {
  constructor(private readonly tweetsService: TweetsService) {}

  @Post()
  createTweet(@Body() body: CreateTweetBodyDTO, @ActiveUser() user: AccessTokenPayload) {
    return this.tweetsService.createTweet(body, user.userId, user.verify)
  }

  @Get('/:tweetId')
  @SkipAuth()
  getTweetById(@ActiveUser() user: AccessTokenPayload) {
    return 'ok'
  }
}
