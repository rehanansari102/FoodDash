import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.register(dto);
    this.setTokenCookies(res, result.accessToken, result.refreshToken);
    return { accessToken: result.accessToken, user: result.user };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto);
    this.setTokenCookies(res, result.accessToken, result.refreshToken);
    return { accessToken: result.accessToken, user: result.user };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.['refresh_token'];
    const result = await this.authService.refresh(refreshToken);
    this.setTokenCookies(res, result.accessToken, result.refreshToken);
    return { accessToken: result.accessToken, user: result.user };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const authHeader = req.headers['authorization'] as string;
    const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : '';
    const userId = (req as Request & { user?: { userId: string } }).user?.userId ?? '';

    await this.authService.logout(userId, accessToken);
    res.clearCookie('refresh_token', COOKIE_OPTIONS);
  }

  private setTokenCookies(res: Response, accessToken: string, refreshToken: string) {
    res.cookie('access_token', accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000,
    });
    res.cookie('refresh_token', refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  // gRPC method — called by API Gateway to verify tokens
  @GrpcMethod('AuthService', 'VerifyToken')
  async verifyToken(data: { token: string }) {
    return this.authService.verifyToken(data.token);
  }
}
