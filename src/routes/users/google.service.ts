import { Injectable, NotFoundException } from '@nestjs/common'
import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'
import envConfig from '@/shared/config'
import { HashingService } from '@/shared/services/hashing.service'
import { SharedUserRepo } from '../../shared/repositories/shared-user.repo'
import { v4 as uuid } from 'uuid'
import { PrismaService } from '../../shared/services/prisma.service'
import { UserVerifyStatus } from '@/shared/constants/users.contants'
import { UsersService } from './users.service'

@Injectable()
export class GoogleService {
  private oauth2Client: OAuth2Client
  constructor(
    private readonly sharedUserRepo: SharedUserRepo,
    private readonly hashingService: HashingService,
    private readonly prismaService: PrismaService,
    private readonly usersService: UsersService,
  ) {
    this.oauth2Client = new google.auth.OAuth2(
      envConfig.GOOGLE_CLIENT_ID,
      envConfig.GOOGLE_CLIENT_SECRET,
      envConfig.GOOGLE_REDIRECT_URI,
    )
  }

  getAuthorizationUrl() {
    const scopes = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ]
    const url = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      include_granted_scopes: true,
    })
    return {
      url,
    }
  }

  async googleCallback(code: string) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code)
      this.oauth2Client.setCredentials(tokens)
      const oauth2 = google.oauth2({
        auth: this.oauth2Client,
        version: 'v2',
      })
      const { data } = await oauth2.userinfo.get()
      if (!data.email) {
        throw new NotFoundException('Email không tồn tại')
      }
      let user = await this.sharedUserRepo.findUnique({ email: data.email })
      let new_user = false
      if (!user) {
        new_user = true
        const passwordRandom = uuid()
        const hashedPassword = await this.hashingService.hash(passwordRandom)
        user = await this.prismaService.user.create({
          data: {
            email: data.email,
            password: hashedPassword,
            name: data.name ?? 'Unknown',
            avatar: data.picture ?? '',
            username: data.email.split('@')[0],
            dateOfBirth: new Date('2000-01-01'),
            verify: UserVerifyStatus.Verified,
          },
        })
      }
      const authTokens = await this.usersService.generateTokens(user.id, user.verify)
      return {
        ...authTokens,
        new_user,
      }
    } catch (error) {
      console.error('Error during Google authentication:', error)
      throw error
    }
  }
}
