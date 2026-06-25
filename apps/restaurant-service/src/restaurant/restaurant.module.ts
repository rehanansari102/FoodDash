import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Restaurant, RestaurantSchema } from './schemas/restaurant.schema';
import { Review, ReviewSchema } from './schemas/restaurant-review.schema';    
import { RestaurantController } from './restaurant.controller';
import { RestaurantService } from './restaurant.service';
import { RedisService } from './redis.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Restaurant.name, schema: RestaurantSchema },
      { name: Review.name, schema: ReviewSchema }
    ]),
  ],
  controllers: [RestaurantController],
  providers: [RestaurantService, RedisService],
})
export class RestaurantModule {}
