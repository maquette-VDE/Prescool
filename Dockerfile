# syntax=docker/dockerfile:1

FROM node:24-alpine
WORKDIR /app

RUN chown node:node /app

COPY --chown=node:node package*.json ./
RUN npm install --no-audit --no-fund
COPY --chown=node:node . .
RUN chmod +x /app/entrypoint.sh

USER node

EXPOSE 4200
CMD ["/app/entrypoint.sh"]
