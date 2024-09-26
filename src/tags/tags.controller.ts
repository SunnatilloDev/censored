import { Controller, Post, Get, Body } from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto } from 'src/tags/dto/index';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('Tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagService: TagsService) {}

  @Post()
  async createTag(@Body() tagData: CreateTagDto) {
    return await this.tagService.createTag(tagData);
  }

  @Get()
  async getAllTags() {
    return await this.tagService.getAllTags();
  }
}
