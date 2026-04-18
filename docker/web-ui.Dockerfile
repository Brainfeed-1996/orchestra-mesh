# Dockerfile - Web UI
FROM node:20-alpine

WORKDIR /app

COPY apps/web-ui/package*.json ./apps/web-ui/
COPY packages/event-store/package*.json ./packages/event-store/
COPY packages/state-machine/package*.json ./packages/state-machine/

WORKDIR /app/apps/web-ui
RUN npm install --prefer-offline

COPY apps/web-ui/ .
RUN npm run build

EXPOSE 3000

ENV UI_PORT=3000
ENV NODE_ENV=production

CMD ["npm", "start"]