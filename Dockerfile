FROM node:10-alpine as build
WORKDIR /src
COPY package.json /src
RUN npm install && npm audit fix
COPY . /src
EXPOSE 3000
ENTRYPOINT ["/src/deploy.sh"]