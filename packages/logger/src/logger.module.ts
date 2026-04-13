import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { CorrelationIdMiddleware } from './correlation-id.middleware';

@Module({
  imports: [
    PinoLoggerModule.forRoot({
      pinoHttp: {
        autoLogging: true,
        quietReqLogger: false,
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { colorize: true, singleLine: true } }
            : undefined,
        customProps: (_req, _res) => ({
          service: process.env.SERVICE_NAME ?? 'unknown',
        }),
        serializers: {
          req(req) {
            return {
              method: req.method,
              url: req.url,
              correlationId: req.headers['x-correlation-id'],
            };
          },
        },
      },
    }),
  ],
  exports: [PinoLoggerModule],
})
export class AppLoggerModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
