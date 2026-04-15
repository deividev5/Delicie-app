# Delicie - Aplicativo de Pizzaria

## Visão Geral

Aplicativo completo para pizzaria com três perfis de usuário: **Administrador (Pizzaiolo)**, **Cliente** e **Entregador**.

**Stack:**
- **Backend:** Node.js + Fastify + TypeScript + PostgreSQL + Prisma
- **Frontend:** React Native

---

## 1. Perfis de Usuário e Permissões

| Perfil | Descrição |
|---|---|
| **ADMIN** | Pizzaiolo/Gerente. Gerencia cardápio, visualiza todos os pedidos, atualiza status de preparo, atribui entregador. |
| **CUSTOMER** | Cliente. Visualiza cardápio, monta pedido, realiza pagamento (Pix), acompanha status do pedido. |
| **DELIVERY** | Entregador. Recebe pedidos para entrega, visualiza rota/endereço, marca pedido como entregue. |

---

## 2. Regras de Negócio

### 2.1 Autenticação e Cadastro
- RN01: Todo usuário deve se cadastrar com nome, e-mail, telefone e senha.
- RN02: O e-mail deve ser único no sistema.
- RN03: O cliente deve cadastrar pelo menos um endereço de entrega.
- RN04: O admin e o entregador são cadastrados pelo admin (não há auto-cadastro público para esses perfis).
- RN05: Autenticação via JWT com refresh token.
- RN06: Senha deve ter no mínimo 8 caracteres.

### 2.2 Cardápio (Produtos)
- RN07: Apenas o admin pode criar, editar, ativar/desativar e excluir itens do cardápio.
- RN08: Produtos possuem: nome, descrição, preço, categoria (pizza, bebida, sobremesa, etc.), imagem e status (ativo/inativo).
- RN09: Pizzas podem ter tamanhos (Broto, Média, Grande, Família) com preços diferentes.
- RN10: Produtos inativos não aparecem para o cliente, mas continuam no histórico de pedidos.
- RN11: Categorias são gerenciadas pelo admin.

### 2.3 Pedido
- RN12: O cliente monta o carrinho adicionando pizzas e bebidas com quantidades.
- RN13: O pedido deve ter pelo menos 1 item.
- RN14: O pedido deve ter um endereço de entrega associado.
- RN15: O valor total do pedido é calculado no backend (nunca confiar no frontend).
- RN16: Uma taxa de entrega pode ser aplicada com base na distância/bairro.
- RN17: O cliente pode adicionar observações ao pedido (ex: "sem cebola", "bem assada").
- RN18: O pedido pode ter observações por item individual.

### 2.4 Pagamento (Pix)
- **RN19: O pedido SÓ é enviado para a cozinha APÓS a confirmação do pagamento via Pix.**
- RN20: Ao finalizar o pedido, é gerado um QR Code / código Pix copia-e-cola.
- RN21: O pagamento tem um tempo limite de expiração (ex: 30 minutos).
- RN22: Se o pagamento expirar, o pedido é cancelado automaticamente.
- RN23: O sistema deve verificar o status do pagamento via webhook ou polling.
- RN24: Após confirmação do pagamento, o status do pedido muda para "CONFIRMED" e vai para a fila da cozinha.

### 2.5 Fluxo do Pedido (Status)
```
CREATED → AWAITING_PAYMENT → CONFIRMED → PREPARING → READY → OUT_FOR_DELIVERY → DELIVERED
                ↓                                                                    
            CANCELLED (pagamento expirou ou cliente cancelou antes do pagamento)
```

| Status | Descrição | Quem altera |
|---|---|---|
| `CREATED` | Pedido montado no carrinho | Sistema |
| `AWAITING_PAYMENT` | Pedido finalizado, aguardando Pix | Sistema |
| `CONFIRMED` | Pagamento confirmado, na fila da cozinha | Sistema (webhook) |
| `PREPARING` | Pizzaiolo começou a preparar | Admin |
| `READY` | Pedido pronto para entrega | Admin |
| `OUT_FOR_DELIVERY` | Entregador saiu para entregar | Admin/Entregador |
| `DELIVERED` | Entregue ao cliente | Entregador |
| `CANCELLED` | Cancelado | Sistema/Cliente |

