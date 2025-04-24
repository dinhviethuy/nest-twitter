import { Module } from '@nestjs/common'
import { SearchService } from './search.service'
import { SearchController } from './search.controller'
import { SearchRepo } from './search.repo'

@Module({
  controllers: [SearchController],
  providers: [SearchService, SearchRepo],
})
export class SearchModule {}
