FROM node:16
RUN mkdir -p ./app && chown node ./app
WORKDIR /app
COPY package*.json .

RUN npm install

COPY --chown=node:node . .
EXPOSE 80
CMD npm run
