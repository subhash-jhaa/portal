FROM node:22-alpine3.24 AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine3.24 AS builder
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_API_BASE_URL=/api
ARG NEXT_PUBLIC_ENABLE_MOCKS=true
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_ENABLE_MOCKS=$NEXT_PUBLIC_ENABLE_MOCKS
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM alpine:3.24 AS runner
RUN apk add --no-cache libstdc++ ca-certificates
COPY --from=dependencies /usr/local/bin/node /usr/local/bin/node
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
RUN mkdir -p /app/.mock-data && chown nextjs:nodejs /app/.mock-data
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
