import { MailerModule } from '@nestjs-modules/mailer'
import { Module } from '@nestjs/common'
import envConfig from '../config'
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter'
import path from 'path'

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          host: envConfig.MAIL_HOST,
          secure: false,
          auth: {
            user: envConfig.MAIL_ADDRESS,
            pass: envConfig.MAIL_PASSWORD,
          },
        },
        defaults: {
          from: '"No Reply" <noreply@dvh.com>',
        },
        template: {
          dir: path.join(__dirname, '../templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
})
export class MailerModuleConfig {}
