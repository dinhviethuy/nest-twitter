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
} from '@nestjs/common'
import { MediasService } from './medias.service'
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express'
import { MessageResponse } from '@/shared/decorators/message.decorator'
import { CustomParseFilePipe } from '@/shared/pipes/custom-parse-file.pipe'
import { Response } from 'express'
import path from 'path'
import { UPLOAD_IMAGE_DIR } from '@/shared/constants/orther.constants'
import { IsPublic } from '@/shared/decorators/auth.decorator'
import envConfig from '@/shared/config'

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
}
