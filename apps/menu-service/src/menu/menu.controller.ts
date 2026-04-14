import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Req, HttpCode, HttpStatus, ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { MenuService } from './menu.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';

interface AuthRequest extends Request {
  headers: Request['headers'] & {
    'x-user-id': string;
    'x-user-role': string;
  };
}

@Controller('menus')
export class MenuController {
  constructor(private menuService: MenuService) {}

  @Post(':restaurantId/items')
  addItem(
    @Req() req: AuthRequest,
    @Param('restaurantId') restaurantId: string,
    @Body() dto: CreateMenuItemDto,
  ) {
    const role = req.headers['x-user-role'];
    if (role !== 'restaurant_owner' && role !== 'admin') {
      throw new ForbiddenException('Only restaurant owners can manage menus');
    }
    return this.menuService.addItem(restaurantId, dto);
  }

  @Get(':restaurantId')
  getMenu(@Param('restaurantId') restaurantId: string) {
    return this.menuService.getMenu(restaurantId);
  }

  @Patch(':restaurantId/items/:itemId')
  updateItem(
    @Req() req: AuthRequest,
    @Param('restaurantId') restaurantId: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateMenuItemDto,
  ) {
    const role = req.headers['x-user-role'];
    if (role !== 'restaurant_owner' && role !== 'admin') {
      throw new ForbiddenException('Only restaurant owners can manage menus');
    }
    return this.menuService.updateItem(restaurantId, itemId, dto);
  }

  @Delete(':restaurantId/items/:itemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteItem(
    @Req() req: AuthRequest,
    @Param('restaurantId') restaurantId: string,
    @Param('itemId') itemId: string,
  ) {
    const role = req.headers['x-user-role'];
    if (role !== 'restaurant_owner' && role !== 'admin') {
      throw new ForbiddenException('Only restaurant owners can manage menus');
    }
    return this.menuService.deleteItem(restaurantId, itemId);
  }

  @Patch(':restaurantId/items/:itemId/toggle')
  toggleItem(
    @Req() req: AuthRequest,
    @Param('restaurantId') restaurantId: string,
    @Param('itemId') itemId: string,
  ) {
    const role = req.headers['x-user-role'];
    if (role !== 'restaurant_owner' && role !== 'admin') {
      throw new ForbiddenException('Only restaurant owners can manage menus');
    }
    return this.menuService.toggleAvailability(restaurantId, itemId);
  }
}