### 2.6 Entrega
- RN25: O admin atribui um entregador disponível ao pedido quando ele está pronto (READY).
- RN26: O entregador vê apenas os pedidos atribuídos a ele.
- RN27: O entregador marca o pedido como entregue (DELIVERED).
- RN28: O cliente recebe notificação a cada mudança de status.

### 2.7 Horário de Funcionamento
- RN29: A pizzaria tem horário de funcionamento configurável pelo admin.
- RN30: Fora do horário, o cliente pode ver o cardápio mas não pode fazer pedidos.

### 2.8 Avaliação
- RN31: Após a entrega, o cliente pode avaliar o pedido (1 a 5 estrelas) e deixar um comentário.
- RN32: Cada pedido pode ser avaliado apenas uma vez.

---

## 3. Funcionalidades por Perfil

### 3.1 Cliente
| # | Funcionalidade |
|---|---|
| F01 | Cadastro e login |
| F02 | Gerenciar perfil (nome, telefone, foto) |
| F03 | Gerenciar endereços de entrega (CRUD) |
| F04 | Visualizar cardápio por categorias |
| F05 | Buscar produtos por nome |
| F06 | Adicionar/remover itens do carrinho |
| F07 | Visualizar carrinho com total |
| F08 | Finalizar pedido (gera Pix) |
| F09 | Visualizar QR Code / código Pix |
| F10 | Acompanhar status do pedido em tempo real |
| F11 | Visualizar histórico de pedidos |
| F12 | Avaliar pedido entregue |
| F13 | Receber notificações push de status |
| F14 | Cancelar pedido (antes do pagamento) |

### 3.2 Admin (Pizzaiolo/Gerente)
| # | Funcionalidade |
|---|---|
| F15 | Login admin |
| F16 | CRUD de categorias |
| F17 | CRUD de produtos (pizzas, bebidas, etc.) |
| F18 | Upload de imagens dos produtos |
| F19 | Ativar/desativar produtos |
| F20 | Visualizar todos os pedidos (dashboard) |
| F21 | Filtrar pedidos por status |
| F22 | Alterar status do pedido (PREPARING, READY) |
| F23 | Atribuir entregador ao pedido |
| F24 | Cadastrar/gerenciar entregadores |
| F25 | Configurar horário de funcionamento |
| F26 | Configurar taxa de entrega |
| F27 | Visualizar relatórios (vendas do dia, semana, mês) |
| F28 | Receber notificação de novo pedido |

### 3.3 Entregador
| # | Funcionalidade |
|---|---|
| F29 | Login entregador |
| F30 | Visualizar pedidos atribuídos a ele |
| F31 | Ver detalhes do pedido e endereço de entrega |
| F32 | Marcar pedido como entregue |
| F33 | Visualizar histórico de entregas |
| F34 | Atualizar disponibilidade (online/offline) |
| F35 | Receber notificação de nova entrega |

---

## 4. Rotas da API

### 4.1 Autenticação (`/auth`)

| Método | Rota | Descrição | Acesso |
|---|---|---|---|
| POST | `/auth/register` | Cadastro de cliente | Público |
| POST | `/auth/login` | Login (retorna JWT) | Público |
| POST | `/auth/refresh` | Renovar access token | Autenticado |
| POST | `/auth/logout` | Invalidar refresh token | Autenticado |
| POST | `/auth/forgot-password` | Solicitar reset de senha | Público |
| POST | `/auth/reset-password` | Resetar senha com token | Público |

### 4.2 Usuário / Perfil (`/users`)

| Método | Rota | Descrição | Acesso |
|---|---|---|---|
| GET | `/users/me` | Dados do usuário logado | Autenticado |
| PUT | `/users/me` | Atualizar perfil | Autenticado |
| PUT | `/users/me/password` | Alterar senha | Autenticado |
| POST | `/users/me/avatar` | Upload de foto de perfil | Autenticado |

### 4.3 Endereços (`/addresses`)

