import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/roles.enum';

@ApiTags('Tags')
@Controller('tags')
@UseGuards(RolesGuard)
export class TagsController {
  constructor(private readonly tagService: TagsService) {}

  @Post()
  @Roles(Role.MODERATOR, Role.ADMIN, Role.OWNER)
  @ApiOperation({ summary: 'Create a new tag' })
  @ApiResponse({ status: 201, description: 'Tag created successfully' })
  @ApiResponse({ status: 400, description: 'Tag name is required' })
  @ApiResponse({ status: 500, description: 'Failed to create tag' })
  async createTag(@Body() tagData: CreateTagDto) {
    return await this.tagService.createTag(tagData);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all tags' })
  @ApiResponse({ status: 200, description: 'Tags retrieved successfully' })
  @ApiResponse({ status: 500, description: 'Failed to retrieve tags' })
  async getAllTags() {
    return await this.tagService.getAllTags();
  }
}
