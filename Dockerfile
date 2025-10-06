FROM node:22-slim as builder
WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .
RUN npm run build


FROM node:22-slim
WORKDIR /app
COPY package*.json .
RUN npm install --prod
COPY --from=builder /app/dist ./dist/
COPY --from=builder /app/.env ./
EXPOSE 3600
ENV NODE_ENV=production
CMD ["node", "dist/main.js"]
