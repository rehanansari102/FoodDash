import type { BaseEvent } from './order.events';

export interface PaymentCompletedEvent extends BaseEvent {
  eventType: 'payment.completed';
  payload: {
    paymentId: string;
    orderId: string;
    userId: string;
    amount: number;
    currency: string;
  };
}

export interface PaymentFailedEvent extends BaseEvent {
  eventType: 'payment.failed';
  payload: {
    orderId: string;
    userId: string;
    reason: string;
  };
}

export interface PaymentRefundedEvent extends BaseEvent {
  eventType: 'payment.refunded';
  payload: {
    paymentId: string;
    orderId: string;
    userId: string;
    amount: number;
  };
}

export type PaymentEvent =
  | PaymentCompletedEvent
  | PaymentFailedEvent
  | PaymentRefundedEvent;
