import { adminAuthorization } from '../../middleware/adminAuthAuthorization.ts'
import { FastifyTypedInstance } from '../../types/fastify.ts'
import { z } from 'zod'
import { postCategoriesController } from './postCategories.ts'
import { getCategoriesController } from './getCategories.ts'
import { putCategoriesController } from './putCategories.ts'
import { deleteCategoriesContoller } from './deleteCategories.ts'

export async function categoryRoutes(app: FastifyTypedInstance) {
  app.post(
    '/',
    {
      onRequest: [adminAuthorization], // Middleware para verificar se o usuário é um administrador autorizado
      schema: {
        // Documentação da rota para criar uma nova categoria
        tags: ['Categories'],
        description: 'Cria uma nova categoria',
        // Validação do corpo da requisição usando Zod
        body: z.object({
          name: z.string(),
          description: z.string().optional(),
          imageUrl: z.string().optional(),
          isActive: z.boolean(),
          sortOrder: z.coerce.number(),
        }),
        // Documentação das possíveis respostas da rota
        response: {
          201: z.object({
            message: z.string(),
            category: z.object({
              id: z.string(),
              name: z.string(),
              description: z.string().optional(),
              imageUrl: z.string().optional(),
              isActive: z.boolean(),
              sortOrder: z.number(),
            }),
          }),
          400: z.object({
            message: z.string(),
          }),
        },
      },
    },
    // Controlador para lidar com a lógica de criação de uma nova categoria
    postCategoriesController,
  )
  app.get(
    '/',
    {
      schema: {
        // Documentação da rota para obter a lista de categorias
        tags: ['Categories'],
        description: 'Obtém a lista de categorias',
        // Documentação das possíveis respostas da rota
        response: {
          200: z.object({
            message: z.string(),
            categories: z.array(
              z.object({
                id: z.string(),
                name: z.string(),
                description: z.string().optional(),
                imageUrl: z.string().optional(),
                isActive: z.boolean(),
                sortOrder: z.number(),
              }),
            ),
          }),
        },
      },
    },
    // Controlador para lidar com a lógica de obtenção das categorias
    getCategoriesController,
  )
  app.put(
    '/:id',
    {
      onRequest: [adminAuthorization], // Middleware para verificar se o usuário é um administrador autorizado
      schema: {
        // Documentação da rota para atualizar uma categoria existente
        tags: ['Categories'],
        description: 'Atualiza uma categoria existente',
        // Validação dos parâmetros da rota e do corpo da requisição usando Zod
        params: z.object({
          id: z.string(),
        }),
        body: z.object({
          name: z.string().optional(),
          description: z.string().optional(),
          imageUrl: z.string().optional(),
          isActive: z.boolean().optional(),
          sortOrder: z.coerce.number().optional(),
        }),
        // Documentação das possíveis respostas da rota
        response: {
          200: z.object({
            message: z.string(),
            category: z.object({
              id: z.string(),
              name: z.string(),
              description: z.string().optional(),
              imageUrl: z.string().optional(),
              isActive: z.boolean(),
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
    // Controlador para lidar com a lógica de atualização de uma categoria existente
    putCategoriesController,
  )
  app.delete(
    '/:id',
    {
      onRequest: [adminAuthorization], // Middleware para verificar se o usuário é um administrador autorizado
      schema: {
        // Documentação da rota para excluir uma categoria existente
        tags: ['Categories'],
        description: 'Exclui uma categoria existente',
        // Validação dos parâmetros da rota usando Zod
        params: z.object({
          id: z.string(),
        }),
        // Documentação das possíveis respostas da rota
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
    // Controlador para lidar com a lógica de exclusão de uma categoria existente
    deleteCategoriesContoller,
  )
}
