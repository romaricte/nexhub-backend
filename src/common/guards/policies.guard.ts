import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CaslAbilityFactory, AppAbility } from '../../modules/casl/casl-ability.factory';

export interface IPolicyHandler {
  handle(ability: AppAbility): boolean;
}

export const CHECK_POLICIES_KEY = 'check_policy';
export const CheckPolicies = (...handlers: IPolicyHandler[]) =>
  SetMetadata(CHECK_POLICIES_KEY, handlers);

import { SetMetadata } from '@nestjs/common';

// ✅ Guard basé sur les Policies CASL
@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  canActivate(ctx: ExecutionContext): boolean {
    const policyHandlers =
      this.reflector.get<IPolicyHandler[]>(CHECK_POLICIES_KEY, ctx.getHandler()) || [];

    const { user } = ctx.switchToHttp().getRequest();
    const ability = this.caslAbilityFactory.createForUser(user);

    return policyHandlers.every((handler) => handler.handle(ability));
  }
}