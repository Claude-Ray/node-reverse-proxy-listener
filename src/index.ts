import http from 'http';
import config from './config';
import selector from './selector';

const logger = console;

const keepAliveAgent = new http.Agent({
  keepAlive: true,
  timeout: 10000
});

const getNextServer = selector(config.server);

const proxyListener: http.RequestListener = (req, res) => {
  const { method, headers, url } = req;
  const [host, port] = getNextServer().split(':');
  const options = {
    agent: keepAliveAgent,
    path: url,
    host,
    port,
    method,
    headers
  };

  const remoteReq = http.request(options, remoteRes => {
    res.writeHead(remoteRes.statusCode || 200, remoteRes.statusMessage, remoteRes.headers);
    remoteRes.pipe(res);
  });
  req.pipe(remoteReq);
};

const server = http.createServer(proxyListener);

server.listen(config.listen, () => {
  logger.info(`server started on ${config.listen}`);
});

export default server;
