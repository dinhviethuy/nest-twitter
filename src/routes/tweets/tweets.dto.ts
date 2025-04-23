import { createZodDto } from 'nestjs-zod'
import { CreateTweetBodySchema } from './tweets.model'

export class CreateTweetBodyDTO extends createZodDto(CreateTweetBodySchema) {}
