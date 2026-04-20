import { Injectable, Logger } from '@nestjs/common';
import { Saga, ICommand, ofType } from '@nestjs/cqrs';
import { Observable, delay, map, filter } from 'rxjs';
import { ProductCreatedEvent } from '../events/product-created.event';

// ✅ CQRS Saga — orchestre des side-effects
@Injectable()
export class ProductSaga {
  private readonly logger = new Logger(ProductSaga.name);

  @Saga()
  productCreated = (events$: Observable<any>): Observable<ICommand> => {
    return events$.pipe(
      ofType(ProductCreatedEvent),
      delay(1000),
      map((event: ProductCreatedEvent) => {
        this.logger.log(`Saga: Processing product ${event.productId}`);
        // Retourner une nouvelle Command si nécessaire
        // return new NotifySellerCommand(event.sellerId, event.productId);
        return undefined; // ou null si pas de commande
      }),
      filter(Boolean),
    );
  };
}