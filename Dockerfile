FROM node:alpine
WORKDIR /api-gateway
COPY ./package.json .
RUN npm install
COPY . .
CMD ["npm", "run", "start"]