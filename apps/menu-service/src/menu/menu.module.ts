import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MenuItem, MenuItemSchema } from './schemas/menu-item.schema';
import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';
import { RedisService } from './redis.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: MenuItem.name, schema: MenuItemSchema }]),
  ],
  controllers: [MenuController],
  providers: [MenuService, RedisService],
})
export class MenuModule {}
