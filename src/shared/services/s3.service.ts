import { S3 } from '@aws-sdk/client-s3'
import { Injectable, InternalServerErrorException } from '@nestjs/common'
import envConfig from '../config'
import { Upload } from '@aws-sdk/lib-storage'
import { readFileSync } from 'fs'
import { Response } from 'express'

@Injectable()
export class S3Service {
  s3: S3
  constructor() {
    this.s3 = new S3({
      endpoint: envConfig.S3_ENDPOINT,
      region: envConfig.S3_REGION,
      credentials: {
        accessKeyId: envConfig.S3_ACCESS_KEY_ID,
        secretAccessKey: envConfig.S3_SECRET_ACCESS_KEY,
      },
      forcePathStyle: true,
    })
  }

  uploadFile({
    contentType,
    filename,
    folder,
    filepath,
  }: {
    folder?: string
    filename: string
    contentType: string
    filepath: string
  }) {
    try {
      const uploadParams = new Upload({
        client: this.s3,
        params: {
          Bucket: envConfig.S3_BUCKET_NAME,
          Key: folder ? `${folder}/${filename}` : filename,
          Body: readFileSync(filepath),
          ContentType: contentType,
        },
        tags: [],
        queueSize: 4,
        partSize: 1024 * 1024 * 5,
        leavePartsOnError: false,
      })
      return uploadParams.done()
    } catch (error) {
      throw new InternalServerErrorException('Error uploading file to S3', error)
    }
  }

  async getFileObject(key: string, res: Response) {
    const data = await this.s3
      .getObject({
        Bucket: envConfig.S3_BUCKET_NAME,
        Key: key,
      })
      .catch((error) => {
        throw new InternalServerErrorException('Error getting file from S3', error)
      })
    return (data.Body as any).pipe(res)
  }
}
