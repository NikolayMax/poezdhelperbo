FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
COPY vite.config.ts ./
COPY tsconfig.json ./

RUN npm install

COPY . ./

EXPOSE 3000

CMD ["npm", "run", "dev:run"]

