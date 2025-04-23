import { createZodDto } from 'nestjs-zod'
import { CreateBookmarkBodySchema, DeleteBookmarkParamsSchema } from './bookmarks.model'

export class CreateBookmarkBodyDTO extends createZodDto(CreateBookmarkBodySchema) {}
export class DeleteBookmarkParamsDTO extends createZodDto(DeleteBookmarkParamsSchema) {}
