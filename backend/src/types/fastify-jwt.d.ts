import '@fastify/jwt'

// Extend a interface FastifyJWT para incluir o tipo do payload do token JWT
declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: {
      sub: string
    }
  }
}
