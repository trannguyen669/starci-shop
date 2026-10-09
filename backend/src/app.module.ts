import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { createTypeOrmOptions } from './data/database/typeorm.options';
import { DbRepository } from './data/db.repository';
import { HealthService } from './domain/health.service';
import { HealthController } from './http/health.controller';
import { ProductController } from './http/product.controller';
import { ProductService } from './domain/product.service';
import { ProductRepository } from './data/product/product.repository';
import { AuthController } from './http/auth.controller';
import { AuthService } from './domain/auth.service';
import { UserRepository } from './data/user/user.repository';
import { loadEnv } from './config/env';
import { JwtStrategy } from './http/jwt.strategy';
import { RolesGuard } from './http/roles.guard';
import { AdminController } from './http/admin.controller';
import { RefreshTokenRepository } from './data/refresh-token/refresh-token.repository';

const env = loadEnv();

@Module({
  imports: [
    TypeOrmModule.forRoot(
      createTypeOrmOptions(),
    ),

    PassportModule,

    JwtModule.register({
      secret: env.JWT_SECRET,

      signOptions: {
        expiresIn: 15 * 60,
      },
    }),
  ],

  controllers: [HealthController, ProductController, AuthController, AdminController],

  providers: [DbRepository, HealthService, ProductService, ProductRepository, UserRepository,RefreshTokenRepository, AuthService, JwtStrategy,RolesGuard],
})
export class AppModule {}
