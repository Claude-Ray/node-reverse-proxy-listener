import http from 'http';
import request from 'supertest';

import server from '../src';

function createServer(port: number) {
  const onRequest: http.RequestListener = (req, res) => {
    const { headers, method, url } = req;
    res.statusCode = 200;
    res.statusMessage = 'hello claude';
    res.setHeader('Content-Type', 'application/json');
    const data = { headers, method, url, port };
    res.end(JSON.stringify(data));
  };
  return http.createServer(onRequest).listen(port);
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let servers: http.Server[];

beforeAll(async () => {
  servers = [8081, 8082, 8083].map(port => createServer(port));
  await sleep(1000);
});

afterAll(() => {
  servers.map(s => s.close());
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
