import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { MailService } from '../mail.service';
import { PaymentService } from '../payment.service';
import { ORDER_EVENTS_QUEUE, NewOrderEmailJob, StatusEmailJob, RefundJob } from './order-events.constants';

@Processor(ORDER_EVENTS_QUEUE)
export class OrderEventsProcessor extends WorkerHost {
  private readonly logger = new Logger(OrderEventsProcessor.name);

  constructor(
    private mailService: MailService,
    private paymentService: PaymentService,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    switch (job.name) {
      case 'new-order-email': {
        const { order } = job.data as NewOrderEmailJob;
        return this.mailService.sendNewOrderToOwner(order);
      }
      case 'status-email': {
        const { order, status } = job.data as StatusEmailJob;
        return this.mailService.sendOrderStatusToCustomer(order, status);
      }
      case 'refund': {
        const { orderId } = job.data as RefundJob;
        return this.paymentService.refundOrder(orderId);
      }
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
    }
  }
}
