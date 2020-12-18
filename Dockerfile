FROM node:12.18.4-stretch

WORKDIR /app

COPY ./package.json /app
COPY ./package-lock.json /app
RUN npm ci

COPY ./ /app

ENTRYPOINT ["node", "index.js"]
