import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { InternalAuthGuard } from '@snapbite/common-guards';
import * as Joi from 'joi';
import { OrderModule } from './order/order.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT:                    Joi.number().default(3005),
        MONGODB_URI:             Joi.string().required(),
        REDIS_URL:               Joi.string().required(),
        STRIPE_SECRET_KEY:       Joi.string().required(),
        STRIPE_WEBHOOK_SECRET:   Joi.string().required(),
        RESTAURANT_SERVICE_URL:  Joi.string().required(),
        AUTH_SERVICE_URL:        Joi.string().required(),
        JWT_SECRET:              Joi.string().required(),
        INTERNAL_API_SECRET:     Joi.string().when('NODE_ENV', {
          is: 'production', then: Joi.required(), otherwise: Joi.optional(),
        }),
        CORS_ORIGIN:             Joi.string().default('http://localhost:3010'),
        BREVO_API_KEY:           Joi.string().required(),
        BREVO_FROM_EMAIL:        Joi.string().email().required(),
        PLATFORM_FEE_PERCENT:    Joi.number().min(0).max(100).default(10),
      }),
      validationOptions: { allowUnknown: true, abortEarly: false },
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow('MONGODB_URI'),
      }),
    }),
    OrderModule,
    HealthModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: InternalAuthGuard }],
})
export class AppModule {}
