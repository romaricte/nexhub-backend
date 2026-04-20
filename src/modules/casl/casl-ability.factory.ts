import {
  AbilityBuilder, createMongoAbility, MongoAbility,
  InferSubjects, ExtractSubjectType,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { User, UserRole } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { Order } from '../orders/entities/order.entity';

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

type Subjects = InferSubjects<typeof User | typeof Product | typeof Order> | 'all';
export type AppAbility = MongoAbility<[Action, Subjects]>;

// ✅ CASL — Authorization ABAC
@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User) {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

    switch (user.role) {
      case UserRole.SUPER_ADMIN:
        can(Action.Manage, 'all'); // Super admin peut TOUT faire
        break;

      case UserRole.ADMIN:
        can(Action.Manage, 'all');
        cannot(Action.Delete, User, { role: UserRole.SUPER_ADMIN });
        break;

      case UserRole.SELLER:
        can(Action.Read, Product);
        can(Action.Create, Product);
        can(Action.Update, Product, { sellerId: user.id }); // Seulement SES produits
        can(Action.Delete, Product, { sellerId: user.id });
        can(Action.Read, Order, { sellerId: user.id });
        can(Action.Update, Order, { sellerId: user.id });
        can(Action.Read, User, { id: user.id });
        can(Action.Update, User, { id: user.id });
        break;

      case UserRole.BUYER:
        can(Action.Read, Product);
        can(Action.Create, Order);
        can(Action.Read, Order, { buyerId: user.id });
        can(Action.Read, User, { id: user.id });
        can(Action.Update, User, { id: user.id });
        break;

      default:
        can(Action.Read, Product);
        break;
    }

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}