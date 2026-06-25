import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Review {
  @Prop({ required: true }) customerId: string;
  @Prop({ required: true, unique: true }) orderId: string;
  @Prop({ required: true }) restaurantId: string;
  @Prop() title: string;
  @Prop({ required: true }) description: string;
  @Prop({ min: 1, max: 5 , required: true }) rating: number;
}

export type ReviewDocument = Review & Document;
export const ReviewSchema = SchemaFactory.createForClass(Review);

// Index for fast owner lookups
ReviewSchema.index({ customerId: 1 });
ReviewSchema.index({ restaurantId: 1 });
