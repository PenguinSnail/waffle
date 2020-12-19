FROM node:current-alpine

WORKDIR /app

RUN apk --update add imagemagick

COPY ./package.json /app
COPY ./package-lock.json /app
RUN npm ci

COPY ./ /app

ENTRYPOINT ["node", "index.js"]
