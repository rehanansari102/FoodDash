import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ConfigService } from "@nestjs/config";
import { Restaurant, RestaurantDocument } from "./schemas/restaurant.schema";
import { CreateRestaurantDto } from "./dto/create-restaurant.dto";
import { UpdateRestaurantDto } from "./dto/update-restaurant.dto";
import { NearbyQueryDto } from "./dto/nearby-query.dto";
import { RedisService } from "./redis.service";
import { CreateReviewDto } from "./dto/create-review.dto";
import { Review, ReviewDocument } from "./schemas/restaurant-review.schema";

@Injectable()
export class RestaurantService {
  private readonly detailTtl: number;
  private readonly nearbyTtl: number;

  constructor(
    @InjectModel(Restaurant.name)
    private restaurantModel: Model<RestaurantDocument>,
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    private redisService: RedisService,
    private configService: ConfigService,
  ) {
    this.detailTtl = Number(
      this.configService.get("RESTAURANT_CACHE_TTL", 600),
    );
    this.nearbyTtl = Number(this.configService.get("NEARBY_CACHE_TTL", 120));
  }

  async create(
    ownerId: string,
    ownerEmail: string,
    dto: CreateRestaurantDto,
  ): Promise<Restaurant> {
    const restaurant = await this.restaurantModel.create({
      ...dto,
      ownerId,
      ownerEmail,
      location: {
        type: "Point",
        coordinates: [dto.lng, dto.lat], // GeoJSON: [longitude, latitude]
      },
    });
    return restaurant.toObject() as unknown as Restaurant;
  }

