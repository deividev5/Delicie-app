import fastify from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import fastifyMultipart from '@fastify/multipart'
import { env } from './env/index.ts'
import { authRoutes } from './modules/auth/route.ts'
import fastifyJwt from '@fastify/jwt'
import { userRoutes } from './modules/users/route.ts'
import { addressRoutes } from './modules/addresses/routes.ts'
import { categoryRoutes } from './modules/categories/route.ts'

// Criação da instância do Fastify com o provedor de tipos Zod
export const app = fastify().withTypeProvider<ZodTypeProvider>()

// Configuração dos compilers de validação e serialização para usar Zod
app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

// Configuração do plugin de JWT para autenticação
app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
})

// Configuração do plugin de multipart para upload de arquivos (max 5MB)
app.register(fastifyMultipart, {
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
})

// Registro das rotas de usuário com o prefixo '/auth'
app.register(authRoutes, { prefix: '/auth' })
app.register(userRoutes, { prefix: '/users' })
app.register(addressRoutes, { prefix: '/users' })
app.register(categoryRoutes, { prefix: '/categories' })
