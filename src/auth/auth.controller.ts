import { Controller, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('telegram/callback')
  async handleTelegramCallback(@Query() query: RegisterDto) {
    const userData = await this.authService.verifyAndRegisterUser(query);

    if (userData.isSubscribed) {
      return { message: 'Registration successful!', user: userData, tokens: userData.tokens };
    } else {
      return {
        message:
          'Please subscribe to the Telegram channel to complete registration.',
      };
    }
  }
}
