import { Controller, Get } from '@nestjs/common';
import { Public } from './auth/decorators/public.decorator';
@Controller('/')
export class AppController {
  @Get()
  @Public()
  app() {
    return 'This is backend for crypto article project';
  }
}
