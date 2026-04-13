import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Restaurant, RestaurantSchema } from './schemas/restaurant.schema';
import { RestaurantController } from './restaurant.controller';
import { RestaurantService } from './restaurant.service';
import { RedisService } from './redis.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Restaurant.name, schema: RestaurantSchema }]),
  ],
  controllers: [RestaurantController],
  providers: [RestaurantService, RedisService],
})
export class RestaurantModule {}
