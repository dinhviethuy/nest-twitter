import { Module } from '@nestjs/common'
import { MulterModule } from '@nestjs/platform-express'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '@/shared/constants/orther.constants'
import multer from 'multer'
import mine from 'mime-types'
import { randomFileName } from '@/shared/utils/utils'
import { MediasController } from './medias.controller'
import { MediasService } from './medias.service'
import { v4 as uuid } from 'uuid'
import fs from 'fs'

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = mine.contentType(file.mimetype) as string
    if (type.startsWith('image/')) {
      cb(null, UPLOAD_IMAGE_DIR)
    } else if (type.startsWith('video/')) {
      const folder = uuid()
      const path = `${UPLOAD_VIDEO_DIR}/${folder}`
      // Create the directory if it doesn't exist
      fs.mkdir(path, { recursive: true }, (err) => {
        if (err) {
          console.error('Error creating directory:', err)
          return cb(err, path)
        }
      })
      cb(null, path)
    }
  },
  filename: (req, file, cb) => {
    const ext = mine.extension(file.mimetype) as string
    const filename = randomFileName(ext)
    cb(null, filename)
  },
})

@Module({
  imports: [
    MulterModule.register({
      storage,
    }),
  ],
  controllers: [MediasController],
  providers: [MediasService],
})
export class MediasModule {}