| Método | Rota | Descrição | Acesso |
|---|---|---|---|
| GET | `/addresses` | Listar endereços do cliente | Customer |
| POST | `/addresses` | Criar novo endereço | Customer |
| PUT | `/addresses/:id` | Atualizar endereço | Customer |
| DELETE | `/addresses/:id` | Remover endereço | Customer |
| PATCH | `/addresses/:id/default` | Definir como endereço padrão | Customer |

### 4.4 Categorias (`/categories`)

| Método | Rota | Descrição | Acesso |
|---|---|---|---|
| GET | `/categories` | Listar categorias | Público |
| POST | `/categories` | Criar categoria | Admin |
| PUT | `/categories/:id` | Atualizar categoria | Admin |
| DELETE | `/categories/:id` | Remover categoria | Admin |

### 4.5 Produtos (`/products`)

| Método | Rota | Descrição | Acesso |
|---|---|---|---|
| GET | `/products` | Listar produtos (ativos para cliente) | Público |
| GET | `/products/:id` | Detalhes do produto | Público |
| GET | `/products/search?q=` | Buscar produtos por nome | Público |
| GET | `/products/category/:categoryId` | Produtos por categoria | Público |
| POST | `/products` | Criar produto | Admin |
| PUT | `/products/:id` | Atualizar produto | Admin |
| PATCH | `/products/:id/status` | Ativar/desativar produto | Admin |
| DELETE | `/products/:id` | Remover produto (soft delete) | Admin |
| POST | `/products/:id/image` | Upload de imagem | Admin |

### 4.6 Tamanhos de Pizza (`/sizes`)

| Método | Rota | Descrição | Acesso |
|---|---|---|---|
| GET | `/sizes` | Listar tamanhos disponíveis | Público |
| POST | `/sizes` | Criar tamanho | Admin |
| PUT | `/sizes/:id` | Atualizar tamanho/preço | Admin |
| DELETE | `/sizes/:id` | Remover tamanho | Admin |

### 4.7 Pedidos (`/orders`)

| Método | Rota | Descrição | Acesso |
|---|---|---|---|
| POST | `/orders` | Criar pedido (monta e gera Pix) | Customer |
| GET | `/orders` | Listar pedidos do usuário logado | Autenticado |
| GET | `/orders/:id` | Detalhes do pedido | Autenticado |
| GET | `/orders/:id/status` | Status atual do pedido | Autenticado |
| PATCH | `/orders/:id/cancel` | Cancelar pedido | Customer |
| GET | `/orders/admin/all` | Listar todos os pedidos (filtros) | Admin |
| GET | `/orders/admin/dashboard` | Dashboard (resumo do dia) | Admin |
| PATCH | `/orders/:id/status` | Alterar status do pedido | Admin |
| PATCH | `/orders/:id/assign` | Atribuir entregador | Admin |
| GET | `/orders/delivery/my` | Pedidos do entregador logado | Delivery |
| PATCH | `/orders/:id/deliver` | Marcar como entregue | Delivery |

### 4.8 Pagamento (`/payments`)

| Método | Rota | Descrição | Acesso |
|---|---|---|---|
| GET | `/payments/:orderId` | Status do pagamento | Customer |
| POST | `/payments/webhook` | Webhook de confirmação (gateway) | Público* |
| GET | `/payments/:orderId/qrcode` | Obter QR Code do Pix | Customer |

> *O webhook deve validar assinatura do gateway para segurança.

### 4.9 Avaliações (`/reviews`)

| Método | Rota | Descrição | Acesso |
|---|---|---|---|
| POST | `/reviews` | Avaliar pedido | Customer |
| GET | `/reviews/order/:orderId` | Ver avaliação de um pedido | Autenticado |
| GET | `/reviews/stats` | Estatísticas de avaliação | Admin |

### 4.10 Entregadores (`/delivery-persons`)

| Método | Rota | Descrição | Acesso |
|---|---|---|---|
| GET | `/delivery-persons` | Listar entregadores | Admin |
| POST | `/delivery-persons` | Cadastrar entregador | Admin |
| PUT | `/delivery-persons/:id` | Atualizar entregador | Admin |
| PATCH | `/delivery-persons/:id/status` | Ativar/desativar entregador | Admin |
| PATCH | `/delivery-persons/me/availability` | Alternar online/offline | Delivery |
| GET | `/delivery-persons/available` | Listar entregadores disponíveis | Admin |

