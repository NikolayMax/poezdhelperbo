# ========== BASE STAGE (общие зависимости) ==========
FROM node:20-alpine as base
WORKDIR /app
COPY package*.json ./
COPY jest*.config.js ./
COPY tsconfig.json ./
RUN npm install
COPY . .

# ========== DEVELOPMENT STAGE ==========
FROM base as development
RUN npm install
CMD ["npm", "run", "dev"]

# ========== TEST STAGE ==========
FROM base as test
RUN npm install
CMD ["npm", "run", "test"]

# ========== WATCH TEST STAGE ==========
FROM test as watch-test
CMD ["npm", "run", "test:watch"]

# ========== UNIT TEST STAGE ==========
FROM test as unit-test
CMD ["npm", "run", "test:unit"]

# ========== INTEGRATION TEST STAGE ==========
FROM test as integration-test
CMD ["npm", "run", "test:integration"]

# ========== E2E TEST STAGE ==========
FROM test as e2e-test
CMD ["npm", "run", "test:e2e"]

# ========== PRODUCTION BUILD STAGE ==========
FROM base as build-stage
RUN npm run build

# ========== PRODUCTION STAGE ==========
FROM node:18-alpine as production
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=build-stage /app/dist ./dist
COPY --from=build-stage /app/public ./public
USER node
CMD ["node", "dist/server.js"]