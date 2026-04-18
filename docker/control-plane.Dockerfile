# Dockerfile - Control Plane
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --prefer-offline

COPY . .
RUN npm run build

EXPOSE 8090

ENV PORT=8090
ENV NODE_ENV=production

CMD ["npm", "run", "dev:control-plane"]