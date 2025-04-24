import { Controller, Get, Query } from '@nestjs/common'
import { SearchService } from './search.service'
import { SearchQueryDTO } from './search.dto'
import { ActiveUser } from '@/shared/decorators/active-user.decorator'
import { SkipAuth } from '@/shared/decorators/auth.decorator'

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @SkipAuth()
  async searchContent(@Query() search: SearchQueryDTO, @ActiveUser('userId') userId: number | undefined) {
    const res = await this.searchService.searchContent({
      search,
      userId,
    })
    return res
  }
}
