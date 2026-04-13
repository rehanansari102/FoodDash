import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserProfileDocument = UserProfile & Document;

@Schema({ _id: false })
export class Address {
  @Prop({ required: true }) id: string;
  @Prop({ required: true }) label: string; // e.g. "Home", "Work"
  @Prop({ required: true }) street: string;
  @Prop({ required: true }) city: string;
  @Prop({ required: true }) country: string;
  @Prop({ required: true }) lat: number;
  @Prop({ required: true }) lng: number;
  @Prop({ default: false }) isDefault: boolean;
}

@Schema({ timestamps: true })
export class UserProfile {
  @Prop({ required: true, unique: true }) userId: string; // matches auth-service User.id

  @Prop({ required: true }) email: string;

  @Prop() firstName: string;

  @Prop() lastName: string;

  @Prop() phone: string;

  @Prop() avatarUrl: string;

  @Prop({ type: [Address], default: [] }) addresses: Address[];

  @Prop({ default: [] }) savedRestaurantIds: string[];
}

export const UserProfileSchema = SchemaFactory.createForClass(UserProfile);
