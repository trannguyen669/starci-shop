import { Injectable } from '@nestjs/common';
import { DbRepository } from '../data/db.repository';

@Injectable()
export class HealthService {
  constructor(private readonly repo: DbRepository) {}

  async check(): Promise<{ status: string }> {
    await this.repo.ping();

    return {
      status: 'ok',
    };
  }
}