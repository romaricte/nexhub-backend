// ✅ CQRS Command
export class CreateProductCommand {
  constructor(
    public readonly name: string,
    public readonly description: string,
    public readonly price: number,
    public readonly stock: number,
    public readonly categoryId: string,
    public readonly sellerId: string,
    public readonly tenantId: string,
  ) {}
}