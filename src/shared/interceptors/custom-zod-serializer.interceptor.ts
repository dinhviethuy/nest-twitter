import { CallHandler, ExecutionContext, Injectable, StreamableFile } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { validate, ZodSerializationException, ZodSerializerInterceptor } from 'nestjs-zod'
import { Observable, map } from 'rxjs'
import { MessageKey } from '../decorators/message.decorator'

const createZodSerializationException = (error) => {
  return new ZodSerializationException(error)
}

@Injectable()
export class CustomZodSerializerInterceptor extends ZodSerializerInterceptor {
  constructor(reflector) {
    super(reflector)
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const responseSchema = this.getContextResponseSchema(context)
    const statusCode = context.switchToHttp().getResponse().statusCode
    const defaultMessage = (this.reflector as Reflector).get<string | undefined>(MessageKey, context.getHandler()) ?? ''

    return next.handle().pipe(
      map((res) => {
        let message = defaultMessage
        if (res?.__customMessage) {
          message = res.__customMessage
          delete res.__customMessage // Clean up before returning
        }
        if (!responseSchema || typeof res !== 'object' || res instanceof StreamableFile) {
          return {
            data: res,
            statusCode,
            message,
          }
        }

        const validatedData = Array.isArray(res)
          ? res.map((item) => validate(item, responseSchema, createZodSerializationException))
          : validate(res, responseSchema, createZodSerializationException)

        return {
          data: validatedData,
          statusCode,
          message,
        }
      }),
    )
  }
}
