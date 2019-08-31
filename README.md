# Reverse Proxy Listener

[![Build Status](https://travis-ci.org/Claude-Ray/node-reverse-proxy-listener.svg?branch=master)](https://travis-ci.org/Claude-Ray/node-reverse-proxy-listener)

Simple load balancing reverse proxy RequestListener based on pure Node.js.

WARNNING: Do not use this development listener in a production environment!

## API
- reverse-proxy-listener([UpstreamServers]) => http.RequestListener

```js
interface UpstreamServer {
  server: string; // the address of remote server, as the backend.
  weight?: number; // the weight of the server, by default, 1.
}
```

## Usage

```js
// config.js
module.exports = [
  { server: '127.0.0.1:8081', weight: 5 },
  { server: '127.0.0.1:8082', weight: 1 },
  { server: '127.0.0.1:8083', weight: 1 }
]
```

As a server.

```js
const http = require('http');

const createRPL = require('reverse-proxy-listner');
const config = require('./config');
const proxyListener = createRPL(config);

const server = http
  .createServer(proxyListener)
  .listen(8080);
```

As a middleware.

```js
const Koa = require('koa');
const Router = require('koa-router');

const createRPL = require('reverse-proxy-listner');
const config = require('./config');
const proxyListener = createRPL(config);

const app = new Koa();
const router = new Router();

router.use('/proxy', (ctx, next) => {
  return proxyListener(ctx.req, ctx.res);
})

app.use(router.routes());
```

