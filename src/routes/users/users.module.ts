import { Module } from '@nestjs/common'
import { UsersService } from './users.service'
import { UsersController } from './users.controller'
import { UsersRepo } from './users.repo'
import { GoogleService } from './google.service'

@Module({
  controllers: [UsersController],
  providers: [UsersService, UsersRepo, GoogleService],
})
export class UsersModule {}
