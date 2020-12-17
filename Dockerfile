FROM node:12.14.1-alpine3.9

RUN apk --no-cache add --virtual native-deps \
	g++ gcc libgcc libstdc++ linux-headers autoconf automake make nasm python git imagemagick ghostscript && \
	npm install --quiet node-gyp -g

WORKDIR /app

COPY ./package.json ./

RUN yarn install

COPY ./ ./

RUN npm run build

EXPOSE 3000

CMD ["node","dist/index.js"]
