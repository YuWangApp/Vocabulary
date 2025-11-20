# Volcabulary

A full-stack TypeScript monorepo with Next.js, tRPC, and WebSocket support.

## Project Structure

```
├── apps/
│   ├── web/          # Next.js frontend with tRPC client
│   └── server/       # Backend server with tRPC, REST, and WebSocket
├── packages/
│   ├── types/        # Shared TypeScript types
│   └── config/       # Shared configuration (tsconfig, eslint, etc.)
└── services/         # Future services (Python, Go, etc.)
```

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, tRPC Client
- **Backend**: Node.js, tRPC Server, Express, WebSocket (ws)
- **Build System**: Turborepo, pnpm workspaces
- **Language Support**: TypeScript, Python, Go (extensible)

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm >= 8

### Installation

```bash
pnpm install
```

### Development

```bash
# Run all apps in development mode
pnpm dev

# Run specific app
pnpm --filter web dev
pnpm --filter server dev
```

### Build

```bash
pnpm build
```

## Adding New Services

The monorepo is designed to support services in different languages:

1. Create a new directory in `services/` (e.g., `services/python-service`)
2. Add your service with its own dependencies and configuration
3. Update `turbo.json` if needed for build orchestration
