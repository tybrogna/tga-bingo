FROM node:26

RUN mkdir /bingo-app
WORKDIR /bingo-app
COPY package.json .
COPY package-lock.json .
COPY index.html .
COPY vite.config.js .
RUN npm install
EXPOSE 3100
CMD ["npm", "run", "dev"]
