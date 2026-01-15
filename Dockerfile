# syntax=docker/dockerfile:1

FROM node:24-alpine
WORKDIR /app

RUN chown node:node /app

COPY --chown=node:node package*.json ./
RUN npm install --no-audit --no-fund
COPY --chown=node:node . .

USER node

EXPOSE 4200
CMD ["sh", "-c", "TMP_ENV=/tmp/env.js.$$; { printf 'window.__env = window.__env || {};\\nwindow.__env.API_BASE_URL = \"%s\";\\n' \"${API_BASE_URL:-}\"; if [ -f /app/public/env.js ]; then cat /app/public/env.js; fi; } > \"$TMP_ENV\" && mv \"$TMP_ENV\" /app/public/env.js && ng serve --host 0.0.0.0 --port 4200 --allowed-hosts \"${FRONTEND_HOST:-localhost}\""]
