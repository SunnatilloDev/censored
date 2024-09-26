import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import {
  CreateArticleDto,
  RateArticleDto,
  UpdateArticleDto,
} from 'src/articles/dto/index';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
@ApiTags('Articles')
@Controller('articles')
export class ArticlesController {
  constructor(private readonly articleService: ArticlesService) {}

  @Post()
  async createArticle(@Body() articleData: CreateArticleDto) {
    return await this.articleService.createArticle(
      articleData,
      articleData.mediaUrls,
    );
  }

  @Post(':id/rate')
  async rateArticle(
    @Param('id') articleId: string,
    @Body() body: RateArticleDto,
  ) {
    return this.articleService.rateArticle(
      Number(articleId),
      body.userId,
      body.rating,
    );
  }
  @Get(':id/rate')
  async getRateArticle(@Param('id') articleId: string) {
    return this.articleService.getRateArticle(Number(articleId));
  }
  @Get(':id')
  @ApiQuery({ name: 'userId', required: false, type: String })
  async getArticle(
    @Param('id') articleId: string,
    @Query('userId') userId?: number,
  ) {
    return await this.articleService.getArticle(articleId, Number(userId));
  }
  @Get('top')
  async getTopArticles(@Query('count') count: number) {
    return await this.articleService.getTopArticles(count);
  }
  @Put(':id')
  async updateArticle(
    @Param('id') articleId: string,
    @Body() updateData: UpdateArticleDto,
  ) {
    return await this.articleService.updateArticle(articleId, updateData);
  }

  @Delete(':id')
  async deleteArticle(@Param('id') articleId: string) {
    return await this.articleService.deleteArticle(articleId);
  }
}
