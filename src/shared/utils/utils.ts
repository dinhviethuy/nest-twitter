import { Prisma } from '@prisma/client'
import { v4 as uuid } from 'uuid'

export const isUniqueConstraintPrismaError = (error: any): error is Prisma.PrismaClientKnownRequestError => {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'
}

export function isISOString(str: string): boolean {
  const date = new Date(str)
  return !isNaN(date.getTime()) && str === date.toISOString()
}

export const isForeignKeyConstraintPrismaError = (error: any): error is Prisma.PrismaClientKnownRequestError => {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003'
}

export const isNotFoundPrismaError = (error: any): error is Prisma.PrismaClientKnownRequestError => {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025'
}

export const randomFileName = (ext: string): string => {
  const temp = uuid()
  return `${temp}.${ext}`
}
