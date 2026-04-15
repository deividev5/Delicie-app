import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '../../lib/prisma.ts'
import { hash } from 'bcryptjs'

// Controlador para lidar com a lógica de registro de um novo usuário
export async function registerController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // Body já validado pelo schema Zod da rota
  const { name, email, phone, password } = request.body as {
    name: string
    email: string
    phone: string
    password: string
  }

  // Normaliza o email para lowercase
  const normalizedEmail = email.toLowerCase()

  // Verifica se já existe um usuário com o mesmo email no banco de dados
  const userSameEmail = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  })

  // Se já existir um usuário com o mesmo email, retorna um erro 400
  if (userSameEmail) {
    return reply.status(400).send({
      message: 'Email already registered',
    })
  }

  // Hash da senha do usuário para segurança antes de armazenar no banco de dados
  const hashedPassword = await hash(password, 10)

  // Cria um novo usuário no banco de dados com os dados fornecidos
  const user = await prisma.user.create({
    data: {
      name,
      email: normalizedEmail,
      phone,
      password: hashedPassword,
    },
  })

  // Retorna uma resposta de sucesso com os dados do usuário criado, excluindo a senha
  return reply.status(201).send({
    message: 'User registered successfully',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    },
  })
}
