import { createZodDto } from 'nestjs-zod'
import { CreateBookmarkBodySchema } from './bookmarks.model'

export class CreateBookmarkBodyDTO extends createZodDto(CreateBookmarkBodySchema) {}
