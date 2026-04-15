import 'dotenv/config'

import { z } from 'zod'

// Define o schema para as variáveis de ambiente esperadas
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  PORT: z.coerce.number().default(3333),
  JWT_SECRET: z.string(),
  DATABASE_URL: z.url(),
  RESEND_API_KEY: z.string(),
  CLOUDINARY_URL: z.string(),
})

// Valida as variáveis de ambiente usando o schema definido
const _env = envSchema.safeParse(process.env)

// Se a validação falhar, exibe um erro detalhado e interrompe a execução
if (!_env.success) {
  console.error(
    '❌ Invalid environment variables:',
    z.prettifyError(_env.error),
  )

  throw new Error('Invalid environment variables.')
}

// Exporta as variáveis de ambiente validadas para uso na aplicação
export const env = _env.data
