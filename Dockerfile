FROM node:22-alpine
WORKDIR /app

ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable && corepack prepare pnpm@10.15.1 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY api-server/package.json ./api-server/package.json
COPY woman-of-taste/package.json ./woman-of-taste/package.json
COPY mockup-sandbox/package.json ./mockup-sandbox/package.json
COPY scripts/package.json ./scripts/package.json
COPY lib ./lib

RUN pnpm install --ignore-scripts --frozen-lockfile

COPY . .
RUN pnpm run build

EXPOSE 3000
CMD ["node", "api-server/dist/index.cjs"]
