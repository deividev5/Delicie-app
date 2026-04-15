import { Resend } from 'resend'
import { env } from '../env/index.ts'

// Configura o cliente do Resend usando a chave de API fornecida nas variáveis de ambiente
export const resend = new Resend(env.RESEND_API_KEY)
