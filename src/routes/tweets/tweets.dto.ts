import { createZodDto } from 'nestjs-zod'
import { CreateTweetBodySchema, GetTweetParamsSchema, GetTweetChildrenQuerySchema } from './tweets.model'

export class CreateTweetBodyDTO extends createZodDto(CreateTweetBodySchema) {}
export class GetTweetParamsDTO extends createZodDto(GetTweetParamsSchema) {}
export class GetTweetChildrenQueryDTO extends createZodDto(GetTweetChildrenQuerySchema) {}
