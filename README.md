nexhub/
├── docker-compose.yml
├── proto/                          # Fichiers Protobuf (gRPC)
│   ├── notification.proto
│   └── inventory.proto
│
├── apps/
│   ├── api-gateway/                # 🌐 APP PRINCIPALE (REST + GraphQL)
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   │
│   │   │   ├── common/             # 🔧 ÉLÉMENTS TRANSVERSAUX
│   │   │   │   ├── config/
│   │   │   │   │   ├── app.config.ts
│   │   │   │   │   ├── database.config.ts
│   │   │   │   │   ├── redis.config.ts
│   │   │   │   │   ├── jwt.config.ts
│   │   │   │   │   └── config.validation.ts    # Joi schema
│   │   │   │   ├── decorators/
│   │   │   │   │   ├── current-user.decorator.ts
│   │   │   │   │   ├── roles.decorator.ts
│   │   │   │   │   ├── public.decorator.ts
│   │   │   │   │   ├── api-paginated.decorator.ts
│   │   │   │   │   └── tenant.decorator.ts
│   │   │   │   ├── filters/
│   │   │   │   │   ├── http-exception.filter.ts
│   │   │   │   │   ├── all-exceptions.filter.ts
│   │   │   │   │   ├── prisma-exception.filter.ts
│   │   │   │   │   └── ws-exception.filter.ts
│   │   │   │   ├── guards/
│   │   │   │   │   ├── jwt-auth.guard.ts
│   │   │   │   │   ├── roles.guard.ts
│   │   │   │   │   ├── policies.guard.ts       # CASL
│   │   │   │   │   ├── throttle.guard.ts
│   │   │   │   │   ├── ws-auth.guard.ts
│   │   │   │   │   └── api-key.guard.ts
│   │   │   │   ├── interceptors/
│   │   │   │   │   ├── logging.interceptor.ts
│   │   │   │   │   ├── transform.interceptor.ts
│   │   │   │   │   ├── cache.interceptor.ts
│   │   │   │   │   ├── timeout.interceptor.ts
│   │   │   │   │   └── serialize.interceptor.ts
│   │   │   │   ├── middleware/
│   │   │   │   │   ├── logger.middleware.ts
│   │   │   │   │   ├── tenant.middleware.ts
│   │   │   │   │   ├── correlation-id.middleware.ts
│   │   │   │   │   └── raw-body.middleware.ts
│   │   │   │   ├── pipes/
│   │   │   │   │   ├── parse-objectid.pipe.ts
│   │   │   │   │   ├── sharp.pipe.ts           # Image processing
│   │   │   │   │   └── sanitize-html.pipe.ts
│   │   │   │   ├── interfaces/
│   │   │   │   ├── enums/
│   │   │   │   ├── constants/
│   │   │   │   └── utils/
│   │   │   │
│   │   │   ├── modules/
│   │   │   │   ├── auth/            # 🔐 AUTHENTIFICATION
│   │   │   │   │   ├── auth.module.ts
│   │   │   │   │   ├── auth.controller.ts
│   │   │   │   │   ├── auth.service.ts
│   │   │   │   │   ├── auth.resolver.ts        # GraphQL
│   │   │   │   │   ├── strategies/
│   │   │   │   │   │   ├── jwt.strategy.ts
│   │   │   │   │   │   ├── jwt-refresh.strategy.ts
│   │   │   │   │   │   ├── local.strategy.ts
│   │   │   │   │   │   ├── google.strategy.ts
│   │   │   │   │   │   └── github.strategy.ts
│   │   │   │   │   ├── dto/
│   │   │   │   │   ├── guards/
│   │   │   │   │   └── interfaces/
│   │   │   │   │
│   │   │   │   ├── users/           # 👤 UTILISATEURS
│   │   │   │   │   ├── users.module.ts
│   │   │   │   │   ├── users.controller.ts
│   │   │   │   │   ├── users.service.ts
│   │   │   │   │   ├── users.resolver.ts       # GraphQL
│   │   │   │   │   ├── entities/
│   │   │   │   │   │   └── user.entity.ts      # TypeORM
│   │   │   │   │   ├── dto/
│   │   │   │   │   │   ├── create-user.dto.ts
│   │   │   │   │   │   ├── update-user.dto.ts  # PartialType
│   │   │   │   │   │   └── user-response.dto.ts
│   │   │   │   │   ├── graphql/
│   │   │   │   │   │   ├── user.type.ts
│   │   │   │   │   │   └── user.input.ts
│   │   │   │   │   └── subscribers/
│   │   │   │   │       └── user.subscriber.ts  # TypeORM subscriber
│   │   │   │   │
│   │   │   │   ├── tenants/         # 🏢 MULTI-TENANCY
│   │   │   │   │   ├── tenants.module.ts       # Dynamic Module
│   │   │   │   │   ├── tenants.service.ts
│   │   │   │   │   ├── tenant-connection.provider.ts
│   │   │   │   │   └── entities/
│   │   │   │   │
│   │   │   │   ├── products/        # 📦 PRODUITS
│   │   │   │   │   ├── products.module.ts
│   │   │   │   │   ├── products.controller.ts  # REST v1 & v2
│   │   │   │   │   ├── products.service.ts
│   │   │   │   │   ├── products.resolver.ts    # GraphQL
│   │   │   │   │   ├── entities/
│   │   │   │   │   ├── dto/
│   │   │   │   │   ├── commands/               # CQRS
│   │   │   │   │   │   ├── create-product.command.ts
│   │   │   │   │   │   └── handlers/
│   │   │   │   │   ├── queries/                # CQRS
│   │   │   │   │   │   ├── get-products.query.ts
│   │   │   │   │   │   └── handlers/
│   │   │   │   │   ├── events/                 # CQRS
│   │   │   │   │   │   ├── product-created.event.ts
│   │   │   │   │   │   └── handlers/
│   │   │   │   │   └── sagas/                  # CQRS
│   │   │   │   │       └── product.saga.ts
│   │   │   │   │
│   │   │   │   ├── orders/          # 🛒 COMMANDES
│   │   │   │   │   ├── orders.module.ts
│   │   │   │   │   ├── orders.controller.ts
│   │   │   │   │   ├── orders.service.ts
│   │   │   │   │   ├── orders.resolver.ts
│   │   │   │   │   ├── entities/
│   │   │   │   │   ├── dto/
│   │   │   │   │   ├── state-machine/          # Order state management
│   │   │   │   │   └── listeners/
│   │   │   │   │       └── order-created.listener.ts  # EventEmitter
│   │   │   │   │
│   │   │   │   ├── payments/        # 💳 PAIEMENTS
│   │   │   │   │   ├── payments.module.ts
│   │   │   │   │   ├── payments.controller.ts
│   │   │   │   │   ├── payments.service.ts
│   │   │   │   │   ├── stripe.provider.ts      # Custom Provider
│   │   │   │   │   ├── webhooks/
│   │   │   │   │   │   └── stripe-webhook.controller.ts
│   │   │   │   │   └── dto/
│   │   │   │   │
│   │   │   │   ├── search/          # 🔍 RECHERCHE
│   │   │   │   │   ├── search.module.ts        # Dynamic Module
│   │   │   │   │   ├── search.service.ts       # Elasticsearch
│   │   │   │   │   └── search.controller.ts
│   │   │   │   │
│   │   │   │   ├── chat/            # 💬 CHAT TEMPS RÉEL
│   │   │   │   │   ├── chat.module.ts
│   │   │   │   │   ├── chat.gateway.ts         # WebSocket
│   │   │   │   │   ├── chat.service.ts
│   │   │   │   │   └── dto/
│   │   │   │   │
│   │   │   │   ├── notifications/   # 🔔 NOTIFICATIONS
│   │   │   │   │   ├── notifications.module.ts
│   │   │   │   │   ├── notifications.gateway.ts    # WebSocket
│   │   │   │   │   ├── notifications.service.ts
│   │   │   │   │   ├── notifications.controller.ts # SSE endpoint
│   │   │   │   │   ├── processors/
│   │   │   │   │   │   ├── email.processor.ts      # BullMQ
│   │   │   │   │   │   ├── push.processor.ts
│   │   │   │   │   │   └── sms.processor.ts
│   │   │   │   │   └── templates/
│   │   │   │   │
│   │   │   │   ├── files/           # 📁 UPLOAD FICHIERS
│   │   │   │   │   ├── files.module.ts
│   │   │   │   │   ├── files.controller.ts
│   │   │   │   │   ├── files.service.ts        # S3 / local
│   │   │   │   │   └── pipes/
│   │   │   │   │       └── file-validation.pipe.ts
│   │   │   │   │
│   │   │   │   ├── analytics/       # 📊 ANALYTICS
│   │   │   │   │   ├── analytics.module.ts
│   │   │   │   │   ├── analytics.service.ts    # MongoDB
│   │   │   │   │   ├── analytics.controller.ts # SSE
│   │   │   │   │   ├── schemas/
│   │   │   │   │   │   └── event-log.schema.ts # Mongoose
│   │   │   │   │   └── tasks/
│   │   │   │   │       └── analytics.cron.ts   # @Cron()
│   │   │   │   │
│   │   │   │   ├── reviews/         # ⭐ AVIS
│   │   │   │   │   ├── reviews.module.ts
│   │   │   │   │   ├── reviews.controller.ts
│   │   │   │   │   ├── reviews.service.ts
│   │   │   │   │   └── reviews.resolver.ts     # GraphQL
│   │   │   │   │
│   │   │   │   ├── categories/      # 🏷️ CATÉGORIES
│   │   │   │   │
│   │   │   │   ├── mail/            # 📧 EMAIL
│   │   │   │   │   ├── mail.module.ts          # Dynamic Module
│   │   │   │   │   ├── mail.service.ts
│   │   │   │   │   └── templates/
│   │   │   │   │
│   │   │   │   ├── health/          # 🏥 HEALTH CHECKS
│   │   │   │   │   ├── health.module.ts
│   │   │   │   │   └── health.controller.ts    # Terminus
│   │   │   │   │
│   │   │   │   ├── i18n/            # 🌍 INTERNATIONALISATION
│   │   │   │   │   └── i18n.module.ts
│   │   │   │   │
│   │   │   │   └── casl/            # 🛡️ AUTHORIZATION ABAC
│   │   │   │       ├── casl.module.ts
│   │   │   │       ├── casl-ability.factory.ts
│   │   │   │       └── policies/
│   │   │   │
│   │   │   ├── database/
│   │   │   │   ├── database.module.ts
│   │   │   │   ├── migrations/
│   │   │   │   └── seeds/
│   │   │   │
│   │   │   └── graphql/
│   │   │       └── schema.gql               # Auto-generated
│   │   │
│   │   └── test/
│   │       ├── app.e2e-spec.ts
│   │       ├── auth.e2e-spec.ts
│   │       └── products.e2e-spec.ts
│   │
│   ├── inventory-microservice/      # 📦 MICROSERVICE INVENTAIRE
│   │   ├── src/
│   │   │   ├── main.ts             # gRPC transport
│   │   │   ├── inventory.module.ts
│   │   │   ├── inventory.controller.ts
│   │   │   └── inventory.service.ts
│   │   └── test/
│   │
│   ├── notification-microservice/   # 🔔 MICROSERVICE NOTIFICATIONS
│   │   ├── src/
│   │   │   ├── main.ts             # RabbitMQ transport
│   │   │   ├── notification.module.ts
│   │   │   ├── notification.controller.ts
│   │   │   └── notification.service.ts
│   │   └── test/
│   │
│   └── analytics-microservice/      # 📊 MICROSERVICE ANALYTICS
│       ├── src/
│       │   ├── main.ts             # Redis transport
│       │   ├── analytics.module.ts
│       │   └── analytics.service.ts
│       └── test/
│
├── libs/                            # 📚 SHARED LIBRARIES
│   ├── common/
│   │   ├── src/
│   │   │   ├── dto/
│   │   │   ├── interfaces/
│   │   │   ├── enums/
│   │   │   └── constants/
│   ├── database/
│   │   └── src/
│   └── auth/
│       └── src/
│
├── .env
├── .env.test
├── nest-cli.json                   # Monorepo config
├── tsconfig.json
└── README.md