FROM node:alpine
WORKDIR /api-gateway
COPY ./package.json .
RUN yarn install
COPY . .
CMD ["npm", "run", "start"]