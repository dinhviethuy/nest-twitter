import { ConflictException, Injectable } from '@nestjs/common'
import { UsersRepo } from './users.repo'
import { RegisterBodyType } from './users.model'
import { isUniqueConstraintPrismaError } from '@/shared/utils/utils'

@Injectable()
export class UsersService {
  constructor(private readonly usersRepo: UsersRepo) {}

  async register(data: RegisterBodyType) {
    try {
      const user = await this.usersRepo.create(data)
      return user
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw new ConflictException('User already exists')
      }
      throw error
    }
  }
}
