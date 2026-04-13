import type { BaseEvent } from './order.events';

export interface DriverAssignedEvent extends BaseEvent {
  eventType: 'driver.assigned';
  payload: {
    orderId: string;
    driverId: string;
    userId: string;
    estimatedPickupTime: number;
  };
}

export interface DriverLocationUpdatedEvent extends BaseEvent {
  eventType: 'driver.location.updated';
  payload: {
    driverId: string;
    orderId: string | null;
    lat: number;
    lng: number;
  };
}

export interface DriverArrivedEvent extends BaseEvent {
  eventType: 'driver.arrived';
  payload: {
    orderId: string;
    driverId: string;
    restaurantId: string;
  };
}

export type DeliveryEvent =
  | DriverAssignedEvent
  | DriverLocationUpdatedEvent
  | DriverArrivedEvent;
