import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class MenuItem {
  @Prop({ required: true, index: true }) restaurantId: string;
  @Prop({ required: true }) name: string;
  @Prop() description: string;
  @Prop({ required: true, min: 0 }) price: number;
  @Prop({ required: true }) category: string;
  @Prop() imageUrl: string;
  @Prop({ default: true }) isAvailable: boolean;
}

export type MenuItemDocument = MenuItem & Document;
export const MenuItemSchema = SchemaFactory.createForClass(MenuItem);
