import { Injectable } from '@nestjs/common'
import { SearchRepo } from './search.repo'
import { SearchQueryType } from './search.model'

@Injectable()
export class SearchService {
  constructor(private readonly searchRepo: SearchRepo) {}

  async searchContent({ search, userId }: { search: SearchQueryType; userId: number | undefined }) {
    const res = await this.searchRepo.searchContent({
      search,
      userId,
    })
    return res
  }
}
