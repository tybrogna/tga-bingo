FROM node:23

RUN mkdir /bingo-app
WORKDIR /bingo-app
COPY . .
RUN npm install
RUN npm run vite-build
CMD ["node", "./server.js"]
