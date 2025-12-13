FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
ENV PORT=3004
EXPOSE 3004
CMD ["node","server.js"]
