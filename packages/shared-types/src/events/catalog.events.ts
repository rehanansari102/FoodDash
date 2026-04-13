import { BaseEvent } from './order.events';

export interface RestaurantCreatedEvent extends BaseEvent {
  eventType: 'restaurant.created';
  payload: {
    restaurantId: string;
    ownerId: string;
    name: string;
    cuisineTypes: string[];
    location: { lat: number; lng: number };
    address: { street: string; city: string; country: string };
  };
}

export interface RestaurantUpdatedEvent extends BaseEvent {
  eventType: 'restaurant.updated';
  payload: {
    restaurantId: string;
    name?: string;
    cuisineTypes?: string[];
    isOpen?: boolean;
  };
}

export interface MenuItemCreatedEvent extends BaseEvent {
  eventType: 'menu.item.created';
  payload: {
    itemId: string;
    restaurantId: string;
    name: string;
    price: number;
    category: string;
  };
}

export interface MenuItemUpdatedEvent extends BaseEvent {
  eventType: 'menu.item.updated';
  payload: {
    itemId: string;
    restaurantId: string;
    name?: string;
    price?: number;
    isAvailable?: boolean;
  };
}

export type CatalogEvent =
  | RestaurantCreatedEvent
  | RestaurantUpdatedEvent
  | MenuItemCreatedEvent
  | MenuItemUpdatedEvent;
