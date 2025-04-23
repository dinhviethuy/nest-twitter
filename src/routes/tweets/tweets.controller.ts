import { Body, Controller, Post } from '@nestjs/common'
import { TweetsService } from './tweets.service'
import { CreateTweetBodyDTO } from './tweets.dto'
import { ActiveUser } from '@/shared/decorators/active-user.decorator'

@Controller('tweets')
export class TweetsController {
  constructor(private readonly tweetsService: TweetsService) {}

  @Post()
  createTweet(@Body() body: CreateTweetBodyDTO, @ActiveUser('userId') userId: number) {
    return this.tweetsService.createTweet(body, userId)
  }
}
