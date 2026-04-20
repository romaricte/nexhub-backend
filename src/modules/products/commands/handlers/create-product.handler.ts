import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductCommand } from '../create-product.command';
import { Product } from '../../entities/product.entity';
import { ProductCreatedEvent } from '../../events/product-created.event';

// ✅ CQRS Command Handler
@CommandHandler(CreateProductCommand)
export class CreateProductHandler implements ICommandHandler<CreateProductCommand> {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    private eventBus: EventBus,
  ) {}

  async execute(command: CreateProductCommand): Promise<Product> {
    const product = this.productRepo.create({
      name: command.name,
      description: command.description,
      price: command.price,
      stock: command.stock,
      categoryId: command.categoryId,
      sellerId: command.sellerId,
      tenantId: command.tenantId,
    });

    const saved = await this.productRepo.save(product);

    // ✅ Publier un Event après la Command
    this.eventBus.publish(new ProductCreatedEvent(
      saved.id,
      saved.name,
      saved.sellerId,
      saved.price,
    ));

    return saved;
  }
}