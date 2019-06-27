FROM node:alpine
WORKDIR /api-gateway
COPY ./package.json .
RUN yarn install
COPY . .
CMD ["yarn", "run", "start"]