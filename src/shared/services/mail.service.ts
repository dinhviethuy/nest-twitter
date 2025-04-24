import { MailerService } from '@nestjs-modules/mailer'
import { Injectable } from '@nestjs/common'

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendUserConfirmation({ email, name, token }: { token: string; name: string; email: string }) {
    const url = `example.com/auth/confirm?token=${token}`

    await this.mailerService.sendMail({
      to: email,
      // from: '"Support Team" <support@example.com>',
      subject: 'Welcome to Nice App! Confirm your Email',
      template: 'regiter',
      context: {
        name,
        url,
      },
    })
  }
}
