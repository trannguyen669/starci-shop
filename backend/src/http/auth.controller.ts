import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';

import type {
  Request,
  Response,
} from 'express';

import type {
  UserRole,
} from '../data/user/user.entity';

import {
  AuthService,
} from '../domain/auth.service';

import {
  JwtAuthGuard,
} from './jwt-auth.guard';

import {
  LoginDto,
} from './login.dto';

import {
  RegisterDto,
} from './register.dto';

// =========================
// Refresh cookie config
// =========================

const REFRESH_COOKIE =
  'refreshToken';

const REFRESH_COOKIE_MAX_AGE =
  7 * 24 * 60 * 60 * 1000;

// =========================
// Request đã xác thực JWT
// =========================

type AuthenticatedRequest =
  Request & {
    user: {
      id: string;
      email: string;
      role: UserRole;
    };
  };

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService:
      AuthService,
  ) {}

  // =========================
  // REGISTER
  // =========================

  @Post('register')
  register(
    @Body()
    dto: RegisterDto,
  ) {
    return this.authService.register(
      dto.email,
      dto.password,
    );
  }

  // =========================
  // LOGIN
  // =========================

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body()
    dto: LoginDto,

    @Res({
      passthrough: true,//cho phép bạn vừa thao tác với response, vừa dùng return để NestJS tự gửi JSON.
    })
    response: Response,
  ) {
    const result =
      await this.authService.login(
        dto.email,
        dto.password,
      );

    // Refresh token không trả
    // trong JSON.
    // Nó được lưu vào httpOnly cookie.
    response.cookie(
      REFRESH_COOKIE,
      result.refreshToken,
      {
        httpOnly: true,//JavaScript frontend không đọc trực tiếp cookie được

        secure://Khi production, cookie chỉ được gửi qua HTTPS
          process.env.NODE_ENV
          === 'production',

        sameSite: 'lax',//Hạn chế gửi cookie trong một số request từ website khác

        path:
          '/api/v1/auth',

        maxAge:
          REFRESH_COOKIE_MAX_AGE,
      },
    );

    return {
      accessToken:
        result.accessToken,

      user:
        result.user,
    };
  }

  // =========================
  // REFRESH
  // =========================

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req()
    request: Request,

    @Res({
      passthrough: true,
    })
    response: Response,
  ) {
    const rawToken =
      request.cookies?.[
        REFRESH_COOKIE
      ];

    if (!rawToken) {
      throw new UnauthorizedException(
        'MISSING_REFRESH_TOKEN',
      );
    }

    const result =
      await this.authService.refresh(
        rawToken,
      );

    // Rotation:
    // cookie RT cũ được thay
    // bằng RT mới.
    response.cookie(
      REFRESH_COOKIE,
      result.refreshToken,
      {
        httpOnly: true,

        secure:
          process.env.NODE_ENV
          === 'production',

        sameSite: 'lax',

        path:
          '/api/v1/auth',

        maxAge:
          REFRESH_COOKIE_MAX_AGE,
      },
    );

    return {
      accessToken:
        result.accessToken,

      user:
        result.user,
    };
  }

  // =========================
  // CURRENT USER
  // =========================

  @Get('me')
  @UseGuards(
    JwtAuthGuard,
  )
  me(
    @Req()
    request:
      AuthenticatedRequest,
  ) {
    return request.user;
  }

  // =========================
  // LOGOUT ALL
  // =========================

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @UseGuards(
    JwtAuthGuard,
  )
  async logoutAll(
    @Req()
    request:
      AuthenticatedRequest,

    @Res({
      passthrough: true,
    })
    response: Response,
  ) {
    await this.authService
      .revokeAllForUser(
        request.user.id,
      );

    response.clearCookie(
      REFRESH_COOKIE,
      {
        path:
          '/api/v1/auth',
      },
    );

    return {
      success: true,
    };
  }
}