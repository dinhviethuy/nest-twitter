import { SharedUserRepo } from '@/shared/repositories/shared-user.repo'
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { UserVerifyStatusType } from '@/shared/constants/users.contants'
import { CreateBookmarkBodyType, DeleteBookmarkParamsType } from './bookmarks.model'
import { BookmarkRepo } from './bookmarks.repo'
import {
  isForeignKeyConstraintPrismaError,
  isNotFoundPrismaError,
  isUniqueConstraintPrismaError,
} from '@/shared/utils/utils'

@Injectable()
export class BookmarksService {
  constructor(
    private readonly sharedUserRepo: SharedUserRepo,
    private readonly bookmarkRepo: BookmarkRepo,
  ) {}

  async createBookmark({
    data,
    userId,
    verify,
  }: {
    data: CreateBookmarkBodyType
    userId: number
    verify: UserVerifyStatusType
  }) {
    this.sharedUserRepo.checkUserVerify(verify)
    try {
      const bookmark = await this.bookmarkRepo.createBookmark(data, userId)
      return bookmark
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw new ConflictException('Bookmark đã tồn tại')
      }
      if (isForeignKeyConstraintPrismaError(error)) {
        throw new NotFoundException('Tweet không tồn tại')
      }
      throw error
    }
  }

  async deleteBookmark({
    data,
    userId,
    verify,
  }: {
    data: DeleteBookmarkParamsType
    userId: number
    verify: UserVerifyStatusType
  }) {
    this.sharedUserRepo.checkUserVerify(verify)
    try {
      await this.bookmarkRepo.deleteBookmark(data.tweetId, userId)
      return true
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw new NotFoundException('Bookmark không tồn tại')
      }
      throw error
    }
  }
}
