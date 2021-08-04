FROM node:14-buster-slim as build-frontend
WORKDIR /app
COPY package.json ./
COPY yarn.lock ./
RUN yarn install
COPY ./app .
RUN yarn build

FROM node:14-buster-slim
WORKDIR /api
COPY package.json ./
COPY yarn.lock ./
RUN yarn install
RUN yarn build
COPY --from=build-stage /app/dist .
ENTRYPOINT [ "yarn start" ]