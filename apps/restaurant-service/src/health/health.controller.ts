import { Controller, Get } from '@nestjs/common';
import { Public } from '@snapbite/common-guards';

@Public()
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return { status: 'ok', service: 'restaurant-service', timestamp: new Date().toISOString() };
  }
}
