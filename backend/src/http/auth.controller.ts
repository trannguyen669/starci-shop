import {
  Body,
  Controller,
  Post,
} from '@nestjs/common';

import {
  AuthService,
} from '../domain/auth.service';

import {
  RegisterDto,
} from './register.dto';

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
}