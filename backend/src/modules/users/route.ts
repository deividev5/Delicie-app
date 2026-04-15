import { z } from 'zod'
import type { FastifyTypedInstance } from '../../types/fastify.ts'
import { verifyJwt } from '../../middleware/verify-jwt.ts'
import { ProfileController } from './getProfile.ts'
import { UpdateProfileController } from './putProfile.ts'
import { UpdatePasswordController } from './putPassword.ts'
import { UpdateAvatarController } from './putAvatar.ts'

export async function userRoutes(app: FastifyTypedInstance) {
  // Rota para registrar um novo usuário
  app.get(
    '/me',
    {
      onRequest: [verifyJwt], // Middleware para verificar o token JWT antes de acessar a rota
      // Documentação da rota usando Zod para validação e descrição
      schema: {
        tags: ['Users'],
        description: 'Dados do usuário logado',
        // Documentação das respostas possíveis da rota
        response: {
          200: z.object({
            message: z.string(),
            user: z.object({
              id: z.string(),
              name: z.string(),
              email: z.email(),
              phone: z.string(),
            }),
          }),
          // Documentação para resposta de erro caso o usuário não seja encontrado
          404: z.object({
            message: z.string(),
          }),
        },
      },
    },
    ProfileController,
  )

  app.put(
    '/me',
    {
      onRequest: [verifyJwt], // Middleware para verificar o token JWT antes de acessar a rota
      // Documentação da rota usando Zod para validação e descrição
      schema: {
        tags: ['Users'],
        description: 'Atualiza os dados do usuário logado',
        body: z.object({
          name: z.string().optional(),
          email: z.email().optional(),
          phone: z.string().optional(),
        }),
        // Documentação das respostas possíveis da rota
        response: {
          200: z.object({
            message: z.string(),
            user: z.object({
              id: z.string(),
              name: z.string(),
              email: z.email(),
              phone: z.string(),
            }),
          }),
          // Documentação para resposta de erro caso o email já esteja em uso
          409: z.object({
            message: z.string(),
          }),
          // Documentação para resposta de erro caso o usuário não seja encontrado
          404: z.object({
            message: z.string(),
          }),
        },
      },
    },
    UpdateProfileController,
  )

  app.put(
    '/me/password',
    {
      onRequest: [verifyJwt], // Middleware para verificar o token JWT antes de acessar a rota
      // Documentação da rota usando Zod para validação e descrição
      schema: {
        tags: ['Users'],
        description: 'Atualiza a senha do usuário logado',
        body: z.object({
          oldPassword: z.string(),
          password: z
            .string()
            .min(8, 'Password must be at least 8 characters long'),
          confirmPassword: z
            .string()
            .min(8, 'Confirm password must be at least 8 characters long'),
        }),
        // Documentação das respostas possíveis da rota
        response: {
          200: z.object({
            message: z.string(),
            accessToken: z.string(),
            refreshToken: z.string(),
          }),
          // Documentação para resposta de erro caso o usuário não seja encontrado
          404: z.object({
            message: z.string(),
          }),
          // Documentação para resposta de erro caso a senha e a confirmação de senha não correspondam
          400: z.object({
            message: z.string(),
          }),
        },
      },
    },
    UpdatePasswordController,
  )

  app.put(
    '/me/avatar',
    {
      onRequest: [verifyJwt],
      // Documentação da rota usando Zod para validação e descrição
      schema: {
        tags: ['Users'],
        description: 'Atualiza o avatar do usuário logado',
        consumes: ['multipart/form-data'],
        // Documentação do corpo da requisição para upload de arquivo
        response: {
          200: z.object({
            message: z.string(),
            avatarUrl: z.string(),
          }),
          // Documentação para resposta de erro caso o usuário não seja encontrado
          400: z.object({
            message: z.string(),
          }),
          // Documentação para resposta de erro caso o usuário não seja encontrado
          404: z.object({
            message: z.string(),
          }),
        },
      },
    },
    UpdateAvatarController,
  )
}
