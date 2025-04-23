import { SharedUserRepo } from '@/shared/repositories/shared-user.repo'
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { UserVerifyStatusType } from '@/shared/constants/users.contants'
import { CreateBookmarkBodyType } from './bookmarks.model'
import { BookmarkRepo } from './bookmarks.repo'
import { isForeignKeyConstraintPrismaError, isUniqueConstraintPrismaError } from '@/shared/utils/utils'

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
}
