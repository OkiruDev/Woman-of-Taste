FROM node:22-slim
WORKDIR /app

RUN npm install -g pnpm@10.15.1

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY api-server/package.json ./api-server/package.json
COPY woman-of-taste/package.json ./woman-of-taste/package.json
COPY mockup-sandbox/package.json ./mockup-sandbox/package.json
COPY lib ./lib

RUN pnpm install --ignore-scripts --frozen-lockfile

COPY . .
RUN pnpm run build

EXPOSE 3000
CMD ["node", "api-server/dist/index.cjs"]
