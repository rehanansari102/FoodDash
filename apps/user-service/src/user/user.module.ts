import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { RedisService } from './redis.service';
import { UserProfile, UserProfileSchema } from './schemas/user-profile.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: UserProfile.name, schema: UserProfileSchema }])],
  controllers: [UserController],
  providers: [UserService, RedisService],
})
export class UserModule {}
