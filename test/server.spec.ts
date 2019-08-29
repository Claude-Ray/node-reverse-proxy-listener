import http from 'http';
import request from 'supertest';

import config from './config';
import createProxy from '../src';

const proxyListener = createProxy(config.servers);

const server = http.createServer(proxyListener);

function createServer(port: number) {
  const requestListener: http.RequestListener = (req, res) => {
    const { headers, method, url } = req;
    res.statusCode = 200;
    res.statusMessage = 'hello claude';
    res.setHeader('Content-Type', 'application/json');
    const data = { headers, method, url, port };
    res.end(JSON.stringify(data));
  };
  const s = http.createServer(requestListener);
  return new Promise(resolve => s.listen(port, () => resolve(s)));
}

let servers: http.Server[] = [];

beforeAll(async () => {
  await new Promise(resolve => server.listen(config.listen, resolve));
  servers = await Promise.all([8081, 8082, 8083].map(port => createServer(port))) as http.Server[];
});

afterAll(() => {
  servers.map(s => s.close());
  server.close();
});

describe('server', () => {
  it('GET proxy', () => {
    return request(server)
      .get('/get')
      .then(res => {
        expect(res.status).toBe(200);
        expect(res.type).toBe('application/json');
        expect(res.body).toHaveProperty('port', 8081);
        expect(res.body).toHaveProperty('method', 'GET');
      });
  });
  it('POST proxy', () => {
    return request(server)
      .post('/post')
      .then(res => {
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('port');
        expect(res.body).toHaveProperty('method', 'POST');
      });
  });
});
