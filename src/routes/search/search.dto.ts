import { createZodDto } from 'nestjs-zod'
import { SearchQuerySchema } from './search.model'

export class SearchQueryDTO extends createZodDto(SearchQuerySchema) {}
