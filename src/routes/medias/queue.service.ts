import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../shared/services/prisma.service'
import { EncodingStatus, UPLOAD_VIDEO_DIR } from '@/shared/constants/orther.constants'
import { encodeHLSWithMultipleVideoStreams } from '@/shared/utils/encodeVideo'
import fsPromise from 'fs/promises'
import { S3Service } from '@/shared/services/s3.service'
import path from 'path'
import mime from 'mime-types'
import { getFiles } from '@/shared/utils/utils'

@Injectable()
export class QueueService {
  items: string[]
  encoding: boolean
  name: string[]

  constructor(
    private readonly prismaService: PrismaService,
    private readonly s3Service: S3Service,
  ) {
    this.items = []
    this.encoding = false
    this.name = []
  }

  async enqueue(item: string, name: string) {
    this.items.push(item)
    this.name.push(name)
    await this.prismaService.videoStatusEncode.create({
      data: {
        name,
        status: EncodingStatus.PENDING,
      },
    })
    await this.processEnCode()
  }
  processEnCode = async () => {
    if (this.encoding) return
    this.encoding = true
    while (this.items.length > 0) {
      const item = this.items[0]
      const name = this.name[0]
      try {
        await this.prismaService.videoStatusEncode.update({
          where: {
            name,
          },
          data: {
            status: EncodingStatus.PROCESSING,
          },
        })
        await encodeHLSWithMultipleVideoStreams(item)
        this.items.shift()
        await this.prismaService.videoStatusEncode.update({
          where: {
            name,
          },
          data: {
            status: EncodingStatus.COMPLETED,
          },
        })
        await fsPromise.unlink(item)
        this.name.shift()
        const directory = path.resolve(UPLOAD_VIDEO_DIR, name)
        const files = getFiles(path.resolve(UPLOAD_VIDEO_DIR, name))
        await Promise.all([
          ...files.map(async (file) => {
            const filename = 'video-hls' + file.replace(path.resolve(UPLOAD_VIDEO_DIR), '').replace(/\\/g, '/')
            console.log('Uploading file', filename)

            await this.s3Service.uploadFile({
              contentType: mime.lookup(file) || 'application/octet-stream',
              filename,
              filepath: file,
            })
            // await fsPromise.unlink(filePath)
          }),
        ])
        console.log('Done encode', item)
        await fsPromise.rm(directory, { recursive: true, force: true })
      } catch (e) {
        await this.prismaService.videoStatusEncode
          .update({
            where: {
              name,
            },
            data: {
              status: EncodingStatus.FAILED,
            },
          })
          .catch((e) => {
            throw e
          })
        throw e
      }
    }
    this.encoding = false
    console.log('Done all')
  }
}
