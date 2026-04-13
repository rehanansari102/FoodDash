import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { MenuItem, MenuItemDocument } from './schemas/menu-item.schema';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { RedisService } from './redis.service';

@Injectable()
export class MenuService {
  private readonly cacheTtl: number;

  constructor(
    @InjectModel(MenuItem.name) private menuItemModel: Model<MenuItemDocument>,
    private redisService: RedisService,
    private configService: ConfigService,
  ) {
    this.cacheTtl = Number(this.configService.get('MENU_CACHE_TTL', 600));
  }

  async addItem(restaurantId: string, dto: CreateMenuItemDto): Promise<MenuItem> {
    const item = await this.menuItemModel.create({ ...dto, restaurantId });
    // Invalidate menu cache for this restaurant
    await this.redisService.del(`menu:${restaurantId}`);
    return item.toObject() as unknown as MenuItem;
  }

  async getMenu(restaurantId: string): Promise<MenuItem[]> {
    const cacheKey = `menu:${restaurantId}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      console.log(`[Cache HIT] ${cacheKey}`);
      return JSON.parse(cached) as MenuItem[];
    }

    console.log(`[Cache MISS] ${cacheKey}`);
    const items = await this.menuItemModel
      .find({ restaurantId, isAvailable: true })
      .lean();

    await this.redisService.set(cacheKey, JSON.stringify(items), this.cacheTtl);
    return items as unknown as MenuItem[];
  }

  async updateItem(restaurantId: string, itemId: string, dto: UpdateMenuItemDto): Promise<MenuItem> {
    const item = await this.menuItemModel
      .findOneAndUpdate({ _id: itemId, restaurantId }, { $set: dto }, { new: true, lean: true })
      .exec();
    if (!item) throw new NotFoundException('Menu item not found');

    // Invalidate menu cache — prices/availability changed
    await this.redisService.del(`menu:${restaurantId}`);
    return item as unknown as MenuItem;
  }

  async deleteItem(restaurantId: string, itemId: string): Promise<void> {
    const result = await this.menuItemModel.deleteOne({ _id: itemId, restaurantId });
    if (result.deletedCount === 0) throw new NotFoundException('Menu item not found');

    await this.redisService.del(`menu:${restaurantId}`);
  }
}
