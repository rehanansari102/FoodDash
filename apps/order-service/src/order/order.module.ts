import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './schemas/order.schema';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { CartService } from './cart.service';
import { RedisService } from './redis.service';
import { PaymentService } from './payment.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
  ],
  controllers: [OrderController],
  providers: [OrderService, CartService, RedisService, PaymentService],
})
export class OrderModule {}
