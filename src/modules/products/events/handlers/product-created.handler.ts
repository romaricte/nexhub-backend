import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ProductCreatedEvent } from '../product-created.event';

// ✅ CQRS Event Handler
@EventsHandler(ProductCreatedEvent)
export class ProductCreatedHandler implements IEventHandler<ProductCreatedEvent> {
  private readonly logger = new Logger(ProductCreatedHandler.name);

  handle(event: ProductCreatedEvent) {
    this.logger.log(
      `Product created: ${event.name} (${event.productId}) by seller ${event.sellerId}`,
    );
    // Indexer dans Elasticsearch, notifier, etc.
  }
}