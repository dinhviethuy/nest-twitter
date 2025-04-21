import { Logger } from '@nestjs/common'
import { config } from 'dotenv'
import fs from 'fs'
import path from 'path'
import { z } from 'zod'

config({
  path: '.env',
})

const logger = new Logger('ConfigService')

if (!fs.existsSync(path.resolve('.env'))) {
  logger.error('No .env file found. Please create a .env file in the root directory.')
  process.exit(1)
}

const configSchema = z.object({
  DATABASE_URL: z.string(),
  ACCESS_TOKEN_SECRET: z.string(),
  ACCESS_TOKEN_EXPIRES_IN: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_EXPIRES_IN: z.string(),
})

const configServer = configSchema.safeParse(process.env)
if (!configServer.success) {
  logger.error('Invalid environment variables')
  configServer.error.errors.forEach((error) => {
    logger.error(`${error.path.join('.')} - ${error.message}`)
  })
  process.exit(1)
}

const envConfig = configServer.data

export default envConfig
