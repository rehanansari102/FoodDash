import { Order, OrderStatus } from '../schemas/order.schema';

export const ORDER_EVENTS_QUEUE = 'order-events';

export type NewOrderEmailJob = { order: Order & { _id: string; ownerEmail?: string; createdAt?: Date } };
export type StatusEmailJob = { order: Order & { _id: string; customerEmail?: string }; status: OrderStatus };
export type RefundJob = { orderId: string };
