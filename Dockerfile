FROM node:22-slim
WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3600
ENV NODE_ENV=production
RUN sh ./puppeteer.sh
CMD ["node", "dist/main.js"]
