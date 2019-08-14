export default {
  listen: 8080,
  server: [
    { server: '127.0.0.1:8081', weight: 5 },
    { server: '127.0.0.1:8082', weight: 1 },
    { server: '127.0.0.1:8083', weight: 1 },
  ],
};
