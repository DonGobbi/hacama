# ---- build stage ----
FROM mirror.gcr.io/library/node:22-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json nest-cli.json ./
COPY src ./src
RUN npm run build

# ---- runtime stage ----
FROM mirror.gcr.io/library/node:22-slim
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
EXPOSE 8080
CMD ["node", "dist/main"]
