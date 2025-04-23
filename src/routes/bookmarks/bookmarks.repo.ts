import { PrismaService } from '@/shared/services/prisma.service'
import { Injectable } from '@nestjs/common'
import { CreateBookmarkBodyType } from './bookmarks.model'

@Injectable()
export class BookmarkRepo {
  constructor(private readonly prismaService: PrismaService) {}

  async createBookmark(data: CreateBookmarkBodyType, userId: number) {
    return this.prismaService.bookMark.create({
      data: {
        tweetId: data.tweetId,
        userId,
      },
    })
  }

  async deleteBookmark(tweetId: number, userId: number) {
    return this.prismaService.bookMark.delete({
      where: {
        userId_tweetId: {
          tweetId,
          userId,
        },
      },
    })
  }
}
