// ✅ CQRS Event
export class ProductCreatedEvent {
  constructor(
    public readonly productId: string,
    public readonly name: string,
    public readonly sellerId: string,
    public readonly price: number,
  ) {}
}