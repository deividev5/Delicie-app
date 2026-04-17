import { customerAuthorization } from '../../middleware/costumerAuthorization.ts'
import { FastifyTypedInstance } from '../../types/fastify.ts'
import { z } from 'zod'
import { PostAddressesController } from './postAddresses.ts'
import { GetAddressesController } from './getAddresses.ts'
import { PutAddressesController } from './putAddresses.ts'
import { deleteAddressesController } from './deleteAddresses.ts'
import { patchAddressesController } from './patchAddresses.ts'
export async function addressRoutes(app: FastifyTypedInstance) {
  app.post(
    '/addresses',
    {
      onRequest: [customerAuthorization], // Middleware para verificar se o usuário é um cliente autorizado
      schema: {
        tags: ['Addresses'],
        description: 'Cria um novo endereço para o usuário logado',
        // Documentação do corpo da requisição usando Zod para validação e descrição
        body: z.object({
          street: z.string(),
          label: z.string(),
          city: z.string(),
          state: z.string(),
          zipCode: z.string(),
          number: z.string(),
          complement: z.string().optional(),
          neighborhood: z.string(),
          latitude: z.number().optional(),
          longitude: z.number().optional(),
        }),
        // Documentação das respostas possíveis da rota
        response: {
          201: z.object({
            message: z.string(),
            address: z.object({
              id: z.string(),
              label: z.string(),
              street: z.string(),
              city: z.string(),
              state: z.string(),
              zipCode: z.string(),
              number: z.string(),
              complement: z.string().nullable().optional(),
              neighborhood: z.string(),
              latitude: z.number().nullable().optional(),
              longitude: z.number().nullable().optional(),
            }),
          }),
          404: z.object({
            message: z.string(),
          }),
        },
      },
    },
    PostAddressesController,
  )

  app.get(
    '/addresses',
    {
      onRequest: [customerAuthorization], // Middleware para verificar se o usuário é um cliente autorizado
      schema: {
        tags: ['Addresses'],
        description: 'Retorna a lista de endereços do usuário logado',
        // Documentação das respostas possíveis da rota
        response: {
          200: z.object({
            message: z.string(),
            addresses: z.array(
              z.object({
                id: z.string(),
                label: z.string(),
                street: z.string(),
                city: z.string(),
                state: z.string(),
                zipCode: z.string(),
                number: z.string(),
                complement: z.string().nullable().optional(),
                neighborhood: z.string(),
                latitude: z.number().nullable().optional(),
                longitude: z.number().nullable().optional(),
                isDefault: z.boolean(),
              }),
            ),
          }),
          // Documentação para o caso de erro 404, indicando que os endereços não foram encontrados
          404: z.object({
            message: z.string(),
          }),
        },
      },
    },
    GetAddressesController,
  )

  app.put(
    '/addresses/:id',
    {
      onRequest: [customerAuthorization], // Middleware para verificar se o usuário é um cliente autorizado
      schema: {
        tags: ['Addresses'],
        description: 'Atualiza um endereço específico do usuário logado',
        // Documentação dos parâmetros da rota usando Zod para validação e descrição
        params: z.object({
          id: z.string(),
        }),
        // Documentação do corpo da requisição usando Zod para validação e descrição
        body: z.object({
          street: z.string().optional(),
          label: z.string().optional(),
          city: z.string().optional(),
          state: z.string().optional(),
          zipCode: z.string().optional(),
          number: z.string().optional(),
          complement: z.string().nullable().optional(),
          neighborhood: z.string().optional(),
          latitude: z.number().nullable().optional(),
          longitude: z.number().nullable().optional(),
        }),
        // Documentação das respostas possíveis da rota
        response: {
          200: z.object({
            message: z.string(),
            address: z.object({
              id: z.string(),
              label: z.string(),
              street: z.string(),
              city: z.string(),
              state: z.string(),
              zipCode: z.string(),
              number: z.string(),
              complement: z.string().nullable().optional(),
              neighborhood: z.string(),
              latitude: z.number().nullable().optional(),
              longitude: z.number().nullable().optional(),
            }),
          }),
          // Documentação para o caso de erro 404, indicando que o endereço não foi encontrado
          404: z.object({
            message: z.string(),
          }),
        },
      },
    },
    PutAddressesController,
  )

  app.delete(
    '/addresses/:id',
    {
      onRequest: [customerAuthorization], // Middleware para verificar se o usuário é um cliente autorizado
      schema: {
        tags: ['Addresses'],
        description: 'Exclui um endereço específico do usuário logado',
        // Documentação dos parâmetros da rota usando Zod para validação e descrição
        params: z.object({
          id: z.string(),
        }),
        // Documentação das respostas possíveis da rota
        response: {
          200: z.object({
            message: z.string(),
          }),
          // Documentação para o caso de erro 404, indicando que o endereço não foi encontrado
          404: z.object({
            message: z.string(),
          }),
        },
      },
    },
    deleteAddressesController,
  )

  app.patch(
    '/addresses/:id/default',
    {
      onRequest: [customerAuthorization], // Middleware para verificar se o usuário é um cliente autorizado
      schema: {
        tags: ['Addresses'],
        description:
          'Define um endereço específico como padrão para o usuário logado',
        // Documentação dos parâmetros da rota usando Zod para validação e descrição
        params: z.object({
          id: z.string(),
        }),
        // Documentação das respostas possíveis da rota
        response: {
          200: z.object({
            message: z.string(),
          }),
          // Documentação para o caso de erro 404, indicando que o endereço não foi encontrado
          404: z.object({
            message: z.string(),
          }),
        },
      },
    },
    patchAddressesController,
  )
}
