import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { TweetsService } from './tweets.service'
import { CreateTweetBodyDTO, GetTweetParamsDTO } from './tweets.dto'
import { ActiveUser } from '@/shared/decorators/active-user.decorator'
import { AccessTokenPayload } from '@/shared/types/jwt.types'
import { SkipAuth } from '@/shared/decorators/auth.decorator'
import { MessageResponse } from '@/shared/decorators/message.decorator'

@Controller('tweets')
export class TweetsController {
  constructor(private readonly tweetsService: TweetsService) {}

  @Post()
  createTweet(@Body() body: CreateTweetBodyDTO, @ActiveUser() user: AccessTokenPayload) {
    return this.tweetsService.createTweet(body, user.userId, user.verify)
  }

  @Get('/:tweetId')
  @SkipAuth()
  @MessageResponse('Lấy tweet thành công')
  getTweetById(@Param() param: GetTweetParamsDTO, @ActiveUser() user: AccessTokenPayload | undefined) {
    return this.tweetsService.getTweetById(param.tweetId, user)
  }
}
