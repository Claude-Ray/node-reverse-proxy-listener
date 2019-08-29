import http from 'http';

import selector, { UpstreamServer } from './selector';

const keepAliveAgent = new http.Agent({
  keepAlive: true,
  timeout: 10000
});

export default (servers: UpstreamServer[]) => {
  const getNextServer = selector(servers);

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

  return proxyListener;
};
