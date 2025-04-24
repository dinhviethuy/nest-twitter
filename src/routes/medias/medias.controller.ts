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
  InternalServerErrorException,
} from '@nestjs/common'
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express'
import { MessageResponse } from '@/shared/decorators/message.decorator'
import { CustomParseFilePipe } from '@/shared/pipes/custom-parse-file.pipe'
import { Response } from 'express'
import path from 'path'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '@/shared/constants/orther.constants'
import { IsPublic } from '@/shared/decorators/auth.decorator'
import envConfig from '@/shared/config'
import { createReadStream, statSync } from 'fs'
import fs from 'fs'
import { PrismaService } from '@/shared/services/prisma.service'
import { GetVideoStatusEncodeDTO } from './medias.dto'
import { QueueService } from './queue.service'
import { SharedUserRepo } from '@/shared/repositories/shared-user.repo'
import { ActiveUser } from '@/shared/decorators/active-user.decorator'
import { AccessTokenPayload } from '@/shared/types/jwt.types'
import { S3Service } from '@/shared/services/s3.service'
import fsPromise from 'fs/promises'

@Controller('medias')
export class MediasController {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly sharedUserRepo: SharedUserRepo,
    private readonly queueService: QueueService,
    private readonly s3Service: S3Service,
  ) {}

  @Post('upload-image')
  @MessageResponse('Upload ảnh thành công')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 2 * 1024 * 1024, // 2MB
      },
    }),
  )
  async uploadImage(
    @UploadedFile(
      new CustomParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 })],
      }),
    )
    file: Express.Multer.File,
    @ActiveUser() user: AccessTokenPayload,
  ) {
    this.sharedUserRepo.checkUserVerify(user.verify)
    const res = await this.s3Service
      .uploadFile({
        contentType: file.mimetype,
        filename: file.filename,
        folder: 'images',
        filepath: file.path,
      })
      .catch((error) => {
        throw new InternalServerErrorException('Error uploading file to S3', error)
      })
      .finally(async () => {
        await fsPromise.unlink(file.path)
      })
    return {
      url: `${envConfig.SERVER_URL}/medias/static/${file.filename}`,
      urlS3: res.Location,
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
  async uploadImages(
    @UploadedFiles(
      new CustomParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 })],
      }),
    )
    files: Array<Express.Multer.File>,
    @ActiveUser() user: AccessTokenPayload,
  ) {
    this.sharedUserRepo.checkUserVerify(user.verify)
    const res = await Promise.all([
      ...files.map(async (file) => {
        const res = await this.s3Service
          .uploadFile({
            contentType: file.mimetype,
            filename: file.filename,
            folder: 'images',
            filepath: file.path,
          })
          .catch((error) => {
            throw new InternalServerErrorException('Error uploading file to S3', error)
          })
          .finally(async () => {
            await fsPromise.unlink(file.path)
          })
        return {
          url: `${envConfig.SERVER_URL}/medias/static/${file.filename}`,
          urlS3: res.Location,
        }
      }),
    ])
    return res
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
  @MessageResponse('Lấy video thành công')
  serveVideoFile(@Param('filename') filename: string, @Res() res: Response, @Headers() headers) {
    const videoPath = path.resolve(UPLOAD_VIDEO_DIR, filename, 'master.m3u8')
    // Kiểm tra file có tồn tại không
    if (!fs.existsSync(videoPath)) {
      const notFound = new NotFoundException('File not found')
      return res.status(notFound.getStatus()).send(notFound.getResponse())
    }
    // set header cho response
    // Trả về video theo định dạng mp4
    res.setHeader('Accept-Ranges', 'bytes')
    res.setHeader('Content-Type', 'video/mp4')
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
  async uploadVideo(@UploadedFiles() files: Array<Express.Multer.File>, @ActiveUser() user: AccessTokenPayload) {
    this.sharedUserRepo.checkUserVerify(user.verify)
    if (!files || files.length === 0) {
      throw new NotFoundException('File not found')
    }
    try {
      const result = await Promise.all(
        files.map((file) => {
          const directory = path.dirname(file.path) // Lấy đường dẫn thư mục chứa file video
          const folderName = path.basename(directory) // Lấy tên thư mục chứa file video
          // Trả URL về ngay lập tức
          const fileUrl = `${envConfig.SERVER_URL}/medias/video/${folderName}/master.m3u8`

          // Mã hóa video chạy ngầm
          setImmediate(() => {
            try {
              // Mã hóa video thành HLS
              // await encodeHLSWithMultipleVideoStreams(file.path)

              // Xóa file gốc sau khi mã hóa xong
              // await fsPromise.unlink(file.path)
              this.queueService.enqueue(file.path, folderName)
            } catch (error) {
              console.error('Error during video encoding:', error)
            }
          })

          return { url: fileUrl }
        }),
      )

      return result
    } catch (error) {
      console.error('Error uploading video:', error)
      throw new Error('Video upload failed')
    }
  }

  @Get('video/:filename/master.m3u8')
  @IsPublic() // Nếu cần xác thực thì bỏ dòng này đi
  @MessageResponse('Lấy video thành công')
  serveVideoHLSFile(@Param('filename') filename: string, @Res() res: Response) {
    const videoPath = path.resolve(UPLOAD_VIDEO_DIR, filename, 'master.m3u8')
    if (!fs.existsSync(videoPath)) {
      const notFound = new NotFoundException('File not found')
      return res.status(notFound.getStatus()).send(notFound.getResponse())
    }
    res.sendFile(videoPath)
  }

  @Get('video/:filename/:v/:segment')
  @IsPublic() // Nếu cần xác thực thì bỏ dòng này đi
  @MessageResponse('Lấy video thành công')
  serveTsHLSFile(@Param() param: any, @Res() res: Response) {
    const file = path.resolve(UPLOAD_VIDEO_DIR, param.filename, param.v, param.segment)
    if (!fs.existsSync(file)) {
      const notFound = new NotFoundException('File not found')
      return res.status(notFound.getStatus()).send(notFound.getResponse())
    }
    res.sendFile(file)
  }

  @Get('video-status/:name')
  @MessageResponse('Lấy trạng thái video thành công')
  async getVideoStatusEncode(@Param() param: GetVideoStatusEncodeDTO, @ActiveUser() user: AccessTokenPayload) {
    this.sharedUserRepo.checkUserVerify(user.verify)
    const videoStatus = await this.prismaService.videoStatusEncode.findUnique({
      where: {
        name: param.name,
      },
    })
    if (!videoStatus) {
      throw new NotFoundException('Video not found')
    }
    return videoStatus
  }
}
