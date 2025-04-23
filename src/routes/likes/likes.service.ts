import { SharedUserRepo } from '@/shared/repositories/shared-user.repo'
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { UserVerifyStatusType } from '@/shared/constants/users.contants'
import {
  isForeignKeyConstraintPrismaError,
  isNotFoundPrismaError,
  isUniqueConstraintPrismaError,
} from '@/shared/utils/utils'
import { LikeRepo } from './likes.repo'
import { CreateLikeBodyType, DeleteLikeParamsType } from './likes.model'

@Injectable()
export class LikesService {
  constructor(
    private readonly sharedUserRepo: SharedUserRepo,
    private readonly likeRepo: LikeRepo,
  ) {}

  async like({ data, userId, verify }: { data: CreateLikeBodyType; userId: number; verify: UserVerifyStatusType }) {
    this.sharedUserRepo.checkUserVerify(verify)
    try {
      await this.likeRepo.like(data, userId)
      return true
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw new ConflictException('Tweet đã được like trước đó')
      }
      if (isNotFoundPrismaError(error)) {
        throw new NotFoundException('Tweet không tồn tại, đã bị xóa hoặc không công khai')
      }

      if (isForeignKeyConstraintPrismaError(error)) {
        throw new NotFoundException('Tweet không tồn tại')
      }
      throw error
    }
  }

  async dislike({
    data,
    userId,
    verify,
  }: {
    data: DeleteLikeParamsType
    userId: number
    verify: UserVerifyStatusType
  }) {
    this.sharedUserRepo.checkUserVerify(verify)
    try {
      await this.likeRepo.dislike(data.tweetId, userId)
      return true
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw new NotFoundException('Like không tồn tại')
      }
      throw error
    }
  }
}
