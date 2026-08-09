import { Controller, Get } from '@nestjs/common';
import { HealthService } from '../domain/health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async check(): Promise<{ status: string }> {
    return this.healthService.check();
  }
}
