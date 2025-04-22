import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import envConfig from './shared/config'
import { NestExpressApplication } from '@nestjs/platform-express'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  app.enableCors()
  await app.listen(envConfig.PORT ?? 3000)
}
bootstrap()
