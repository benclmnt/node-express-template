FROM node:13.12.0-alpine

#RUN apk add --update git
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json ./
RUN npm install
COPY . .

EXPOSE 3010
CMD ["npm", "start"]
