FROM node:14.16.0-alpine
WORKDIR /usr/app
COPY ./app/package.json ./
RUN npm install
COPY ./app/*.js ./
EXPOSE 80
RUN mkdir data
CMD ["npm", "start"]
