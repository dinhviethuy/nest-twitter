import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../shared/services/prisma.service'
import { EncodingStatus } from '@/shared/constants/orther.constants'
import { encodeHLSWithMultipleVideoStreams } from '@/shared/utils/encodeVideo'
import fsPromise from 'fs/promises'

@Injectable()
export class QueueService {
  items: string[]
  encoding: boolean
  name: string[]

  constructor(private readonly prismaService: PrismaService) {
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
        console.log('Done encode', item)
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
