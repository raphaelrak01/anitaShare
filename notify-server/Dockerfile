FROM node:20.5.1-alpine3.18

WORKDIR /usr/src/app
COPY package*.json ./
RUN apk add --no-cache make gcc g++ python3

RUN npm install
COPY . .
RUN npm run build


EXPOSE 8080
CMD ["npm", "run", "start:prod"]
