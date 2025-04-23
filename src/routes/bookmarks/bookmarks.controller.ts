import { Body, Controller, Post } from '@nestjs/common'
import { BookmarksService } from './bookmarks.service'
import { ActiveUser } from '@/shared/decorators/active-user.decorator'
import { CreateBookmarkBodyDTO } from './bookmarks.dto'
import { AccessTokenPayload } from '@/shared/types/jwt.types'

@Controller('bookmarks')
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Post()
  async createBookmark(@Body() body: CreateBookmarkBodyDTO, @ActiveUser() user: AccessTokenPayload) {
    return this.bookmarksService.createBookmark({
      data: body,
      userId: user.userId,
      verify: user.verify,
    })
  }
}
