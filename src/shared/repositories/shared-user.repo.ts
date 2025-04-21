import { Injectable } from '@nestjs/common'
import { PrismaService } from '../services/prisma.service'
import { UserType } from '../models/shared-users.model'

@Injectable()
export class SharedUserRepo {
  constructor(private readonly prismaService: PrismaService) {}

  findUnique(where: { id: number } | { email: string } | { username: string }): Promise<UserType | null> {
    return this.prismaService.user.findUnique({
      where,
    })
  }
}
