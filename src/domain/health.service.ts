import { Injectable } from '@nestjs/common';

import { DbRepository } from '../data/db.repository';
import { getLogger } from '../logger';

@Injectable()
export class HealthService {
  constructor(private readonly repo: DbRepository) {}

  async check(): Promise<{ status: string }> {
    getLogger().info('checking health');

    await this.repo.ping();

    getLogger().info('health check passed');

    return {
      status: 'ok',
    };
  }
}