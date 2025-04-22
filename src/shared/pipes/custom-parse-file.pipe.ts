import { ParseFileOptions, ParseFilePipe } from '@nestjs/common'
import fs from 'fs/promises'

/**
 * CustomParseFilePipe để xóa file nếu có lỗi xảy ra trong quá trình xử lý
 */
export class CustomParseFilePipe extends ParseFilePipe {
  constructor(options?: ParseFileOptions) {
    super(options)
  }
  transform(files: Array<Express.Multer.File> | Express.Multer.File): Promise<any> {
    return super.transform(files).catch(async (err) => {
      if (files instanceof Array) {
        if (!files || files.length === 0) {
          return
        }
        await Promise.all(
          files.map((file) => {
            return fs.unlink(file.path)
          }),
        )
        throw err
      } else {
        await fs.unlink(files.path)
      }
    })
  }
}
