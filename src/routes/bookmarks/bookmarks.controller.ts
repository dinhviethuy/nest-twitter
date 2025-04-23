import { Body, Controller, Delete, Param, Post } from '@nestjs/common'
import { BookmarksService } from './bookmarks.service'
import { ActiveUser } from '@/shared/decorators/active-user.decorator'
import { CreateBookmarkBodyDTO, DeleteBookmarkParamsDTO } from './bookmarks.dto'
import { AccessTokenPayload } from '@/shared/types/jwt.types'
import { MessageResponse } from '@/shared/decorators/message.decorator'

@Controller('bookmarks')
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Post()
  @MessageResponse('Tạo bookmark thành công')
  async createBookmark(@Body() body: CreateBookmarkBodyDTO, @ActiveUser() user: AccessTokenPayload) {
    return this.bookmarksService.createBookmark({
      data: body,
      userId: user.userId,
      verify: user.verify,
    })
  }

  @Delete('tweets/:tweetId')
  @MessageResponse('Xóa bookmark thành công')
  async deleteBookmark(@Param() param: DeleteBookmarkParamsDTO, @ActiveUser() user: AccessTokenPayload) {
    return this.bookmarksService.deleteBookmark({
      data: param,
      userId: user.userId,
      verify: user.verify,
    })
  }
}
