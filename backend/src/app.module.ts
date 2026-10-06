import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { createTypeOrmOptions } from './data/database/typeorm.options';
import { DbRepository } from './data/db.repository';
import { HealthService } from './domain/health.service';
import { HealthController } from './http/health.controller';
import { ProductController } from './http/product.controller';
import { ProductService } from './domain/product.service';
import { ProductRepository } from './data/product/product.repository';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => createTypeOrmOptions(),
    }),
  ],

  controllers: [HealthController, ProductController],

  providers: [DbRepository, HealthService, ProductService, ProductRepository],
})
export class AppModule {}