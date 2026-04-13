import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { UserService } from './user.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AddAddressDto } from './dto/add-address.dto';

// The gateway injects x-user-id and x-user-email headers after JWT verification
interface AuthRequest extends Request {
  headers: Request['headers'] & {
    'x-user-id': string;
    'x-user-email': string;
  };
}

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  getMe(@Req() req: AuthRequest) {
    return this.userService.getOrCreateProfile(
      req.headers['x-user-id'],
      req.headers['x-user-email'],
    );
  }

  @Patch('me')
  updateMe(@Req() req: AuthRequest, @Body() dto: UpdateProfileDto) {
    return this.userService.updateProfile(req.headers['x-user-id'], dto);
  }

  @Post('me/addresses')
  addAddress(@Req() req: AuthRequest, @Body() dto: AddAddressDto) {
    return this.userService.addAddress(req.headers['x-user-id'], dto);
  }

  @Delete('me/addresses/:addressId')
  @HttpCode(HttpStatus.OK)
  removeAddress(@Req() req: AuthRequest, @Param('addressId') addressId: string) {
    return this.userService.removeAddress(req.headers['x-user-id'], addressId);
  }
}
