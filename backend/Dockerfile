FROM node:20-alpine3.18
RUN apk add --no-cache openssl1.1-compat

WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN npm i || true

COPY . .
RUN npm run prisma:generate
RUN npm run build

# Run migrations + seed at container start, then start server
CMD node -e "console.log('Waiting for DB...');"   && npx prisma migrate deploy   && node dist/server.js
