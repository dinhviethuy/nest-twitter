import { MailerService } from '@nestjs-modules/mailer'
import { Injectable } from '@nestjs/common'
import envConfig from '../config'

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendUserConfirmation({
    email,
    name,
    token,
    subject,
    ButtonTitle,
    path,
  }: {
    token: string
    name: string
    email: string
    subject: string
    ButtonTitle: string
    path: string
  }) {
    const url = `${envConfig.CLIENT_URL}/${path}?token=${token}`

    await this.mailerService.sendMail({
      to: email,
      subject,
      template: 'verify-email',
      context: {
        name,
        url,
        ButtonTitle,
      },
    })
  }
}
