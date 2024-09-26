import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UpdateUserDto } from 'src/users/dto/index';
import { UsersService } from 'src/users/users.service';
@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get(':id')
  async getOneById(@Param('id') id: string) {
    return await this.usersService.getOneById(Number(id));
  }

  @Put(':id')
  async updateOne(@Body() body: UpdateUserDto, @Param('id') id: string) {
    return await this.usersService.updateOne(Number(id), body);
  }
  @Get(':id/subscription')
  async checkSubscription(@Param('id') id: string) {
    return await this.usersService.checkSubscription(Number(id));
  }
}
