import { faker } from '@faker-js/faker'
import { HashingService } from '@/shared/services/hashing.service'
import { UserVerifyStatus } from '@/shared/constants/users.contants'
import { Logger } from '@nestjs/common'
import { TweetAudience, TweetType } from '@/shared/constants/tweet.constants'
import { PrismaService } from '@/shared/services/prisma.service'

const prisma = new PrismaService()
const hashing = new HashingService()
const logger = new Logger('FakeData')
const passwordDefault = '123456'

const COUNT_USER_RANDOM = 100

const USER_DEFAULT = {
  username: faker.internet.username(),
  email: 'admin@gmail.com',
  avatar: faker.image.avatar(),
  dateOfBirth: faker.date.birthdate(),
  name: 'Đinh Viết Huy',
  verify: UserVerifyStatus.Verified,
}

function GetRandomNumber(ids: number[], length: number) {
  const randomIds = new Set<number>()
  while (randomIds.size < length) {
    const randomIndex = Math.floor(Math.random() * ids.length)
    randomIds.add(ids[randomIndex])
  }
  return Array.from(randomIds)
}

function GetRandomHashtags(length: number) {
  const randomHashtags = new Set<string>()
  while (randomHashtags.size < length) {
    randomHashtags.add(faker.lorem.word())
  }
  return Array.from(randomHashtags)
}

async function createUserDefault(hashPassword: string) {
  logger.log('Create user default')

  const user = await prisma.user.create({
    data: {
      ...USER_DEFAULT,
      password: hashPassword,
    },
  })
  logger.log('Create user default success', user.id)
  return user.id
}

async function RandomUser(hashPassword: string) {
  logger.log('Create random user', COUNT_USER_RANDOM)
  const res = await Promise.all([
    ...Array.from({ length: COUNT_USER_RANDOM }, async () => {
      return prisma.user.create({
        data: {
          username: faker.internet.username(),
          email: faker.internet.email(),
          password: hashPassword,
          avatar: faker.image.avatar(),
          dateOfBirth: faker.date.birthdate(),
          name: faker.internet.username(),
          verify: UserVerifyStatus.Verified,
        },
      })
    }),
  ])
  logger.log('Create random user success', res.length)
  return res.map((user) => user.id)
}

async function FollowUserAndCreateTwee(userId: number, ids: number[], lengthRandom = 5) {
  logger.log('Follow user', ids.length)
  const randomHashtags = GetRandomHashtags(lengthRandom)
  await Promise.all([
    ...randomHashtags.map(async (hashtag) => {
      return await prisma.hashtag.create({
        data: {
          name: hashtag,
        },
      })
    }),
  ])
  const res = await Promise.all([
    ...ids.map(async (id) => {
      const randomIds = GetRandomNumber(ids, lengthRandom)
      return await Promise.all([
        prisma.follower.create({
          data: {
            userId,
            followedUserId: id,
          },
        }),
        prisma.tweet.create({
          data: {
            type: TweetType.TWEET,
            content: faker.lorem.words(10),
            audience: TweetAudience.EVERYONE,
            userId: id,
            hashtags: {
              connectOrCreate: randomHashtags.map((hashtag) => ({
                where: { name: hashtag },
                create: { name: hashtag },
              })),
            },
            mentions: {
              connect: randomIds.map((mention) => ({
                id: mention,
              })),
            },
          },
        }),
        prisma.tweet.create({
          data: {
            type: TweetType.TWEET,
            content: faker.lorem.words(10),
            audience: TweetAudience.EVERYONE,
            userId: id,
            hashtags: {
              connectOrCreate: randomHashtags.map((hashtag) => ({
                where: { name: hashtag },
                create: { name: hashtag },
              })),
            },
            mentions: {
              connect: randomIds.map((mention) => ({
                id: mention,
              })),
            },
          },
        }),
      ])
    }),
  ])
  logger.log('Follow user success', res.length)
}

async function main() {
  const [hashPassword] = await Promise.all([
    hashing.hash(passwordDefault),
    prisma.user.deleteMany(),
    prisma.tweet.deleteMany(),
    prisma.follower.deleteMany(),
    prisma.hashtag.deleteMany(),
    prisma.media.deleteMany(),
    prisma.follower.deleteMany(),
    prisma.like.deleteMany(),
    prisma.refreshToken.deleteMany(),
  ])
  const [userId, ids] = await Promise.all([createUserDefault(hashPassword), RandomUser(hashPassword)])
  await FollowUserAndCreateTwee(userId, ids, 5)
  logger.log('Create fake data success')
}

main()
  .catch(async (e) => {
    logger.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
  .finally(async () => {
    logger.log('Disconnecting Prisma')
    await prisma.$disconnect()
    process.exit(0)
  })
