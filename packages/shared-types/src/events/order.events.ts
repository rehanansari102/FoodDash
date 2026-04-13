export interface BaseEvent {
  eventId: string;
  eventType: string;
  version: string;
  timestamp: string;
  sourceService: string;
  correlationId: string;
}

export interface OrderPlacedEvent extends BaseEvent {
  eventType: 'order.placed';
  payload: {
    orderId: string;
    userId: string;
    restaurantId: string;
    items: Array<{ menuItemId: string; quantity: number; price: number }>;
    totalAmount: number;
    deliveryAddress: string;
  };
}

export interface OrderConfirmedEvent extends BaseEvent {
  eventType: 'order.confirmed';
  payload: {
    orderId: string;
    userId: string;
    restaurantId: string;
    estimatedPrepTime: number;
  };
}

export interface OrderCancelledEvent extends BaseEvent {
  eventType: 'order.cancelled';
  payload: {
    orderId: string;
    userId: string;
    reason: string;
  };
}

export interface OrderReadyEvent extends BaseEvent {
  eventType: 'order.ready';
  payload: {
    orderId: string;
    restaurantId: string;
    restaurantLocation: { lat: number; lng: number };
  };
}

export interface OrderDeliveredEvent extends BaseEvent {
  eventType: 'order.delivered';
  payload: {
    orderId: string;
    userId: string;
    driverId: string;
  };
}

export type OrderEvent =
  | OrderPlacedEvent
  | OrderConfirmedEvent
  | OrderCancelledEvent
  | OrderReadyEvent
  | OrderDeliveredEvent;
