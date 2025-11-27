import type { OpenAPIV3 } from 'openapi-types';

const defaultServerUrl =
  process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

const withSuccessFlag = (
  dataSchema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject,
): OpenAPIV3.SchemaObject => ({
  type: 'object',
  properties: {
    success: { type: 'boolean', example: true },
    data: dataSchema,
  },
});

export const apiSpec: OpenAPIV3.Document = {
  openapi: '3.0.3',
  info: {
    title: 'Grindcycle API',
    version: '1.0.0',
    description:
      'Documentation des routes REST internes utilisées par le front-office Grindcycle. Toutes les routes sont servies depuis les handlers App Router de Next.js.',
    contact: {
      name: 'Equipe Grindcycle',
      email: 'hellogrindcycle@gmail.com',
    },
  },
  servers: [
    {
      url: defaultServerUrl,
      description: 'URL courante (NEXT_PUBLIC_URL)',
    },
    {
      url: 'http://localhost:3000',
      description: 'Développement local',
    },
  ],
  tags: [
    { name: 'Produits' },
    { name: 'Favoris' },
    { name: 'Notifications' },
    { name: 'Commandes' },
    { name: 'Points' },
    { name: 'Planches recyclées' },
    { name: 'Utilisateurs' },
  ],
  components: {
    securitySchemes: {
      betterAuthSession: {
        type: 'apiKey',
        in: 'cookie',
        name: 'better-auth.session_token',
        description:
          "Cookie de session Better Auth. Les routes protégées utilisent l'en-tête Cookie transmis par Next.js.",
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        required: ['error'],
        properties: {
          success: { type: 'boolean', example: false },
          error: { type: 'string' },
        },
      },
      PaginationMeta: {
        type: 'object',
        properties: {
          currentPage: { type: 'integer', example: 1 },
          totalPages: { type: 'integer', example: 3 },
          totalItems: { type: 'integer', example: 52 },
          itemsPerPage: { type: 'integer', example: 20 },
          hasNextPage: { type: 'boolean' },
          hasPreviousPage: { type: 'boolean' },
        },
      },
      Product: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          description: { type: 'string', nullable: true },
          type: {
            type: 'string',
            enum: ['SKATE', 'CRUISER', 'LONG'],
          },
          priceEuro: { type: 'number' },
          pricePoints: { type: 'integer' },
          imageUrl: {
            type: 'array',
            items: { type: 'string', format: 'uri' },
          },
          status: {
            type: 'string',
            enum: ['CATALOG', 'SOLD', 'SHIPPED', 'DELIVERED'],
          },
          usedBoardId: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Favorite: {
        type: 'object',
        properties: {
          userId: { type: 'string', format: 'uuid' },
          productId: { type: 'string', format: 'uuid' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          product: { $ref: '#/components/schemas/Product' },
        },
      },
      Notification: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          userId: { type: 'string', format: 'uuid', nullable: true },
          target: { type: 'string', enum: ['USER', 'ADMIN'] },
          description: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Order: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          userId: { type: 'string', format: 'uuid', nullable: true },
          totalAmount: { type: 'number' },
          shippingCost: { type: 'number' },
          paymentType: { type: 'string', enum: ['EURO', 'POINTS'] },
          pointsUsed: { type: 'integer', nullable: true },
          status: {
            type: 'string',
            enum: ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
          },
          shippingAddress: { type: 'string' },
          shippingCity: { type: 'string' },
          shippingPostalCode: { type: 'string' },
          shippingCountry: { type: 'string' },
          shippingPhone: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      PointsHistory: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          userId: { type: 'string', format: 'uuid' },
          usedBoardId: { type: 'string', format: 'uuid', nullable: true },
          type: {
            type: 'string',
            enum: ['PURCHASE', 'RECYCLING', 'ADJUSTMENT_RECYCLING'],
          },
          pointsAmount: { type: 'integer' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      UsedBoard: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          userId: { type: 'string', format: 'uuid', nullable: true },
          status: {
            type: 'string',
            enum: [
              'PENDING_VALIDATION',
              'VALIDATED',
              'REJECTED',
              'SENT',
              'RECEIVED',
              'RECYCLED_TO_PRODUCT',
              'SOLD',
            ],
          },
          boardType: { type: 'string', enum: ['SKATE', 'CRUISER', 'LONG'] },
          boardCondition: {
            type: 'string',
            enum: ['GOOD', 'AVERAGE', 'BAD'],
            nullable: true,
          },
          description: { type: 'string', nullable: true },
          image: {
            type: 'array',
            items: { type: 'string', format: 'uri' },
          },
          pointsAwarded: { type: 'integer', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          role: { type: 'string', enum: ['USER', 'ADMIN'] },
          points: { type: 'integer' },
          image: {
            type: 'array',
            items: { type: 'string', format: 'uri' },
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      PaginatedProducts: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/Product' },
          },
          meta: { $ref: '#/components/schemas/PaginationMeta' },
        },
      },
      PaginatedFavorites: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/Favorite' },
          },
          meta: { $ref: '#/components/schemas/PaginationMeta' },
        },
      },
      PaginatedNotifications: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/Notification' },
          },
          meta: { $ref: '#/components/schemas/PaginationMeta' },
        },
      },
      PaginatedOrders: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/Order' },
          },
          meta: { $ref: '#/components/schemas/PaginationMeta' },
        },
      },
      PaginatedPointsHistory: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/PointsHistory' },
          },
          meta: { $ref: '#/components/schemas/PaginationMeta' },
        },
      },
      PaginatedUsedBoards: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/UsedBoard' },
          },
          meta: { $ref: '#/components/schemas/PaginationMeta' },
        },
      },
      PaginatedUsers: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/User' },
          },
          meta: { $ref: '#/components/schemas/PaginationMeta' },
        },
      },
      FavoriteFlag: {
        type: 'object',
        properties: {
          isFavorite: { type: 'boolean' },
        },
      },
    },
  },
  paths: {
    '/api/products': {
      get: {
        tags: ['Produits'],
        summary: 'Lister les produits ou récupérer un produit précis',
        description:
          'Retourne un produit unique (`id`), une sélection (`latest`), les produits disponibles (`available=true`) ou l’intégralité du catalogue (`admin=true`).',
        parameters: [
          {
            name: 'id',
            in: 'query',
            schema: { type: 'string', format: 'uuid' },
            description: 'Identifiant du produit à récupérer.',
          },
          {
            name: 'latest',
            in: 'query',
            schema: { type: 'integer', minimum: 1 },
            description: 'Nombre de produits les plus récents à retourner.',
          },
          {
            name: 'available',
            in: 'query',
            schema: { type: 'string', enum: ['true'] },
            description:
              'Filtre pour les produits disponibles côté boutique (retour paginé).',
          },
          {
            name: 'admin',
            in: 'query',
            schema: { type: 'string', enum: ['true'] },
            description:
              'Retourne l’ensemble du catalogue (protégé côté interface).',
          },
          {
            name: 'minPrice',
            in: 'query',
            schema: { type: 'number', minimum: 0 },
          },
          {
            name: 'maxPrice',
            in: 'query',
            schema: { type: 'number', minimum: 0 },
          },
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', minimum: 1 },
            description: 'Page courante pour les réponses paginées.',
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 50 },
            description: 'Taille de page pour les réponses paginées.',
          },
        ],
        responses: {
          200: {
            description: 'Produits retournés avec succès.',
            content: {
              'application/json': {
                schema: {
                  oneOf: [
                    withSuccessFlag({ $ref: '#/components/schemas/Product' }),
                    withSuccessFlag({
                      type: 'array',
                      items: { $ref: '#/components/schemas/Product' },
                    }),
                    { $ref: '#/components/schemas/PaginatedProducts' },
                  ],
                },
              },
            },
          },
          400: {
            description: 'Paramètre requis manquant ou invalide.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'Produit introuvable.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          500: {
            description: 'Erreur interne.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/favorites': {
      get: {
        tags: ['Favoris'],
        summary: 'Lister ou vérifier les favoris d’un utilisateur',
        description:
          'Nécessite une session Better Auth. Retourne soit un booléen (`productId`) soit une liste paginée.',
        security: [{ betterAuthSession: [] }],
        parameters: [
          {
            name: 'userId',
            in: 'query',
            schema: { type: 'string', format: 'uuid' },
            description:
              'Identifiant utilisateur ciblé (admin uniquement si différent de la session).',
          },
          {
            name: 'productId',
            in: 'query',
            schema: { type: 'string', format: 'uuid' },
            description:
              'Si présent, vérifie si le produit est dans les favoris.',
          },
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', minimum: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 50 },
          },
        ],
        responses: {
          200: {
            description: 'Résultat obtenu.',
            content: {
              'application/json': {
                schema: {
                  oneOf: [
                    withSuccessFlag({ $ref: '#/components/schemas/FavoriteFlag' }),
                    {
                      allOf: [
                        { type: 'object', properties: { success: { type: 'boolean' } } },
                        { $ref: '#/components/schemas/PaginatedFavorites' },
                      ],
                    },
                  ],
                },
              },
            },
          },
          401: {
            description: 'Session requise.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          403: {
            description: 'Accès refusé.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/notifications': {
      get: {
        tags: ['Notifications'],
        summary: 'Lister les notifications utilisateur ou admin',
        security: [{ betterAuthSession: [] }],
        parameters: [
          {
            name: 'userId',
            in: 'query',
            schema: { type: 'string', format: 'uuid' },
            description:
              'Requis pour récupérer les notifications utilisateur (sauf session courante).',
          },
          {
            name: 'type',
            in: 'query',
            schema: { type: 'string', enum: ['admin'] },
            description:
              'Utiliser `admin` pour récupérer les messages destinés au staff.',
          },
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', minimum: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 50 },
          },
        ],
        responses: {
          200: {
            description: 'Notifications retournées.',
            content: {
              'application/json': {
                schema: {
                  oneOf: [
                    withSuccessFlag({
                      type: 'array',
                      items: { $ref: '#/components/schemas/Notification' },
                    }),
                    { $ref: '#/components/schemas/PaginatedNotifications' },
                  ],
                },
              },
            },
          },
          400: {
            description: 'Paramètre manquant.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          401: {
            description: 'Session requise.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          403: {
            description: 'Accès refusé.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/orders': {
      get: {
        tags: ['Commandes'],
        summary: 'Lister ou récupérer les commandes',
        security: [{ betterAuthSession: [] }],
        parameters: [
          {
            name: 'id',
            in: 'query',
            schema: { type: 'string', format: 'uuid' },
            description: 'Commande ciblée (vérifie la propriété).',
          },
          {
            name: 'userId',
            in: 'query',
            schema: { type: 'string', format: 'uuid' },
            description: 'Lister les commandes d’un utilisateur précis (admin).',
          },
          {
            name: 'admin',
            in: 'query',
            schema: { type: 'string', enum: ['true'] },
            description: 'Accéder à toutes les commandes (admin).',
          },
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', minimum: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 50 },
          },
        ],
        responses: {
          200: {
            description: 'Commandes retournées.',
            content: {
              'application/json': {
                schema: {
                  oneOf: [
                    withSuccessFlag({ $ref: '#/components/schemas/Order' }),
                    withSuccessFlag({
                      type: 'array',
                      items: { $ref: '#/components/schemas/Order' },
                    }),
                    { $ref: '#/components/schemas/PaginatedOrders' },
                  ],
                },
              },
            },
          },
          401: {
            description: 'Session requise.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          403: {
            description: 'Accès refusé.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/pointshistory': {
      get: {
        tags: ['Points'],
        summary: 'Consulter l’historique des points',
        security: [{ betterAuthSession: [] }],
        parameters: [
          {
            name: 'userId',
            in: 'query',
            schema: { type: 'string', format: 'uuid' },
            description: 'Filtrer sur un utilisateur (admin).',
          },
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', minimum: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 50 },
          },
        ],
        responses: {
          200: {
            description: 'Historique retourné.',
            content: {
              'application/json': {
                schema: {
                  oneOf: [
                    withSuccessFlag({
                      type: 'array',
                      items: { $ref: '#/components/schemas/PointsHistory' },
                    }),
                    { $ref: '#/components/schemas/PaginatedPointsHistory' },
                  ],
                },
              },
            },
          },
          401: {
            description: 'Session requise.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          403: {
            description: 'Accès refusé.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/usedboards': {
      get: {
        tags: ['Planches recyclées'],
        summary: 'Consulter les planches recyclées',
        security: [{ betterAuthSession: [] }],
        parameters: [
          {
            name: 'id',
            in: 'query',
            schema: { type: 'string', format: 'uuid' },
            description: 'Identifiant de la planche.',
          },
          {
            name: 'userId',
            in: 'query',
            schema: { type: 'string', format: 'uuid' },
            description: 'Lister les planches d’un utilisateur (admin).',
          },
          {
            name: 'admin',
            in: 'query',
            schema: { type: 'string', enum: ['true'] },
            description: 'Accès étendu aux planches.',
          },
          {
            name: 'available',
            in: 'query',
            schema: { type: 'string', enum: ['true'] },
            description:
              'Quand admin vaut true, ne retourner que les planches disponibles.',
          },
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', minimum: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 50 },
          },
        ],
        responses: {
          200: {
            description: 'Planches retournées.',
            content: {
              'application/json': {
                schema: {
                  oneOf: [
                    withSuccessFlag({ $ref: '#/components/schemas/UsedBoard' }),
                    withSuccessFlag({
                      type: 'array',
                      items: { $ref: '#/components/schemas/UsedBoard' },
                    }),
                    { $ref: '#/components/schemas/PaginatedUsedBoards' },
                  ],
                },
              },
            },
          },
          401: {
            description: 'Session requise.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          403: {
            description: 'Accès refusé.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/users': {
      get: {
        tags: ['Utilisateurs'],
        summary: 'Récupérer le profil ou la liste des utilisateurs',
        security: [{ betterAuthSession: [] }],
        parameters: [
          {
            name: 'id',
            in: 'query',
            schema: { type: 'string', format: 'uuid' },
            description:
              'Récupérer un utilisateur spécifique (lui-même ou admin).',
          },
          {
            name: 'admin',
            in: 'query',
            schema: { type: 'string', enum: ['true'] },
            description: 'Lister tous les utilisateurs (admin).',
          },
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', minimum: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 50 },
          },
        ],
        responses: {
          200: {
            description: 'Utilisateur ou liste retournée.',
            content: {
              'application/json': {
                schema: {
                  oneOf: [
                    withSuccessFlag({ $ref: '#/components/schemas/User' }),
                    withSuccessFlag({
                      type: 'array',
                      items: { $ref: '#/components/schemas/User' },
                    }),
                    { $ref: '#/components/schemas/PaginatedUsers' },
                  ],
                },
              },
            },
          },
          401: {
            description: 'Session requise.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          403: {
            description: 'Accès refusé.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
  },
};

export type GrindcycleApiSpec = typeof apiSpec;

