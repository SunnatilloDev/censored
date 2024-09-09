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
import { CreateArticleDto, UpdateArticleDto } from 'src/articles/dto/index';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articleService: ArticlesService) {}

  @Post()
  async createArticle(@Body() articleData: CreateArticleDto) {
    return await this.articleService.createArticle(articleData);
  }

  @Get(':id')
  async getArticle(
    @Param('id') articleId: string,
    @Query('userId') userId: number,
  ) {
    return await this.articleService.getArticle(articleId, userId);
  }

  @Put(':id')
  async updateArticle(@Param('id') articleId: string, @Body() updateData: UpdateArticleDto) {
    return await this.articleService.updateArticle(articleId, updateData);
  }

  @Delete(':id')
  async deleteArticle(@Param('id') articleId: string) {
    return await this.articleService.deleteArticle(articleId);
  }
}
