import { SetMetadata } from '@nestjs/common'

export const MessageKey = 'message'

export const MessageResponse = (message: string) => SetMetadata(MessageKey, message)
