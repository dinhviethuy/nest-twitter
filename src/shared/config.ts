import { Logger } from '@nestjs/common'
import { config } from 'dotenv'
import fs from 'fs'
import path from 'path'
import { z } from 'zod'

config({
  path: '.env',
})

const logger = new Logger('ConfigService')

if (!fs.existsSync(path.resolve('uploads'))) {
  fs.mkdirSync(path.resolve('uploads/images'), { recursive: true })
  fs.mkdirSync(path.resolve('uploads/videos'), { recursive: true })
  logger.log('Uploads directory created successfully.')
}

if (!fs.existsSync(path.resolve('.env'))) {
  logger.error('No .env file found. Please create a .env file in the root directory.')
  process.exit(1)
}

const configSchema = z.object({
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string(),
  ACCESS_TOKEN_SECRET: z.string(),
  ACCESS_TOKEN_EXPIRES_IN: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_EXPIRES_IN: z.string(),
  EMAIL_VERIFY_TOKEN_SECRET: z.string(),
  EMAIL_VERIFY_TOKEN_EXPIRES_IN: z.string(),
  FORGOT_PASSWORD_TOKEN_SECRET: z.string(),
  FORGOT_PASSWORD_TOKEN_EXPIRES_IN: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_REDIRECT_URI: z.string(),
  CLIENT_REDIRECT_URI: z.string(),
  SERVER_URL: z.string(),
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
