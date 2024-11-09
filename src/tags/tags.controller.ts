import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto';
import { ApiTags } from '@nestjs/swagger';
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
  async createTag(@Body() tagData: CreateTagDto) {
    return await this.tagService.createTag(tagData);
  }

  @Get()
  async getAllTags() {
    return await this.tagService.getAllTags();
  }
}
