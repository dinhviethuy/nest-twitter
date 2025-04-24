import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { TweetsService } from './tweets.service'
import { CreateTweetBodyDTO, GetTweetChildrenQueryDTO, GetTweetParamsDTO, PaginationQueryDTO } from './tweets.dto'
import { ActiveUser } from '@/shared/decorators/active-user.decorator'
import { AccessTokenPayload } from '@/shared/types/jwt.types'
import { SkipAuth } from '@/shared/decorators/auth.decorator'
import { MessageResponse } from '@/shared/decorators/message.decorator'

@Controller('tweets')
export class TweetsController {
  constructor(private readonly tweetsService: TweetsService) {}

  @Post()
  @MessageResponse('Tạo tweet thành công')
  createTweet(@Body() body: CreateTweetBodyDTO, @ActiveUser() user: AccessTokenPayload) {
    return this.tweetsService.createTweet(body, user.userId, user.verify)
  }

  @Get('new-feeds')
  @MessageResponse('Lấy danh sách tweet thành công')
  getNewFeed(@ActiveUser('userId') userId: number, @Query() query: PaginationQueryDTO) {
    return this.tweetsService.getNewFeeds({ userId, data: query })
  }

  @Get('/:tweetId')
  @SkipAuth()
  @MessageResponse('Lấy tweet thành công')
  getTweetById(@Param() param: GetTweetParamsDTO, @ActiveUser() user: AccessTokenPayload | undefined) {
    return this.tweetsService.getTweetById(param.tweetId, user)
  }

  @Get('/:tweetId/children')
  @SkipAuth()
  @MessageResponse('Lấy tweet thành công')
  getTweetChildren(
    @Param() param: GetTweetParamsDTO,
    @ActiveUser() user: AccessTokenPayload | undefined,
    @Query() query: GetTweetChildrenQueryDTO,
  ) {
    return this.tweetsService.getTweetChildren({
      tweetId: param.tweetId,
      user,
      data: query,
    })
  }
}
