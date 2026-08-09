import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { loadEnv } from './config/env';
import { DbRepository } from './data/db.repository';
import { HealthService } from './domain/health.service';
import { HealthController } from './http/health.controller';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        const env = loadEnv();

        return {
          type: 'postgres',
          url: env.DATABASE_URL,
          autoLoadEntities: true,
          synchronize: true,
        };
      },
    }),
  ],

  controllers: [HealthController],

  providers: [DbRepository, HealthService],
})
export class AppModule {}