import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PrismaService } from '../services/prisma.service'
import { UserType } from '../models/shared-users.model'
import { UserVerifyStatus, UserVerifyStatusType } from '../constants/users.contants'

@Injectable()
export class SharedUserRepo {
  constructor(private readonly prismaService: PrismaService) {}

  checkUserVerify(verify: UserVerifyStatusType) {
    if (verify === UserVerifyStatus.Unverified) {
      throw new UnauthorizedException('Email chưa được xác thực')
    }
    return true
  }

  findUnique(where: { id: number } | { email: string } | { username: string }): Promise<UserType | null> {
    return this.prismaService.user.findUnique({
      where,
    })
  }
}
