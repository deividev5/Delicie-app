import { z } from 'zod'
import type { FastifyTypedInstance } from '../../types/fastify.ts'
import { registerController } from './register.ts'
import { loginController } from './login.ts'
import { refreshController } from './refresh.ts'
import { logoutController } from './logout.ts'
import { forgotPasswordController } from './forgot-password.ts'
import { resetPasswordController } from './reset-password.ts'

export async function authRoutes(app: FastifyTypedInstance) {
  // Rota para registrar um novo usuário
  app.post(
    '/register',
    {
      schema: {
        tags: ['Auth'],
        description: 'Register a new user',
        body: z.object({
          name: z.string(),
          email: z.email(),
          phone: z.string(),
          password: z.string().min(8),
        }),
        response: {
          201: z.object({
            message: z.string(),
            user: z.object({
              id: z.string(),
              name: z.string(),
              email: z.email(),
              phone: z.string(),
            }),
          }),
          400: z.object({
            message: z.string(),
          }),
        },
      },
    },
    registerController,
  )

  // Rota para login — retorna accessToken + refreshToken + dados do usuário
  app.post(
    '/login',
    {
      schema: {
        tags: ['Auth'],
        description: 'Login a user',
        body: z.object({
          email: z.email(),
          password: z.string().min(8),
        }),
        response: {
          200: z.object({
            accessToken: z.string(),
            refreshToken: z.string(),
            user: z.object({
              id: z.string(),
              name: z.string(),
              email: z.email(),
              role: z.string(),
            }),
          }),
          401: z.object({
            message: z.string(),
          }),
        },
      },
    },
    loginController,
  )

  // Rota para renovar o access token usando o refresh token
  app.post(
    '/refresh',
    {
      schema: {
        tags: ['Auth'],
        description: 'Refresh access token',
        body: z.object({
          refreshToken: z.string(),
        }),
        response: {
          200: z.object({
            accessToken: z.string(),
          }),
          401: z.object({
            message: z.string(),
          }),
        },
      },
    },
    refreshController,
  )

  // Rota para logout — invalida todos os refresh tokens do usuário
  app.post(
    '/logout',
    {
      schema: {
        tags: ['Auth'],
        description: 'Logout user',
        headers: z.object({
          authorization: z.string(),
        }),
        response: {
          200: z.object({
            message: z.string(),
          }),
          401: z.object({
            message: z.string(),
          }),
        },
      },
    },
    logoutController,
  )

  // Rota para solicitar reset de senha — envia código por e-mail
  app.post(
    '/forgot-password',
    {
      schema: {
        tags: ['Auth'],
        description: 'Request password reset',
        body: z.object({
          email: z.email(),
        }),
        response: {
          200: z.object({
            message: z.string(),
          }),
        },
      },
    },
    forgotPasswordController,
  )

  // Rota para resetar a senha com o código recebido por e-mail
  app.post(
    '/reset-password',
    {
      schema: {
        tags: ['Auth'],
        description: 'Reset password with token',
        body: z.object({
          email: z.email(),
          token: z.string().length(6),
          password: z.string().min(8),
        }),
        response: {
          200: z.object({
            message: z.string(),
          }),
          400: z.object({
            message: z.string(),
          }),
        },
      },
    },
    resetPasswordController,
  )
}
