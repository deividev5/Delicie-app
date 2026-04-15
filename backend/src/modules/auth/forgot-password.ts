import { randomBytes } from 'node:crypto'
import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '../../lib/prisma.ts'
import { resend } from '../../lib/mail.ts'

export async function forgotPasswordController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // Extrai o email do corpo da requisição
  const { email } = request.body as { email: string }

  // Normaliza o email para lowercase para garantir consistência na busca no banco de dados
  const normalizedEmail = email.toLowerCase()

  // Busca o usuário no banco de dados pelo email fornecido
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  })

  // Sempre retorna sucesso para não revelar se o e-mail existe no sistema
  if (!user) {
    return reply.status(200).send({
      message: 'If the email exists, a reset link has been sent',
    })
  }

  // Gera token aleatório de 32 bytes (64 caracteres hex)
  const resetToken = randomBytes(32).toString('hex')

  // Token expira em 15 minutos
  const resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000)

  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken, resetTokenExpires },
  })

  const { data, error } = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: user.email,
    subject: 'Redefinição de senha - Delicie',
    html: `
      <h2>Olá, ${user.name}!</h2>
      <p>Você solicitou a redefinição da sua senha.</p>
      <p>Use o código abaixo no app para criar uma nova senha:</p>
      <h1 style="letter-spacing: 4px; text-align: center; background: #f4f4f4; padding: 16px; border-radius: 8px;">
        ${resetToken.slice(0, 6).toUpperCase()}
      </h1>
      <p>Este código expira em <strong>15 minutos</strong>.</p>
      <p>Se você não solicitou isso, ignore este e-mail.</p>
    `,
  })

  if (error) {
    console.error('Failed to send email:', error)
  }

  return reply.status(200).send({
    message: 'If the email exists, a reset link has been sent',
  })
}
