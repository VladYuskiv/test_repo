FROM node:20

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm i
RUN npm i sequelize-cli -g

COPY . .

EXPOSE ${API_PORT}

CMD npm run start:dev
