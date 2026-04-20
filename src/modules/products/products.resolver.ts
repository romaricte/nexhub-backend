import {
  Resolver, Query, Mutation, Args, Int, ID,
  ResolveField, Parent, Subscription, Context,
  ComplexityEstimatorArgs,
} from '@nestjs/graphql';
import { UseGuards, Inject } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Product } from './entities/product.entity';
import { CreateProductInput } from './graphql/create-product.input';
import { ProductsConnection, PaginationArgs } from './graphql/pagination';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { ProductsService } from './products.service';
import * as DataLoader from 'dataloader';

const PRODUCT_ADDED = 'productAdded';

// ✅ GraphQL Code-First Resolver
@Resolver(() => Product)
export class ProductsResolver {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
    private productsService: ProductsService,
    @Inject('PUB_SUB') private pubSub: PubSub,
  ) {}

  // ✅ Query avec pagination & complexité
  @Query(() => ProductsConnection, {
    name: 'products',
    complexity: (options: ComplexityEstimatorArgs) =>
      options.args.first * options.childComplexity,
  })
  async getProducts(
    @Args() pagination: PaginationArgs,
    @Args('search', { nullable: true }) search?: string,
  ) {
    return this.productsService.findAllPaginated(pagination, search);
  }

  @Query(() => Product, { name: 'product' })
  async getProduct(@Args('id', { type: () => ID }) id: string) {
    return this.productsService.findById(id);
  }

  // ✅ Mutation
  @Mutation(() => Product)
  @UseGuards(GqlAuthGuard)
  async createProduct(
    @Args('input') input: CreateProductInput,
    @CurrentUser() user: any,
  ) {
    const product = await this.productsService.create({ ...input, sellerId: user.sub });

    // ✅ Publier pour Subscription
    await this.pubSub.publish(PRODUCT_ADDED, { productAdded: product });

    return product;
  }

  // ✅ Subscription (temps réel via GraphQL)
  @Subscription(() => Product, {
    filter: (payload, variables) => {
      if (variables.categoryId) {
        return payload.productAdded.categoryId === variables.categoryId;
      }
      return true;
    },
  })
  productAdded(
    @Args('categoryId', { nullable: true }) categoryId?: string,
  ) {
    return this.pubSub.asyncIterator(PRODUCT_ADDED);
  }

  // ✅ ResolveField — DataLoader pour éviter N+1
  @ResolveField(() => User)
  async seller(
    @Parent() product: Product,
    @Context('usersLoader') usersLoader: DataLoader<string, User>,
  ) {
    return usersLoader.load(product.sellerId);
  }

  // ✅ ResolveField computed
  @ResolveField(() => Boolean)
  isInStock(@Parent() product: Product) {
    return product.stock > 0;
  }

  @ResolveField(() => Int)
  async reviewCount(@Parent() product: Product) {
    return this.productsService.getReviewCount(product.id);
  }
}