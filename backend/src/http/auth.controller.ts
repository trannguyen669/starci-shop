import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  Request,
} from 'express';

import {
  AuthService,
} from '../domain/auth.service';

import {
  RegisterDto,
} from './register.dto';

import {
  LoginDto,
} from './login.dto';

import { JwtAuthGuard } from './jwt-auth.guard';

type AuthenticatedRequest = Request & {
  user: {
    id: string;
    email: string;
  };
};

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  register(
    @Body() dto: RegisterDto,
  ) {
    return this.authService.register(
      dto.email,
      dto.password,
    );
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(
    @Body() dto: LoginDto,
  ) {
    return this.authService.login(
      dto.email,
      dto.password,
    );
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(
    @Req() request: AuthenticatedRequest,
  ) {
    return request.user;
  }
}
