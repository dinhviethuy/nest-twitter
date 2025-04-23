import { Module } from '@nestjs/common'
import { LikesService } from './likes.service'
import { LikesController } from './likes.controller'
import { LikeRepo } from './likes.repo'

@Module({
  controllers: [LikesController],
  providers: [LikesService, LikeRepo],
})
export class LikesModule {}
