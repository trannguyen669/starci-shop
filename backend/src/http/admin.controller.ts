import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';

import {
  JwtAuthGuard,
} from './jwt-auth.guard';

import {
  Roles,
} from './roles.decorator';

import {
  RolesGuard,
} from './roles.guard';

@Controller('admin')
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
export class AdminController {
  @Get('stats')
  @Roles('admin')
  stats() {
    return {
      message:
        'Admin access granted',
    };
  }
}