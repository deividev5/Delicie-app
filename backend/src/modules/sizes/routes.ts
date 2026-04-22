import { adminAuthorization } from '../../middleware/adminAuthAuthorization.ts'
import { FastifyTypedInstance } from '../../types/fastify.ts'
import { z } from 'zod'
import { postSizesController } from './postSizes.ts'
import { getSizesController } from './getSizes.ts'
import { putSizesController } from './putSizes.ts'
import { deleteSizesController } from './deleteSizes.ts'

export async function sizesRoutes(app: FastifyTypedInstance) {
  app.post(
    '/',
    {
      onRequest: [adminAuthorization],
      schema: {
        tags: ['Sizes'],
        description: 'Cria um novo tamanho',
        body: z.object({
          name: z.string(),
          slices: z.number().int(),
          sortOrder: z.coerce.number(),
        }),
        response: {
          201: z.object({
            message: z.string(),
            size: z.object({
              id: z.string(),
              name: z.string(),
              slices: z.number(),
              sortOrder: z.number(),
            }),
          }),
          400: z.object({
            message: z.string(),
          }),
        },
      },
    },
    postSizesController,
  )

  app.get(
    '/',
    {
      schema: {
        tags: ['Sizes'],
        description: 'Obtém a lista de tamanhos',
        response: {
          200: z.object({
            message: z.string(),
            sizes: z.array(
              z.object({
                id: z.string(),
                name: z.string(),
                slices: z.number(),
                sortOrder: z.number(),
              }),
            ),
          }),
        },
      },
    },
    getSizesController,
  )

  app.put(
    '/:id',
    {
      onRequest: [adminAuthorization],
      schema: {
        tags: ['Sizes'],
        description: 'Atualiza um tamanho existente',
        params: z.object({
          id: z.string(),
        }),
        body: z.object({
          name: z.string().optional(),
          slices: z.number().int().optional(),
          sortOrder: z.coerce.number().optional(),
        }),
        response: {
          200: z.object({
            message: z.string(),
            size: z.object({
              id: z.string(),
              name: z.string(),
              slices: z.number(),
              sortOrder: z.number(),
            }),
          }),
          400: z.object({
            message: z.string(),
          }),
          404: z.object({
            message: z.string(),
          }),
        },
      },
    },
    putSizesController,
  )

  app.delete(
    '/:id',
    {
      onRequest: [adminAuthorization],
      schema: {
        tags: ['Sizes'],
        description: 'Exclui um tamanho existente',
        params: z.object({
          id: z.string(),
        }),
        response: {
          200: z.object({
            message: z.string(),
          }),
          400: z.object({
            message: z.string(),
          }),
          404: z.object({
            message: z.string(),
          }),
        },
      },
    },
    deleteSizesController,
  )
}
