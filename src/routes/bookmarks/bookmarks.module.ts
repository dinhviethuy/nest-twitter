import { Module } from '@nestjs/common'
import { BookmarksService } from './bookmarks.service'
import { BookmarksController } from './bookmarks.controller'
import { BookmarkRepo } from './bookmarks.repo'

@Module({
  controllers: [BookmarksController],
  providers: [BookmarksService, BookmarkRepo],
})
export class BookmarksModule {}
