import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UpdateUserDto } from './dto';
import { UsersService } from 'src/users/users.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/roles.enum';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  async getOneById(@Param('id') id: string) {
    return await this.usersService.getOneById(Number(id));
  }

  @Get()
  @Roles(Role.MODERATOR, Role.ADMIN, Role.OWNER)
  async getAll() {
    return this.usersService.getAll();
  }
  @Put(':id')
  @UseInterceptors(FileInterceptor('file')) // Interceptor for handling file upload
  async updateOne(
    @Body() body: UpdateUserDto,
    @Param('id') id: string,
    @UploadedFile() file?: Express.Multer.File, // Handle the uploaded file
  ) {
    return await this.usersService.updateOne(Number(id), body, file);
  }

  @Get(':id/subscription')
  async checkSubscription(@Param('id') id: string) {
    return await this.usersService.checkSubscription(Number(id));
  }
}
