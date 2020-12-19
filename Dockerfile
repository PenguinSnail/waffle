FROM node:current-alpine

WORKDIR /app

RUN apk --update --no-cache add imagemagick \
    msttcorefonts-installer fontconfig && \
    update-ms-fonts && \
    fc-cache -f


COPY ./package.json /app
COPY ./package-lock.json /app
RUN npm ci

COPY ./ /app

ENTRYPOINT ["node", "index.js"]
