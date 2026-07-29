FROM node:22-alpine

ARG APP_VERSION=dev

LABEL org.opencontainers.image.title="Todo List API"
LABEL org.opencontainers.image.description="API REST para gestionar tareas por usuario"
LABEL org.opencontainers.image.version="${APP_VERSION}"
LABEL org.opencontainers.image.source="https://github.com/Graderd/Todo-List"

ENV NODE_ENV=production

WORKDIR /app

COPY --chown=node:node package.json package-lock.json ./

RUN npm ci --omit=dev \
    && npm cache clean --force

COPY --chown=node:node . .

USER node

EXPOSE 3000

CMD ["npm", "start"]
