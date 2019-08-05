interface UpstreamServer {
  server: string;
  weight?: number;
}

type Selector = (servers: UpstreamServer[]) => (() => string);

/**
 * round robin
 */
const rr: Selector = servers => {
  let index = -1;
  return () => {
    index = index < (servers.length - 1)
      ? index + 1
      : 0;
    return servers[index].server;
  };
};

/**
 * smooth weighted round robin
 * https://github.com/phusion/nginx/commit/27e94984486058d73157038f7950a0a36ecc6e35
 */
const swrr: Selector = servers => {
  const currentWeights = new Array(servers.length).fill(0);
  const weights = servers.map(({ weight }) => weight || 1);
  const total = weights.reduce((count, w) => count + w, 0);
  // TODO: 记录 effective_weight
  return () => {
    let bestIdx = 0;
    for (let i = 0; i < currentWeights.length; i++) {
      currentWeights[i] += weights[i];
      if (currentWeights[bestIdx] < currentWeights[i]) {
        bestIdx = i;
      }
    }
    currentWeights[bestIdx] -= total;
    return servers[bestIdx].server;
  };
};

const getSelector: Selector = servers => {
  const isWeighted = servers.some((server: string | UpstreamServer) =>
    typeof server === 'object' && server.weight && server.weight > 1);

  return isWeighted
    ? swrr(servers)
    : rr(servers);
};

export default getSelector;
