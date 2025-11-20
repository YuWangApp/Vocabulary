# Architecture

## Overview

Volcabulary is a full-stack TypeScript monorepo designed for scalability and multi-language support.

## Technology Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **tRPC React Query**: Type-safe API client
- **React Query**: Data fetching and caching

### Backend
- **Node.js**: JavaScript runtime
- **Express**: Web server framework
- **tRPC**: End-to-end type-safe APIs
- **WebSocket (ws)**: Real-time bidirectional communication
- **Zod**: Schema validation

### Monorepo Tools
- **pnpm Workspaces**: Efficient package management
- **Turborepo**: Build system and orchestration
- **TypeScript Project References**: Cross-package type checking

## Architecture Patterns

### 1. Monorepo Structure

The project uses pnpm workspaces with three main directories:

- `apps/`: User-facing applications (web, server)
- `packages/`: Shared libraries (types, config)
- `services/`: Microservices in various languages

### 2. Type Safety

Type safety flows from server to client:

```
Server (tRPC Router) → Type Export → Client (tRPC Client)
```

Types are shared through:
- `@volcabulary/types`: Shared domain types
- tRPC's automatic type inference

### 3. Communication Patterns

#### tRPC (Primary API)
- Type-safe RPC-style APIs
- Automatic serialization/deserialization
- Built-in request batching
- React Query integration

```typescript
// Server
export const appRouter = router({
  user: userRouter,
})

// Client (fully typed!)
const users = trpc.user.getAll.useQuery()
```

#### REST Endpoints
- For non-TypeScript clients
- Simple HTTP endpoints
- Standard REST conventions

#### WebSocket
- Real-time bidirectional communication
- Event-based messaging
- Broadcast capabilities

### 4. Data Flow

```
┌─────────────┐
│   Next.js   │
│   Frontend  │
└──────┬──────┘
       │
       ├─────tRPC────────┐
       │                 │
       ├─────WebSocket───┤
       │                 │
       └─────REST API────┤
                         │
                    ┌────▼────┐
                    │ Express │
                    │ Server  │
                    └─────────┘
```

## Code Organization

### Backend Structure

```
apps/server/src/
├── config/          # Environment and configuration
├── trpc/            # tRPC setup and routers
│   ├── context.ts   # Request context
│   ├── trpc.ts      # tRPC initialization
│   └── routers/     # API routes
├── rest/            # REST endpoints
├── websocket/       # WebSocket handlers
└── index.ts         # Server entry point
```

### Frontend Structure

```
apps/web/src/
├── app/             # Next.js App Router
│   ├── layout.tsx   # Root layout
│   ├── page.tsx     # Home page
│   └── globals.css  # Global styles
├── lib/             # Utilities
│   ├── trpc.ts      # tRPC client setup
│   └── trpc-provider.tsx
└── hooks/           # Custom React hooks
    └── useWebSocket.ts
```

## Extensibility

### Adding New Languages

The monorepo supports services in any language:

1. Create service in `services/` directory
2. Add its own build configuration
3. Update `turbo.json` if needed
4. Communicate via HTTP/gRPC/message queues

Example:
```
services/
├── python-service/  # FastAPI/Flask
├── go-service/      # Gin/Echo
└── rust-service/    # Actix/Rocket
```

### Inter-Service Communication

Services can communicate through:
- **HTTP APIs**: REST/GraphQL endpoints
- **gRPC**: For performance-critical services
- **Message Queues**: RabbitMQ, Kafka for async ops
- **Event Bus**: Redis Pub/Sub
- **Shared Database**: PostgreSQL with proper isolation

## Deployment

### Containerization

Each service can be containerized independently:

```dockerfile
# apps/server/Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
CMD ["pnpm", "start"]
```

### Deployment Options

1. **Monolithic**: Deploy all TypeScript apps together
2. **Microservices**: Deploy each service independently
3. **Hybrid**: Deploy TypeScript together, other services separately

## Performance Considerations

### Build Optimization
- Turborepo caching reduces rebuild times
- pnpm workspaces deduplicates dependencies
- TypeScript project references for incremental builds

### Runtime Optimization
- Next.js automatic code splitting
- tRPC request batching
- React Query caching
- WebSocket connection pooling

## Security

### Best Practices
- Environment variables for secrets
- CORS configuration
- Input validation with Zod
- Type safety prevents runtime errors
- No sensitive data in client bundles

## Monitoring & Observability

Ready for integration with:
- Error tracking (Sentry)
- Logging (Winston, Pino)
- Metrics (Prometheus)
- Tracing (OpenTelemetry)

## Future Enhancements

- [ ] Authentication & authorization
- [ ] Database integration (Prisma/Drizzle)
- [ ] Rate limiting
- [ ] API versioning
- [ ] GraphQL support
- [ ] Message queue integration
- [ ] Distributed tracing
- [ ] Service mesh for microservices
