import { createZodDto } from 'nestjs-zod'
import { GetVideoStatusEncodeSchema } from './medias.model'

export class GetVideoStatusEncodeDTO extends createZodDto(GetVideoStatusEncodeSchema) {}
