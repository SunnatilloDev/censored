import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { UpdateUserDto } from 'src/users/dto/index';
import { UsersService } from 'src/users/users.service';

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
