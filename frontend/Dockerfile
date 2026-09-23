# ---- build stage ----
FROM mirror.gcr.io/library/node:22-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# NEXT_PUBLIC_* is inlined by `next build` — set it here, not at runtime.
ARG NEXT_PUBLIC_API_URL=https://hacama-api-370098605562.africa-south1.run.app/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

# ---- runtime stage ----
FROM mirror.gcr.io/library/node:22-slim
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.ts ./next.config.ts
EXPOSE 8080
CMD ["npm", "start"]
