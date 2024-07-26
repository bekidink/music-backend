
FROM node:slim


WORKDIR /usr/src/app


COPY package*.json ./


RUN npm ci

COPY . .

EXPOSE 8000

CMD ["npm", "run", "dev"]
