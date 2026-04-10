import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

// ✅ Custom Parameter Decorator — fonctionne REST + GraphQL
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    // Essayer GraphQL d'abord
    try {
      const gqlCtx = GqlExecutionContext.create(ctx);
      const request = gqlCtx.getContext().req;
      if (request?.user) {
        return data ? request.user[data] : request.user;
      }
    } catch {}

    // Sinon REST
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);