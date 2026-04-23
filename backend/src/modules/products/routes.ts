import { adminAuthorization } from '../../middleware/adminAuthAuthorization.ts'
import { FastifyTypedInstance } from '../../types/fastify.ts'
import { z } from 'zod'
import { postProductsController } from './postProducts.ts'
import { getProductsController } from './getProducts.ts'
import { getProductByIdController } from './getProductById.ts'
import { getProductsByCategoryController } from './getProductsByCategory.ts'
import { searchProductsController } from './searchProducts.ts'
import { putProductsController } from './putProducts.ts'
import { patchProductStatusController } from './patchProductStatus.ts'
import { deleteProductsController } from './deleteProducts.ts'

// Schema reutilizável do produto
const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  basePrice: z.number(),
  imageUrl: z.string().nullable(),
  isActive: z.boolean(),
  categoryId: z.string(),
  createdAt: z.date(),
})

export async function productsRoutes(app: FastifyTypedInstance) {
  // ─── GET /products ──────────────────────────────────────────────────────────
  app.get(
    '/',
    {
      schema: {
        tags: ['Products'],
        description: 'Retorna a lista de produtos ativos',
        response: {
          200: z.object({
            message: z.string(),
            products: z.array(
              productSchema.extend({
                category: z.object({ id: z.string(), name: z.string() }),
              }),
            ),
          }),
        },
      },
    },
    getProductsController,
  )

  // ─── GET /products/search?q= ────────────────────────────────────────────────
  // Deve ser declarada antes de /:id para evitar conflito
  app.get(
    '/search',
    {
      schema: {
        tags: ['Products'],
        description: 'Busca produtos por nome',
        querystring: z.object({
          q: z.string(),
        }),
        response: {
          200: z.object({
            message: z.string(),
            products: z.array(
              productSchema.extend({
                category: z.object({ id: z.string(), name: z.string() }),
              }),
            ),
          }),
          400: z.object({ message: z.string() }),
        },
      },
    },
    searchProductsController,
  )

  // ─── GET /products/category/:categoryId ────────────────────────────────────
  app.get(
    '/category/:categoryId',
    {
      schema: {
        tags: ['Products'],
        description: 'Retorna produtos de uma categoria',
        params: z.object({
          categoryId: z.string(),
        }),
        response: {
          200: z.object({
            message: z.string(),
            products: z.array(productSchema),
          }),
          404: z.object({ message: z.string() }),
        },
      },
    },
    getProductsByCategoryController,
  )

  // ─── GET /products/:id ──────────────────────────────────────────────────────
  app.get(
    '/:id',
    {
      schema: {
        tags: ['Products'],
        description: 'Retorna detalhes de um produto com tamanhos',
        params: z.object({
          id: z.string(),
        }),
        response: {
          200: z.object({
            message: z.string(),
            product: z.object({
              id: z.string(),
              name: z.string(),
              description: z.string().nullable(),
              basePrice: z.number(),
              imageUrl: z.string().nullable(),
              isActive: z.boolean(),
              category: z.object({ id: z.string(), name: z.string() }),
              sizes: z.array(
                z.object({
                  id: z.string(),
                  price: z.number(),
                  size: z.object({
                    id: z.string(),
                    name: z.string(),
                    slices: z.number(),
                    sortOrder: z.number(),
                  }),
                }),
              ),
              createdAt: z.date(),
              updatedAt: z.date(),
            }),
          }),
          404: z.object({ message: z.string() }),
        },
      },
    },
    getProductByIdController,
  )

  // ─── POST /products ─────────────────────────────────────────────────────────
  app.post(
    '/',
    {
      onRequest: [adminAuthorization],
      schema: {
        tags: ['Products'],
        description: 'Cria um novo produto',
        body: z.object({
          categoryId: z.string(),
          name: z.string(),
          description: z.string().optional(),
          basePrice: z.coerce.number().positive(),
          imageUrl: z.string().optional(),
          isActive: z.boolean().default(true),
          sizes: z
            .array(
              z.object({
                sizeId: z.string(),
                price: z.coerce.number().positive(),
              }),
            )
            .optional(),
        }),
        response: {
          201: z.object({
            message: z.string(),
            product: z.object({
              id: z.string(),
              categoryId: z.string(),
              name: z.string(),
              description: z.string().nullable(),
              basePrice: z.number(),
              imageUrl: z.string().nullable(),
              isActive: z.boolean(),
              createdAt: z.date(),
              sizes: z.array(
                z.object({
                  id: z.string(),
                  price: z.number(),
                  size: z.object({
                    id: z.string(),
                    name: z.string(),
                    slices: z.number(),
                    sortOrder: z.number(),
                  }),
                }),
              ),
            }),
          }),
          400: z.object({ message: z.string() }),
          404: z.object({ message: z.string() }),
        },
      },
    },
    postProductsController,
  )

  // ─── PUT /products/:id ──────────────────────────────────────────────────────
  app.put(
    '/:id',
    {
      onRequest: [adminAuthorization],
      schema: {
        tags: ['Products'],
        description: 'Atualiza um produto existente',
        params: z.object({
          id: z.string(),
        }),
        body: z.object({
          categoryId: z.string().optional(),
          name: z.string().optional(),
          description: z.string().optional(),
          basePrice: z.coerce.number().positive().optional(),
          imageUrl: z.string().optional(),
        }),
        response: {
          200: z.object({
            message: z.string(),
            product: z.object({
              id: z.string(),
              categoryId: z.string(),
              name: z.string(),
              description: z.string().nullable(),
              basePrice: z.number(),
              imageUrl: z.string().nullable(),
              isActive: z.boolean(),
              updatedAt: z.date(),
            }),
          }),
          400: z.object({ message: z.string() }),
          404: z.object({ message: z.string() }),
        },
      },
    },
    putProductsController,
  )

  // ─── PATCH /products/:id/status ─────────────────────────────────────────────
  app.patch(
    '/:id/status',
    {
      onRequest: [adminAuthorization],
      schema: {
        tags: ['Products'],
        description: 'Ativa ou desativa um produto',
        params: z.object({
          id: z.string(),
        }),
        body: z.object({
          isActive: z.boolean(),
        }),
        response: {
          200: z.object({
            message: z.string(),
            product: z.object({
              id: z.string(),
              name: z.string(),
              isActive: z.boolean(),
            }),
          }),
          404: z.object({ message: z.string() }),
        },
      },
    },
    patchProductStatusController,
  )

  // ─── DELETE /products/:id ───────────────────────────────────────────────────
  app.delete(
    '/:id',
    {
      onRequest: [adminAuthorization],
      schema: {
        tags: ['Products'],
        description: 'Remove um produto (soft delete)',
        params: z.object({
          id: z.string(),
        }),
        response: {
          200: z.object({ message: z.string() }),
          404: z.object({ message: z.string() }),
        },
      },
    },
    deleteProductsController,
  )
}
