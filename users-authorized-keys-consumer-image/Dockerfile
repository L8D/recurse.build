FROM alpine:3.7
RUN apk add --no-cache nodejs

WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm install
COPY . .
ENTRYPOINT ["node"]
