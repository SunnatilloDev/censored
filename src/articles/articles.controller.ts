import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import {
  CreateArticleDto,
  RateArticleDto,
  ReportScamDto,
  UpdateArticleDto,
} from './dto';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/roles.enum';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Articles')
@Controller('articles')
@UseGuards(RolesGuard)
export class ArticlesController {
  constructor(private readonly articleService: ArticlesService) {}

  @Post()
  async createArticle(@Body() articleData: CreateArticleDto) {
    return await this.articleService.createArticle(articleData);
  }

  @Get()
  async getAllArticles() {
    return await this.articleService.getAllArticles();
  }
  @Get('search')
  async searchArticles(@Query('query') query: string) {
    return this.articleService.searchArticles(query);
  }

  @Get('top')
  async getTopArticles(
    @Query('count') count: number,
    @Query('latest') latest: boolean,
  ) {
    return await this.articleService.getTopArticles(
      Number(count),
      JSON.parse(latest.toString()),
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
  @Roles(Role.MODERATOR, Role.ADMIN, Role.OWNER)
  @Put(':id')
  async updateArticle(
    @Param('id') articleId: string,
    @Body() updateData: UpdateArticleDto,
  ) {
    return await this.articleService.updateArticle(articleId, updateData);
  }
  @Roles(Role.MODERATOR, Role.ADMIN, Role.OWNER)
  @Delete(':id')
  async deleteArticle(@Param('id') articleId: string) {
    return await this.articleService.deleteArticle(articleId);
  }

  @Post(':id/report-scam')
  async reportArticleAsScam(
    @Param('id') articleId: string,
    @Body() body: ReportScamDto,
  ) {
    return this.articleService.reportScam(
      Number(articleId),
      body.reportedById,
      body.reason,
      body.proof,
    );
  }

  @Get(':id/scam-reports')
  async getScamReports(@Param('id') articleId: string) {
    return this.articleService.getScamReports(Number(articleId));
  }
  @Roles(Role.MODERATOR, Role.ADMIN, Role.OWNER)

  // New endpoint to remove a scam report
  @Delete('scam-report/:reportId')
  async removeScamReport(@Param('reportId') reportId: number) {
    return this.articleService.removeScamReport(reportId);
  }
  @Roles(Role.MODERATOR, Role.ADMIN, Role.OWNER)

  // New endpoint to restore an article version
  @Post(':id/restore-version/:versionId')
  async restoreArticleVersion(
    @Param('id') articleId: number,
    @Param('versionId') versionId: number,
  ) {
    return this.articleService.restoreArticleVersion(articleId, versionId);
  }
}
