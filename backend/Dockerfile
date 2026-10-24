FROM node:26

RUN mkdir /bingo-app
WORKDIR /bingo-app
COPY package.json .
COPY package-lock.json .
RUN mkdir db
COPY ./db ./db
# COPY server.js .
RUN npm install
EXPOSE 3000
# CMD ["ls", "db"]
CMD ["node", "./server.js"]
