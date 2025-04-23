import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { SharedModule } from './shared/shared.module'
import { UsersModule } from './routes/users/users.module'
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import CustomZodValidationPipe from './shared/pipes/custom-zod-validation.pipe'
import { HttpExceptionFilter } from './shared/filters/http-exception.filter'
import { CustomZodSerializerInterceptor } from './shared/interceptors/custom-zod-serializer.interceptor'
import { MediasModule } from './routes/medias/medias.module'
import { TweetsModule } from './routes/tweets/tweets.module';
import { BookmarksModule } from './routes/bookmarks/bookmarks.module';
import { LikesModule } from './routes/likes/likes.module';

@Module({
  imports: [SharedModule, UsersModule, MediasModule, TweetsModule, BookmarksModule, LikesModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: CustomZodValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CustomZodSerializerInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
