import {
  Controller, Post, Body, UseGuards, Req, Res,
  Get, HttpCode, HttpStatus, Version,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Response, Request } from 'express';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public() // ✅ Custom decorator
  @Post('register')
  @Throttle({ short: { ttl: 60000, limit: 5 } }) // ✅ Rate limiting spécifique
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  async register(@Body() dto: CreateUserDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('local')) // ✅ Passport local strategy
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto.email, dto.password);

    // ✅ Set refresh token in HTTP-only cookie
    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return { accessToken: result.accessToken, user: result.user };
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard) // ✅ Custom Guard
  @HttpCode(HttpStatus.OK)
  async refresh(@CurrentUser() user: any) {
    return this.authService.refreshTokens(user.sub, user.refreshToken);
  }

  @Post('logout')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentUser() user: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(user.sub);
    res.clearCookie('refresh_token');
    return { message: 'Logged out successfully' };
  }

  // ✅ OAuth2 Google
  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {}

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req, @Res() res: Response) {
    const tokens = await this.authService.validateOAuthLogin(req.user, 'google');
    res.redirect(`http://localhost:3000/auth/callback?token=${tokens.accessToken}`);
  }

  // ✅ OAuth2 GitHub
  @Public()
  @Get('github')
  @UseGuards(AuthGuard('github'))
  githubLogin() {}

  @Public()
  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubCallback(@Req() req, @Res() res: Response) {
    const tokens = await this.authService.validateOAuthLogin(req.user, 'github');
    res.redirect(`http://localhost:3000/auth/callback?token=${tokens.accessToken}`);
  }

  // ✅ API Versioning - v2
  @Version('2')
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async loginV2(@Body() dto: LoginDto) {
    // Version 2 avec des réponses différentes
    const result = await this.authService.login(dto.email, dto.password);
    return {
      data: { accessToken: result.accessToken, user: result.user },
      meta: { version: 2, timestamp: new Date() },
    };
  }
}