import { Injectable } from '@nestjs/common'
import { PrismaService } from '../services/prisma.service'

@Injectable()
export class SharedFollwerRepo {
  constructor(private readonly prismaService: PrismaService) {}

  createFollower({ followedUserId, userId }: { userId: number; followedUserId: number }) {
    return this.prismaService.follower.create({
      data: {
        userId,
        followedUserId,
      },
    })
  }

  deleteFollower({ followedUserId, userId }: { userId: number; followedUserId: number }) {
    return this.prismaService.follower.delete({
      where: {
        userId_followedUserId: {
          userId,
          followedUserId,
        },
      },
    })
  }
}
