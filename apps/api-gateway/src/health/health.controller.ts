import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/jwt.guard';

// Must be the gateway's own Public decorator, not the one from
// @snapbite/common-guards — JwtAuthGuard reads a different metadata key, and the
// wrong import would silently leave this route behind the token check.
@Public()
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return { status: 'ok', service: 'api-gateway', timestamp: new Date().toISOString() };
  }
}
