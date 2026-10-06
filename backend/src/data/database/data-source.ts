import { DataSource } from 'typeorm';

import { createTypeOrmOptions } from './typeorm.options';

export const AppDataSource = new DataSource(createTypeOrmOptions());