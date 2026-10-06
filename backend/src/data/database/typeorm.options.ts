import { DataSourceOptions } from 'typeorm';

import { loadEnv } from '../../config/env';
import { Product } from '../product/product.entity';

export function createTypeOrmOptions(): DataSourceOptions {
  const env = loadEnv();

  return {
    type: 'postgres',
    url: env.DATABASE_URL,

    entities: [Product],

    migrations: [__dirname + '/../migrations/*{.ts,.js}'],

    synchronize: false,

    extra: {
      max: 10,
    },
  };
}