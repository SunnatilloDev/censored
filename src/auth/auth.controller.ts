import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from './decorators/public.decorator';
@ApiTags('Auth')
@Controller('auth')
@ApiBearerAuth('access-token')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Public()
  @Get('telegram/callback')
  async handleTelegramCallback(@Query() query: RegisterDto) {
    const userData = await this.authService.verifyAndRegisterUser(query);

    if (userData.isSubscribed) {
      return {
        message: 'Registration successful!',
        user: userData.user,
        tokens: userData.tokens,
      };
    } else {
      return {
        message:
          'Please subscribe to the Telegram channel to complete registration.',
      };
    }
  }
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refreshToken: { type: 'string', example: 'your_refresh_token' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Returns a new access token' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  @Public()
  @Post('refresh-token')
  async refreshToken(
    @Body('refreshToken') refreshToken: string,
    @Res() res: Response,
  ) {
    const newTokens = await this.authService.refreshAccessToken(refreshToken);

    return { accessToken: newTokens.accessToken };
  }
}
