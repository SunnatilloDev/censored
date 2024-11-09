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
import {
  ApiQuery,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/roles.enum';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Articles')
@Controller('articles')
@UseGuards(RolesGuard)
export class ArticlesController {
  constructor(private readonly articleService: ArticlesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new article' })
  @ApiBody({ type: CreateArticleDto })
  @ApiResponse({
    status: 201,
    description: 'The article has been successfully created.',
  })
  @ApiResponse({ status: 500, description: 'Failed to create article.' })
  async createArticle(@Body() articleData: CreateArticleDto) {
    return await this.articleService.createArticle(articleData);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all articles' })
  @ApiResponse({ status: 200, description: 'List of all articles.' })
  @ApiResponse({ status: 500, description: 'Failed to retrieve articles.' })
  async getAllArticles() {
    return await this.articleService.getAllArticles();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search articles by keyword' })
  @ApiQuery({
    name: 'query',
    type: String,
    required: true,
    description: 'Search keyword',
  })
  @ApiResponse({ status: 200, description: 'Search results for articles.' })
  async searchArticles(@Query('query') query: string) {
    return this.articleService.searchArticles(query);
  }

  @Get('top')
  @ApiOperation({ summary: 'Get top articles based on views and rating' })
  @ApiQuery({
    name: 'count',
    type: Number,
    required: true,
    description: 'Number of top articles to retrieve',
  })
  @ApiQuery({
    name: 'latest',
    type: Boolean,
    required: false,
    description: 'Whether to sort by latest first',
  })
  @ApiResponse({ status: 200, description: 'List of top articles.' })
  async getTopArticles(
    @Query('count') count: number,
    @Query('latest') latest: boolean,
  ) {
    return await this.articleService.getTopArticles(
      Number(count),
      JSON.parse(latest.toString()),
    );
  }
  @Roles(Role.MODERATOR, Role.ADMIN)
  @Get('moderated')
  @ApiOperation({ summary: 'Get articles pending moderation approval' })
  @ApiResponse({
    status: 200,
    description: 'List of moderated articles awaiting approval.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Only moderators and admins can access.',
  })
  async getModeratedArticles() {
    return this.articleService.getArticlesByStatus('MODERATED');
  }
  @Post(':id/rate')
  @ApiOperation({ summary: 'Rate an article' })
  @ApiParam({ name: 'id', type: String, description: 'Article ID' })
  @ApiBody({ type: RateArticleDto })
  @ApiResponse({ status: 201, description: 'Article rating submitted.' })
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
  @ApiOperation({ summary: 'Retrieve article rating' })
  @ApiParam({ name: 'id', type: String, description: 'Article ID' })
  @ApiResponse({ status: 200, description: 'Article rating data.' })
  async getRateArticle(@Param('id') articleId: string) {
    return this.articleService.getRateArticle(Number(articleId));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve specific article details' })
  @ApiParam({ name: 'id', type: String, description: 'Article ID' })
  @ApiQuery({
    name: 'userId',
    required: false,
    type: String,
    description: 'Optional user ID to track views',
  })
  @ApiResponse({ status: 200, description: 'Article details.' })
  async getArticle(
    @Param('id') articleId: string,
    @Query('userId') userId?: number,
  ) {
    return await this.articleService.getArticle(articleId, Number(userId));
  }

  @Roles(Role.MODERATOR, Role.ADMIN, Role.OWNER)
  @Put(':id')
  @ApiOperation({ summary: 'Update an article' })
  @ApiParam({ name: 'id', type: String, description: 'Article ID' })
  @ApiBody({ type: UpdateArticleDto })
  @ApiResponse({ status: 200, description: 'Article updated successfully.' })
  async updateArticle(
    @Param('id') articleId: string,
    @Body() updateData: UpdateArticleDto,
  ) {
    return await this.articleService.updateArticle(articleId, updateData);
  }

  @Roles(Role.MODERATOR, Role.ADMIN, Role.OWNER)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete an article' })
  @ApiParam({ name: 'id', type: String, description: 'Article ID' })
  @ApiResponse({ status: 200, description: 'Article deleted successfully.' })
  async deleteArticle(@Param('id') articleId: string) {
    return await this.articleService.deleteArticle(articleId);
  }

  @Post(':id/report-scam')
  @ApiOperation({ summary: 'Report an article as a scam' })
  @ApiParam({ name: 'id', type: String, description: 'Article ID' })
  @ApiBody({ type: ReportScamDto })
  @ApiResponse({ status: 201, description: 'Scam report created.' })
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
  @ApiOperation({ summary: 'Get scam reports for an article' })
  @ApiParam({ name: 'id', type: String, description: 'Article ID' })
  @ApiResponse({
    status: 200,
    description: 'List of scam reports for the article.',
  })
  async getScamReports(@Param('id') articleId: string) {
    return this.articleService.getScamReports(Number(articleId));
  }

  @Roles(Role.MODERATOR, Role.ADMIN, Role.OWNER)
  @Delete('scam-report/:reportId')
  @ApiOperation({ summary: 'Remove a specific scam report' })
  @ApiParam({ name: 'reportId', type: Number, description: 'Scam Report ID' })
  @ApiResponse({
    status: 200,
    description: 'Scam report removed successfully.',
  })
  async removeScamReport(@Param('reportId') reportId: number) {
    return this.articleService.removeScamReport(reportId);
  }

  @Roles(Role.MODERATOR, Role.ADMIN, Role.OWNER)
  @Post(':id/restore-version/:versionId')
  @ApiOperation({ summary: 'Restore a specific version of an article' })
  @ApiParam({ name: 'id', type: Number, description: 'Article ID' })
  @ApiParam({
    name: 'versionId',
    type: Number,
    description: 'Version ID to restore',
  })
  @ApiResponse({
    status: 200,
    description: 'Article version restored successfully.',
  })
  async restoreArticleVersion(
    @Param('id') articleId: number,
    @Param('versionId') versionId: number,
  ) {
    return this.articleService.restoreArticleVersion(articleId, versionId);
  }

  @Roles(Role.MODERATOR, Role.ADMIN, Role.OWNER)
  @Put(':id/publish')
  @ApiOperation({
    summary: 'Publish an article by changing its status to PUBLISHED',
  })
  @ApiResponse({ status: 200, description: 'Article has been published.' })
  @ApiResponse({ status: 404, description: 'Article not found.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Only moderators and admins can publish.',
  })
  async publishArticle(@Param('id') articleId: string) {
    return await this.articleService.publishArticle(+articleId);
  }
}
