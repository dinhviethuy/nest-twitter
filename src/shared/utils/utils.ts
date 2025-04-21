import { Prisma } from '@prisma/client'

export const isUniqueConstraintPrismaError = (error: any): error is Prisma.PrismaClientKnownRequestError => {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'
}

export function isISOString(str: string): boolean {
  const date = new Date(str)
  return !isNaN(date.getTime()) && str === date.toISOString()
}
