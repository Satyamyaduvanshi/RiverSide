# Stage 1: Install dependencies
FROM node:20-slim AS dependencies
WORKDIR /usr/src/app
COPY package.json pnpm-lock.yaml .npmrc ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Stage 2: Build the frontend app
FROM node:20-slim AS builder
WORKDIR /usr/src/app
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
COPY . .
RUN npm install -g nx
RUN nx build frontend

# Stage 3: Production image
FROM node:20-slim AS runner
WORKDIR /usr/src/app

# Copy the standalone output
COPY --from=builder /usr/src/app/dist/apps/frontend/.next/standalone .
# Copy the static assets and public folder
COPY --from=builder /usr/src/app/dist/apps/frontend/.next/static ./.next/static
COPY --from=builder /usr/src/app/apps/frontend/public ./public

ENV PORT=4200
EXPOSE 4200

CMD ["node", "server.js"]