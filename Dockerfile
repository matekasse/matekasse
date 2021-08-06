FROM node:14-buster-slim as build-frontend

COPY package.json ./
COPY yarn.lock ./

WORKDIR /app

COPY ./app/package.json .
RUN yarn install --network-timeout 600000

COPY ./app .
RUN yarn build


FROM node:14-buster-slim

RUN apt update && \
    apt upgrade -y

COPY package.json ./
COPY yarn.lock ./

WORKDIR /api
COPY ./api/package.json .
RUN yarn install --network-timeout 600000

COPY ./api .
RUN yarn build

COPY --from=build-frontend /app/dist ./public
ENTRYPOINT [ "yarn", "start" ]
