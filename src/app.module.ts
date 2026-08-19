import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { createTypeOrmOptions } from './data/database/typeorm.options';
import { DbRepository } from './data/db.repository';
import { HealthService } from './domain/health.service';
import { HealthController } from './http/health.controller';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => createTypeOrmOptions(),
    }),
  ],

  controllers: [HealthController],

  providers: [DbRepository, HealthService],
})
export class AppModule {}