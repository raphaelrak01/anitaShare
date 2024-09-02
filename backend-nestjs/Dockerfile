FROM node:20.5.1-alpine3.18
RUN apk add --no-cache curl
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 8080

CMD ["npm", "run", "start:prod"]
