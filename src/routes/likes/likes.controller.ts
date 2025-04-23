import { Body, Controller, Delete, Param, Post } from '@nestjs/common'
import { ActiveUser } from '@/shared/decorators/active-user.decorator'
import { AccessTokenPayload } from '@/shared/types/jwt.types'
import { MessageResponse } from '@/shared/decorators/message.decorator'
import { LikesService } from './likes.service'
import { CreateLikeBodyDTO, DeleteLikeParamsDTO } from './likes.dto'

@Controller('likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post()
  @MessageResponse('Like thành công')
  like(@Body() body: CreateLikeBodyDTO, @ActiveUser() user: AccessTokenPayload) {
    return this.likesService.like({
      data: body,
      userId: user.userId,
      verify: user.verify,
    })
  }

  @Delete('tweets/:tweetId')
  @MessageResponse('Bỏ like thành công')
  dislike(@Param() param: DeleteLikeParamsDTO, @ActiveUser() user: AccessTokenPayload) {
    return this.likesService.dislike({
      data: param,
      userId: user.userId,
      verify: user.verify,
    })
  }
}
