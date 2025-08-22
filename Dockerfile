# ---- Base Stage ----
FROM node:20-alpine AS base
WORKDIR /usr/src/app

# ---- Dependencies Stage ----
FROM base AS dependencies
# Install only production dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ---- Build Stage ----
FROM base AS builder
# Install all dependencies (including dev)
COPY package.json package-lock.json ./
RUN npm ci
# Copy all source code (including the 'views' folder)
COPY . .
RUN npm run build

# ---- Runner Stage (Final Image) ----
FROM base AS runner
# Copy production dependencies from the 'dependencies' stage
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
# Copy the built application from the 'builder' stage
COPY --from=builder /usr/src/app/dist ./dist

# FIX: COPY THE VIEWS AND TEMPLATES DIRECTORIES
COPY --from=builder /usr/src/app/views ./views
# NOTE: Your templates are inside the views folder, so the above line is sufficient.
# If you had a separate 'templates' folder at the root, you would copy it too.

# The port your app listens on inside the container
EXPOSE 3000

# The command to start the application
CMD [ "node", "dist/main" ]