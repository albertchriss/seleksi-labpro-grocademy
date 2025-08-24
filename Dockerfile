# ---- Base Stage ----
FROM node:20-slim AS base
WORKDIR /usr/src/app

# ---- Dependencies Stage ----
FROM base AS dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ---- Build Stage ----
FROM base AS builder
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Runner Stage (Final Image) ----
FROM node:20-slim AS runner

# Install wkhtmltopdf and fonts
RUN apt-get update && apt-get install -y \
    wkhtmltopdf \
    fontconfig \
    libxrender1 \
    libxext6 \
    libjpeg62-turbo \
    xfonts-base \
    xfonts-75dpi \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY --from=dependencies /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/views ./views
COPY --from=builder /usr/src/app/public ./public

EXPOSE 3000

CMD ["node", "dist/main"]
