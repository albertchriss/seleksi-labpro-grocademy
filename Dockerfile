# ---- Base Stage ----
FROM node:20-slim AS base
WORKDIR /usr/src/app

ENV PUPPETEER_CACHE_DIR=/usr/src/app/node_modules/.puppeteer_cache

# ---- Dependencies & Browser Stage ----
FROM base AS dependencies
# Install system dependencies required by Puppeteer to run Chromium
RUN apt-get update && apt-get install -y \
  ca-certificates \
  fonts-liberation \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcairo2 \
  libcups2 \
  libdbus-1-3 \
  libexpat1 \
  libfontconfig1 \
  libgbm1 \
  libglib2.0-0 \
  libgtk-3-0 \
  libnspr4 \
  libnss3 \
  libpango-1.0-0 \
  libpangocairo-1.0-0 \
  libx11-6 \
  libx11-xcb1 \
  libxcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxext6 \
  libxfixes3 \
  libxi6 \
  libxrandr2 \
  libxrender1 \
  libxss1 \
  libxtst6 \
  lsb-release \
  wget \
  xdg-utils \
  --no-install-recommends

# Install all npm dependencies, including devDependencies to get the puppeteer CLI
COPY package.json package-lock.json ./
RUN npm ci

# ---- Build Stage ----
FROM dependencies AS builder
# Copy source code and build the application
COPY . .
RUN npm run build

# ---- Runner Stage (Final Image) ----
FROM base AS runner
# Install only the RUNTIME system dependencies to keep the image smaller
RUN apt-get update && apt-get install -y \
  libnss3 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libcups2 \
  libgbm1 \
  libasound2 \
  libpango-1.0-0 \
  libpangocairo-1.0-0 \
  libxshmfence1 \
  --no-install-recommends

# Create a non-root user for security
RUN groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser
USER pptruser

# Copy necessary files from previous stages
COPY --from=builder --chown=pptruser:pptruser /usr/src/app/node_modules ./node_modules
COPY --from=builder --chown=pptruser:pptruser /usr/src/app/dist ./dist
COPY --from=builder --chown=pptruser:pptruser /usr/src/app/views ./views
COPY --from=builder --chown=pptruser:pptruser /usr/src/app/public ./public

EXPOSE 3000

# Tell puppeteer where to find the browser and disable sandboxing (required in containers)
CMD [ "node", "dist/main" ]
