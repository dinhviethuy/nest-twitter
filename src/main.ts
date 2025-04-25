import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import envConfig from './shared/config'
import { NestExpressApplication } from '@nestjs/platform-express'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { patchNestJsSwagger } from 'nestjs-zod'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  app.enableCors()
  patchNestJsSwagger()
  const config = new DocumentBuilder()
    .setTitle('Twitter Clone API Documentation')
    .setDescription(
      'This is the Swagger API documentation for the Twitter Clone project, providing detailed endpoints for user authentication, tweeting, following, and more.',
    )
    .setVersion('1.0')
    .addOAuth2()
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
      },
      'accessToken',
    )
    .addSecurityRequirements('accessToken')
    .build()
  const documentFactory = () => SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('/', app, documentFactory(), {
    customSiteTitle: 'Twitter Clone API Documentation',
  })
  await app.listen(envConfig.PORT ?? 3000)
}
bootstrap()