  async createReview(
    customerId: string,
    restaurantId: string,
    orderId: string,
    dto: CreateReviewDto,
  ) {
    try {
      const restaurant = await this.restaurantModel.findById(restaurantId);
      if (!restaurant) {
        throw new NotFoundException("Restaurant not found");
      }

      await this.verifyOrder(orderId, customerId, restaurantId);

      const existingReview = await this.reviewModel
        .findOne({ orderId, customerId })
        .lean();
      if (existingReview) {
        throw new ForbiddenException("Review for this order already exists");
      }

      const review = await this.reviewModel.create({
        ...dto,
        customerId,
        restaurantId,
        orderId,
      });

      const agg = await this.reviewModel.aggregate([
        { $match: { restaurantId } },
        { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
      ]);

      await this.restaurantModel.findByIdAndUpdate(restaurantId, {
        $set: {
          rating: agg[0]?.avg ?? dto.rating,
          reviewCount: agg[0]?.count ?? 1,
        },
      });
      // Invalidate caches
      await this.redisService.del(`restaurant:detail:${restaurantId}`);
      await this.redisService.del("restaurant:all");
      await this.redisService.del(`restaurant:reviews:${restaurantId}`);

      return review.toObject() as unknown as Review;
    } catch (error: any) {
      if (error?.status) throw error; // rethrow NestJS HTTP exceptions
      throw new Error("Error creating review: " + error?.message);
    }
  }
  private async verifyOrder(
    orderId: string,
    customerId: string,
    restaurantId: string,
  ) {
    const orderServiceUrl = this.configService.get("ORDER_SERVICE_URL");
    const res = await fetch(`${orderServiceUrl}/orders/${orderId}`, {
      headers: {
        'x-user-id': customerId,
        'x-user-role': 'customer',
      },
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new NotFoundException(body?.message ?? 'Order not found');
    }

    const order = await res.json();
    if (order.customerId !== customerId)
      throw new ForbiddenException("Not your order");
    if (order.restaurantId !== restaurantId)
      throw new ForbiddenException("Order is not for this restaurant");
    if (order.status !== "DELIVERED")
      throw new ForbiddenException("Can only review delivered orders");
  }

  async findById(id: string): Promise<Restaurant> {
    const cacheKey = `restaurant:detail:${id}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      console.log(`[Cache HIT] ${cacheKey}`);
      return JSON.parse(cached) as Restaurant;
    }

    console.log(`[Cache MISS] ${cacheKey}`);
    const restaurant = await this.restaurantModel.findById(id).lean();
    if (!restaurant || !restaurant.isApproved || !restaurant.isActive) {
      throw new NotFoundException("Restaurant not found");
    }

    await this.redisService.set(
      cacheKey,
      JSON.stringify(restaurant),
      this.detailTtl,
    );
    return restaurant as unknown as Restaurant;
  }

  async getAllReviews(restaurantId: string): Promise<Review[]> {
    const cacheKey = `restaurant:reviews:${restaurantId}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) return JSON.parse(cached) as Review[];

    const allReviews = await this.reviewModel
      .find({restaurantId})
      .sort({ createdAt: -1 })
      .lean();

    await this.redisService.set(
      cacheKey,
      JSON.stringify(allReviews),
      this.detailTtl,
    );
    return allReviews as unknown as Review[];
  }

   async getMyReviews(customerId: string): Promise<Review[]> {
    const cacheKey = `restaurant:reviews:${customerId}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) return JSON.parse(cached) as Review[];

    const allReviews = await this.reviewModel
      .find({ customerId })
      .sort({ createdAt: -1 })
      .lean();

    await this.redisService.set(
      cacheKey,
      JSON.stringify(allReviews),
      this.detailTtl,
    );
    return allReviews as unknown as Review[];
  }

  async getPendingRestaurants(): Promise<Restaurant[]> {
    return this.restaurantModel
      .find({ isApproved: false, isActive: true })
      .sort({ createdAt: -1 })
      .lean() as unknown as Restaurant[];
  }

  async approveRestaurant(id: string): Promise<Restaurant> {
    const restaurant = await this.restaurantModel.findByIdAndUpdate(
      id,
      { $set: { isApproved: true } },
      { new: true, lean: true },
    );
    if (!restaurant) throw new NotFoundException('Restaurant not found');
    await this.redisService.del('restaurant:all');
    await this.redisService.del(`restaurant:detail:${id}`);
    return restaurant as unknown as Restaurant;
  }

  async search(
    q: string,
    cuisine?: string,
    minRating?: number,
    isOpen?: boolean,
  ): Promise<Restaurant[]> {
    const filter: Record<string, any> = { isActive: true, isApproved: true };
    const hasText = q.trim().length > 0;

    if (hasText) filter.$text = { $search: q.trim() };
    if (cuisine) filter.cuisineTypes = { $regex: cuisine, $options: 'i' };
    if (minRating !== undefined && minRating > 0) filter.rating = { $gte: minRating };
    if (isOpen) filter.isOpen = true;

    const results = await this.restaurantModel
      .find(filter)
      .sort(hasText ? ({ score: { $meta: 'textScore' } } as any) : { rating: -1 })
      .lean()
      .exec();

    return results as unknown as Restaurant[];
  }

  async findAll(): Promise<Restaurant[]> {
    const cacheKey = "restaurant:all";
    const cached = await this.redisService.get(cacheKey);
    if (cached) return JSON.parse(cached) as Restaurant[];

    const restaurants = await this.restaurantModel
      .find({ isActive: true, isApproved: true })
      .sort({ rating: -1 })
      .lean();

    await this.redisService.set(
      cacheKey,
      JSON.stringify(restaurants),
      this.nearbyTtl,
    );
    return restaurants as unknown as Restaurant[];
  }

  async findByOwner(ownerId: string): Promise<Restaurant[]> {
    return this.restaurantModel
      .find({ ownerId })
      .lean() as unknown as Restaurant[];
  }

  async findNearby(query: NearbyQueryDto): Promise<Restaurant[]> {
    const radius = query.radius ?? 5;
    const cacheKey = `restaurant:nearby:${query.lat}:${query.lng}:${radius}`;

    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      console.log(`[Cache HIT] ${cacheKey}`);
      return JSON.parse(cached) as Restaurant[];
    }

    console.log(`[Cache MISS] ${cacheKey}`);

    // $near returns results sorted by distance (closest first) automatically
    const restaurants = await this.restaurantModel
      .find({
        isActive: true,
        isApproved: true,
        isOpen: true,
        location: {
          $near: {
            $geometry: { type: "Point", coordinates: [query.lng, query.lat] },
            $maxDistance: radius * 1000, // convert km to meters
          },
        },
      })
      .lean();

    await this.redisService.set(
      cacheKey,
      JSON.stringify(restaurants),
      this.nearbyTtl,
    );
    return restaurants as unknown as Restaurant[];
  }

  async update(
    id: string,
    ownerId: string,
    dto: UpdateRestaurantDto,
  ): Promise<Restaurant> {
    const restaurant = await this.restaurantModel.findById(id).lean();
    if (!restaurant) throw new NotFoundException("Restaurant not found");
    if ((restaurant as any).ownerId !== ownerId)
      throw new ForbiddenException("Not your restaurant");

    const updated = await this.restaurantModel
      .findByIdAndUpdate(id, { $set: dto }, { new: true, lean: true })
      .exec();

    // Invalidate detail cache
    await this.redisService.del(`restaurant:detail:${id}`);

    return updated as unknown as Restaurant;
  }

  async toggle(id: string, ownerId: string): Promise<{ isOpen: boolean }> {
    const restaurant = await this.restaurantModel.findById(id).lean();
    if (!restaurant) throw new NotFoundException("Restaurant not found");
    if ((restaurant as any).ownerId !== ownerId)
      throw new ForbiddenException("Not your restaurant");

    const updated = await this.restaurantModel
      .findByIdAndUpdate(id, [{ $set: { isOpen: { $not: "$isOpen" } } }], {
        new: true,
        lean: true,
      })
      .exec();

    await this.redisService.del(`restaurant:detail:${id}`);
    return { isOpen: (updated as any).isOpen };
  }

  async setOpeningHours(
    id: string,
    ownerId: string,
    hours: { day: number; open?: string; close?: string; isClosed?: boolean }[],
  ): Promise<Restaurant> {
    const restaurant = await this.restaurantModel.findById(id).lean();
    if (!restaurant) throw new NotFoundException("Restaurant not found");
    if ((restaurant as any).ownerId !== ownerId)
      throw new ForbiddenException("Not your restaurant");

    const updated = await this.restaurantModel
      .findByIdAndUpdate(
        id,
        { $set: { openingHours: hours } },
        { new: true, lean: true },
      )
      .exec();

    await this.redisService.del(`restaurant:detail:${id}`);
    return updated as unknown as Restaurant;
  }
}
