import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import { Order, OrderSchema } from './schemas/order.schema';
import { PromoCode, PromoCodeSchema } from './schemas/promo-code.schema';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { CartService } from './cart.service';
import { RedisService } from './redis.service';
import { PaymentService } from './payment.service';
import { MailService } from './mail.service';
import { OrderGateway } from './order.gateway';
import { PromoCodeService } from './promo-code.service';
import { ORDER_EVENTS_QUEUE } from './queue/order-events.constants';
import { OrderEventsProcessor } from './queue/order-events.processor';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: PromoCode.name, schema: PromoCodeSchema },
    ]),
    BullModule.forRootAsync({
      useFactory: (config: ConfigService) => {
        const url = new URL(config.getOrThrow('REDIS_URL'));
        return {
          connection: {
            host: url.hostname,
            port: Number(url.port) || 6379,
            username: url.username || undefined,
            password: url.password || undefined,
            // Building the connection field-by-field discards the scheme, so TLS
            // has to be re-derived. Managed Redis (Upstash) requires it; a local
            // redis:// instance must not get it.
            ...(url.protocol === 'rediss:' ? { tls: {} } : {}),
            // BullMQ workers use blocking Redis commands — maxRetriesPerRequest must be null
            maxRetriesPerRequest: null,
          },
        };
      },
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: ORDER_EVENTS_QUEUE,
      defaultJobOptions: {
        attempts: 5,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: { count: 200 },
        removeOnFail: false, // keep failed jobs (all retries exhausted) for inspection
      },
    }),
  ],
  controllers: [OrderController],
  providers: [OrderService, CartService, RedisService, PaymentService, MailService, OrderGateway, PromoCodeService, OrderEventsProcessor],
})
export class OrderModule {}
