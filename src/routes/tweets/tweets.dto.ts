import { createZodDto } from 'nestjs-zod'
import { CreateTweetBodySchema, GetTweetParamsSchema } from './tweets.model'

export class CreateTweetBodyDTO extends createZodDto(CreateTweetBodySchema) {}
export class GetTweetParamsDTO extends createZodDto(GetTweetParamsSchema) {}
