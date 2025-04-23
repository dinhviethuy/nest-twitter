import { createZodDto } from 'nestjs-zod'
import { CreateLikeBodySchema, DeleteLikeParamsSchema } from './likes.model'

export class CreateLikeBodyDTO extends createZodDto(CreateLikeBodySchema) {}
export class DeleteLikeParamsDTO extends createZodDto(DeleteLikeParamsSchema) {}
