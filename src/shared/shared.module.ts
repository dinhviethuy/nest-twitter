import { Global, Module } from '@nestjs/common'
import { PrismaService } from './services/prisma.service'
import { HashingService } from './services/hashing.service'
import { TokenService } from './services/token.service'
import { JwtModule } from '@nestjs/jwt'
import { SharedUserRepo } from './repositories/shared-user.repo'
import { APP_GUARD } from '@nestjs/core'
import { AuthenticationGuard } from './guards/authentication.guard'
import { AccessTokenGuard } from './guards/access-token.guard'
import { SharedFollwerRepo } from './repositories/shared-follwer.repo'
import { MailerModuleConfig } from './Modules/mailer.module'
import { MailService } from './services/mail.service'
import { S3Service } from './services/s3.service'

const sharedServices = [
  PrismaService,
  HashingService,
  TokenService,
  SharedUserRepo,
  SharedFollwerRepo,
  MailService,
  S3Service,
]

@Global()
@Module({
  providers: [
    ...sharedServices,
    AccessTokenGuard,
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
  ],
  exports: sharedServices,
  imports: [JwtModule, MailerModuleConfig],
})
export class SharedModule {}
