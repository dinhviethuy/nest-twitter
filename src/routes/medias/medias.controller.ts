import {
  Controller,
  Get,
  MaxFileSizeValidator,
  NotFoundException,
  Param,
  Post,
  Res,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  Headers,
  HttpStatus,
  Header,
} from '@nestjs/common'
import { MediasService } from './medias.service'
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express'
import { MessageResponse } from '@/shared/decorators/message.decorator'
import { CustomParseFilePipe } from '@/shared/pipes/custom-parse-file.pipe'
import { Response } from 'express'
import path from 'path'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '@/shared/constants/orther.constants'
import { IsPublic } from '@/shared/decorators/auth.decorator'
import envConfig from '@/shared/config'
import { createReadStream, statSync } from 'fs'

@Controller('medias')
export class MediasController {
  constructor(private readonly mediasService: MediasService) {}

  @Post('upload-image')
  @MessageResponse('Upload ảnh thành công')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 2 * 1024 * 1024, // 2MB
      },
    }),
  )
  uploadImage(
    @UploadedFile(
      new CustomParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 })],
      }),
    )
    file: Express.Multer.File,
  ) {
    return {
      url: `${envConfig.SERVER_URL}/medias/static/${file.filename}`,
    }
  }

  @Post('upload-images')
  @MessageResponse('Upload ảnh thành công')
  @UseInterceptors(
    FilesInterceptor('files', 5, {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB,
      },
    }),
  )
  uploadImages(
    @UploadedFiles(
      new CustomParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 })],
      }),
    )
    files: Array<Express.Multer.File>,
  ) {
    return files.map((file) => {
      return {
        url: `${envConfig.SERVER_URL}/medias/static/${file.filename}`,
      }
    })
  }

  @Get('static/:filename')
  @IsPublic() // Nếu cần xác thực thì bỏ dòng này đi
  @MessageResponse('Lấy ảnh thành công')
  serveStaticFile(@Param('filename') filename: string, @Res() res: Response) {
    const file = path.resolve(UPLOAD_IMAGE_DIR, filename)
    res.sendFile(file, (err) => {
      if (err) {
        const notFound = new NotFoundException('File not found')
        return res.status(notFound.getStatus()).send(notFound.getResponse())
      }
    })
  }

  @Get('video/:filename')
  @IsPublic() // Nếu cần xác thực thì bỏ dòng này đi
  @Header('Accept-Ranges', 'bytes')
  @Header('Content-Type', 'video/mp4')
  serveVideoFile(@Param('filename') filename: string, @Res() res: Response, @Headers() headers) {
    const videoPath = path.resolve(UPLOAD_VIDEO_DIR, filename)
    const { size } = statSync(videoPath)
    // Lấy thông tin range từ headers
    const videoRange = headers.range
    if (videoRange) {
      // Nếu có range thì trả về video theo range ví dụ file.m3u8
      // Xóa 'bytes=' khỏi range
      // và tách thành 2 phần start và end ví dụ: bytes=0-499
      // sẽ tách thành [0, 499]
      const parts = videoRange.replace(/bytes=/, '').split('-')
      const start = parseInt(parts[0], 10)
      // Nếu không có end thì lấy đến cuối video
      const end = parts[1] ? parseInt(parts[1], 10) : size - 1
      // lấy kích thước của video
      const chunkSize = end - start + 1
      const readStreamfile = createReadStream(videoPath, {
        start,
        end,
        // đọc mỗi lần 60 byte
        // để không bị tắc nghẽn bộ nhớ
        highWaterMark: 60,
      })
      // tạo header cho response
      const head = {
        'Content-Range': `bytes ${start}-${end}/${size}`,
        'Content-Length': chunkSize,
      }
      // trả về status 206 (Partial Content)
      res.writeHead(HttpStatus.PARTIAL_CONTENT, head)
      // trả về video
      // và pipe video vào response
      readStreamfile.pipe(res)
    } else {
      // Nếu không có range thì trả về video bình thường
      const head = {
        'Content-Length': size,
      }
      res.writeHead(HttpStatus.OK, head)
      createReadStream(videoPath).pipe(res)
    }
  }

  @Post('upload-video')
  @MessageResponse('Upload video thành công')
  @UseInterceptors(
    FilesInterceptor('files', 1, {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  uploadVideo(@UploadedFiles() files: Array<Express.Multer.File>) {
    return files.map((file) => {
      return {
        url: `${envConfig.SERVER_URL}/medias/video/${file.filename}`,
      }
    })
  }
}
