import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { getLogger } from '../logger';

@Injectable()
export class DbRepository {
  constructor(private readonly dataSource: DataSource) {}

  async ping(): Promise<boolean> {
    getLogger().info('pinging database');

    await this.dataSource.query('SELECT 1');

    return true;
  }
}