### 4.11 Configurações (`/settings`)

| Método | Rota | Descrição | Acesso |
|---|---|---|---|
| GET | `/settings` | Obter configurações públicas | Público |
| GET | `/settings/business-hours` | Horário de funcionamento | Público |
| PUT | `/settings/business-hours` | Configurar horário | Admin |
| PUT | `/settings/delivery-fee` | Configurar taxa de entrega | Admin |

### 4.12 Relatórios (`/reports`)

| Método | Rota | Descrição | Acesso |
|---|---|---|---|
| GET | `/reports/sales?period=day\|week\|month` | Relatório de vendas | Admin |
| GET | `/reports/top-products` | Produtos mais vendidos | Admin |
| GET | `/reports/deliveries` | Relatório de entregas | Admin |

### 4.13 Notificações (`/notifications`)

| Método | Rota | Descrição | Acesso |
|---|---|---|---|
| GET | `/notifications` | Listar notificações do usuário | Autenticado |
| PATCH | `/notifications/:id/read` | Marcar como lida | Autenticado |
| PATCH | `/notifications/read-all` | Marcar todas como lidas | Autenticado |
| POST | `/notifications/token` | Registrar push token (FCM) | Autenticado |

---

## 5. Modelo de Dados (Entidades Principais)

```
User
├── id (UUID)
├── name
├── email (unique)
├── phone
├── password (hash)
├── role (ADMIN | CUSTOMER | DELIVERY)
├── avatarUrl
├── isActive
├── createdAt
└── updatedAt

Address
├── id (UUID)
├── userId (FK → User)
├── label (Casa, Trabalho, etc.)
├── street
├── number
├── complement
├── neighborhood
├── city
├── state
├── zipCode
├── latitude
├── longitude
├── isDefault
└── createdAt

Category
├── id (UUID)
├── name
├── description
├── imageUrl
├── isActive
├── sortOrder
└── createdAt

Product
├── id (UUID)
├── categoryId (FK → Category)
├── name
├── description
├── basePrice
├── imageUrl
├── isActive
├── createdAt
└── updatedAt

ProductSize (para pizzas com tamanhos)
├── id (UUID)
├── productId (FK → Product)
├── sizeId (FK → Size)
└── price

Size
├── id (UUID)
├── name (Broto, Média, Grande, Família)
├── slices (4, 6, 8, 12)
└── sortOrder

Order
├── id (UUID)
├── customerId (FK → User)
├── deliveryPersonId (FK → User, nullable)
├── addressId (FK → Address)
├── status (enum)
├── subtotal
├── deliveryFee
├── totalAmount
├── notes
├── paidAt
├── deliveredAt
├── cancelledAt
├── createdAt
└── updatedAt

OrderItem
├── id (UUID)
├── orderId (FK → Order)
├── productId (FK → Product)
├── sizeId (FK → Size, nullable)
├── quantity
├── unitPrice
├── totalPrice
├── notes (observação do item)
└── createdAt

Payment
├── id (UUID)
├── orderId (FK → Order)
├── externalId (ID do gateway)
├── method (PIX)
├── amount
├── status (PENDING | CONFIRMED | EXPIRED | REFUNDED)
├── pixQrCode
├── pixCopyPaste
├── expiresAt
├── confirmedAt
└── createdAt

Review
├── id (UUID)
├── orderId (FK → Order, unique)
├── customerId (FK → User)
├── rating (1-5)
├── comment
└── createdAt

DeliveryPerson (extensão do User com role DELIVERY)
├── id (UUID)
├── userId (FK → User)
├── vehicleType (MOTO | BICICLETA | CARRO)
├── licensePlate
├── isAvailable (online/offline)
└── createdAt

Notification
├── id (UUID)
├── userId (FK → User)
├── title
├── body
├── type (ORDER_STATUS | NEW_ORDER | NEW_DELIVERY)
├── data (JSON)
├── isRead
└── createdAt

BusinessHours
├── id (UUID)
├── dayOfWeek (0-6)
├── openTime
├── closeTime
├── isOpen
└── updatedAt

Settings
├── id (UUID)
├── key
├── value
└── updatedAt
```

