import { Injectable } from '@nestjs/common'
import { hash, compare } from 'bcrypt'

const slatRounds = 10

@Injectable()
export class HashingService {
  hash(value: string): Promise<string> {
    return hash(value, slatRounds)
  }

  compare(value: string, hash: string): Promise<boolean> {
    return compare(value, hash)
  }
}
