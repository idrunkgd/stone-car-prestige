# syntax=docker/dockerfile:1

# ---------- Étape 1 : dépendances ----------
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---------- Étape 2 : build ----------
FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---------- Étape 3 : image d'exécution (légère) ----------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# curl : requis par le healthcheck de Coolify (et gère le repli IPv4,
# contrairement au wget minimal d'Alpine qui échoue sur localhost/IPv6).
RUN apk add --no-cache curl

# Utilisateur non-root
RUN addgroup -g 1001 -S nodejs && adduser -u 1001 -S nextjs -G nodejs

# Sortie "standalone" de Next : serveur minimal + dépendances tracées (dont pg)
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

USER nextjs
EXPOSE 3000

# Healthcheck interne (vise 127.0.0.1 explicitement pour éviter l'IPv6).
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=5 \
  CMD curl -fsS http://127.0.0.1:3000/api/health || exit 1

# server.js est généré par `output: "standalone"`
CMD ["node", "server.js"]