---

## 6. Funcionalidades Complementares Sugeridas

| # | Funcionalidade | Motivo |
|---|---|---|
| C01 | **Notificações push (Firebase)** | Essencial para atualizações de status em tempo real |
| C02 | **WebSocket / SSE** | Atualização em tempo real do dashboard do admin e status do cliente |
| C03 | **Upload de imagens (S3/Cloudinary)** | Fotos das pizzas no cardápio |
| C04 | **Rate limiting** | Proteção contra abuso da API |
| C05 | **Soft delete** | Manter integridade dos dados históricos |
| C06 | **Paginação cursor-based** | Performance em listagens grandes |
| C07 | **Logs de auditoria** | Rastrear mudanças em pedidos |
| C08 | **Cupons de desconto** | Promoções e fidelização |
| C09 | **Tempo estimado de entrega** | Melhor experiência do cliente |
| C10 | **Repetir pedido anterior** | Conveniência para clientes recorrentes |

---

## 7. Integrações Externas

| Serviço | Finalidade |
|---|---|
| **Gateway Pix** (Mercado Pago, Asaas, EfiPay) | Geração de cobranças Pix e webhooks de confirmação |
| **Firebase Cloud Messaging (FCM)** | Push notifications para os 3 perfis |
| **Cloudinary / AWS S3** | Armazenamento de imagens |
| **Google Maps API** (opcional) | Cálculo de distância para taxa de entrega |

---

## 8. Fluxo Principal — Pedido Completo

```
1. Cliente abre o app → vê cardápio
2. Seleciona pizzas/bebidas → adiciona ao carrinho
3. Revisa carrinho → confirma endereço de entrega
4. Clica "Finalizar Pedido"
5. Backend cria o pedido (status: AWAITING_PAYMENT) e gera Pix
6. Cliente vê QR Code / copia código Pix
7. Cliente paga no app do banco
8. Gateway envia webhook → Backend confirma pagamento
9. Status muda para CONFIRMED → Notifica admin
10. Admin vê no dashboard → muda para PREPARING
11. Pizza pronta → Admin muda para READY
12. Admin atribui entregador → Status: OUT_FOR_DELIVERY → Notifica entregador
13. Entregador entrega → marca DELIVERED → Notifica cliente
14. Cliente pode avaliar o pedido
```

---

## 9. Estrutura de Pastas Sugerida (Backend)

```
backend/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── server.ts              # Inicialização do Fastify
│   ├── app.ts                 # Configuração de plugins
│   ├── env.ts                 # Validação de variáveis de ambiente
│   ├── lib/
│   │   ├── prisma.ts          # Instância do Prisma Client
│   │   └── firebase.ts        # Firebase Admin SDK
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.schema.ts  # Validação com Zod
│   │   ├── users/
│   │   ├── addresses/
│   │   ├── categories/
│   │   ├── products/
│   │   ├── orders/
│   │   ├── payments/
│   │   ├── reviews/
│   │   ├── delivery/
│   │   ├── notifications/
│   │   ├── settings/
│   │   └── reports/
│   ├── middlewares/
│   │   ├── auth.middleware.ts     # Verificação JWT
│   │   ├── role.middleware.ts     # Verificação de perfil
│   │   └── rate-limit.middleware.ts
│   ├── utils/
│   │   ├── errors.ts
│   │   ├── pagination.ts
│   │   └── upload.ts
│   └── @types/
│       └── fastify.d.ts
├── package.json
├── tsconfig.json
├── .env
└── .env.example
```

---

## 10. Segurança

- Senhas hasheadas com **bcrypt** (salt rounds ≥ 10)
- JWT com tempo de expiração curto (15min access, 7d refresh)
- Validação de entrada em **todas** as rotas com **Zod**
- Webhook do gateway validado por **assinatura HMAC**
- Rate limiting por IP e por usuário
- CORS configurado para origens permitidas
- Helmet headers via `@fastify/helmet`
- Dados sensíveis nunca retornados na API (senha, tokens internos)
- IDs como UUID v4 (não sequenciais)
- Proteção contra SQL injection via Prisma (queries parametrizadas)
