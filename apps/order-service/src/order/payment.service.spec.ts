import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { Order, PaymentStatus, PaymentMethod, OrderStatus } from './schemas/order.schema';

// Stripe constructor is called in PaymentService — provide a fake key so it doesn't throw
process.env.STRIPE_SECRET_KEY = 'sk_test_fake_key_for_unit_tests';

const MOCK_ORDER = {
  _id: 'order-1',
  customerId: 'customer-1',
  restaurantId: 'restaurant-1',
  total: 1030,
  paymentStatus: PaymentStatus.UNPAID,
  paymentMethod: PaymentMethod.CARD,
  stripePaymentIntentId: 'pi_test_123',
  status: OrderStatus.PENDING,
};

describe('PaymentService — confirmPayment', () => {
  let service: PaymentService;
  let orderModel: { findById: jest.Mock; findByIdAndUpdate: jest.Mock };
  let stripeRetrieveMock: jest.Mock;

  beforeEach(async () => {
    orderModel = {
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
    };

    stripeRetrieveMock = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        { provide: getModelToken(Order.name), useValue: orderModel },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);

    // Reach into the private stripe instance and mock paymentIntents.retrieve
    (service as any).stripe = {
      paymentIntents: { retrieve: stripeRetrieveMock },
    };
  });

  afterEach(() => jest.resetAllMocks());

  it('throws BadRequestException when the order does not belong to the requesting customer', async () => {
    orderModel.findById.mockReturnValue({ lean: () => ({ ...MOCK_ORDER, customerId: 'real-customer' }) });

    await expect(
      service.confirmPayment('order-1', 'attacker-id', 'pi_test_123'),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws BadRequestException when the paymentIntentId does not match the stored one', async () => {
    orderModel.findById.mockReturnValue({ lean: () => MOCK_ORDER });

    await expect(
      service.confirmPayment('order-1', 'customer-1', 'pi_different_intent'),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws BadRequestException when Stripe metadata orderId does not match', async () => {
    orderModel.findById.mockReturnValue({ lean: () => MOCK_ORDER });
    stripeRetrieveMock.mockResolvedValue({
      id: 'pi_test_123',
      status: 'succeeded',
      metadata: { orderId: 'different-order-id' },
    });

    await expect(
      service.confirmPayment('order-1', 'customer-1', 'pi_test_123'),
    ).rejects.toThrow(BadRequestException);
  });

  it('marks the order as PAID when everything checks out', async () => {
    orderModel.findById.mockReturnValue({ lean: () => MOCK_ORDER });
    stripeRetrieveMock.mockResolvedValue({
      id: 'pi_test_123',
      status: 'succeeded',
      metadata: { orderId: 'order-1' },
    });
    const updated = { ...MOCK_ORDER, paymentStatus: PaymentStatus.PAID };
    orderModel.findByIdAndUpdate.mockReturnValue({ exec: async () => updated });

    const result = await service.confirmPayment('order-1', 'customer-1', 'pi_test_123');

    expect(result.paymentStatus).toBe(PaymentStatus.PAID);
  });

  it('marks the order as FAILED when Stripe reports payment_failed', async () => {
    orderModel.findById.mockReturnValue({ lean: () => MOCK_ORDER });
    stripeRetrieveMock.mockResolvedValue({
      id: 'pi_test_123',
      status: 'payment_failed',
      metadata: { orderId: 'order-1' },
    });
    const updated = { ...MOCK_ORDER, paymentStatus: PaymentStatus.FAILED };
    orderModel.findByIdAndUpdate.mockReturnValue({ exec: async () => updated });

    const result = await service.confirmPayment('order-1', 'customer-1', 'pi_test_123');

    expect(result.paymentStatus).toBe(PaymentStatus.FAILED);
  });

  it('throws NotFoundException when the order does not exist', async () => {
    orderModel.findById.mockReturnValue({ lean: () => null });

    await expect(
      service.confirmPayment('nonexistent', 'customer-1', 'pi_test_123'),
    ).rejects.toThrow(NotFoundException);
  });
});
