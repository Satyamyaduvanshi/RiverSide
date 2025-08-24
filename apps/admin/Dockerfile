# Stage 1: Install dependencies
FROM node:20-slim AS dependencies
WORKDIR /usr/src/app
COPY package.json pnpm-lock.yaml .npmrc ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Stage 2: Build the specific service
FROM node:20-slim AS builder
ARG SERVICE_NAME
WORKDIR /usr/src/app
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
COPY . .
RUN npm install -g pnpm # <-- Add this line
RUN npm install -g nx
RUN nx build ${SERVICE_NAME}

# Stage 3: Production image
FROM node:20-slim AS runner
ARG SERVICE_NAME
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/dist/apps/${SERVICE_NAME} .
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist/apps/${SERVICE_NAME}/package.json .

CMD ["node", "main.js"]