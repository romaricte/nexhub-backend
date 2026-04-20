import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ProductsResolver } from './products.resolver';

import { CreateProductHandler } from './commands/handlers/create-product.handler';
import { UpdateProductHandler } from './commands/handlers/update-product.handler';
import { DeleteProductHandler } from './commands/handlers/delete-product.handler';
import { GetProductsHandler } from './queries/handlers/get-products.handler';
import { GetProductByIdHandler } from './queries/handlers/get-product-by-id.handler';
import { ProductCreatedHandler } from './events/handlers/product-created.handler';
import { ProductUpdatedHandler } from './events/handlers/product-updated.handler';
import { ProductSaga } from './sagas/product.saga';

const CommandHandlers = [CreateProductHandler, UpdateProductHandler, DeleteProductHandler];
const QueryHandlers = [GetProductsHandler, GetProductByIdHandler];
const EventHandlers = [ProductCreatedHandler, ProductUpdatedHandler];

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductImage]),
    CqrsModule, // ✅ CQRS Module
  ],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    ProductsResolver,
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
    ProductSaga,
  ],
  exports: [ProductsService],
})
export class ProductsModule {}