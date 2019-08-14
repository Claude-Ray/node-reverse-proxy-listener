export interface UpstreamServer {
  server: string;
  weight?: number;
}

export type Selector = (servers: UpstreamServer[]) => (() => string);

/**
 * round robin
 */
export const rr: Selector = servers => {
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
export const swrr: Selector = servers => {
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

/**
 * linux virtual server
 * http://kb.linuxvirtualserver.org/wiki/Weighted_Round-Robin_Scheduling
 */
export const lvs: Selector = servers => {
  const n = servers.length;
  const weights = servers.map(({ weight }) => weight || 1);
  const gcdWeight = gcd(weights);
  const maxWeight = Math.max(...weights);
  let cw = 0;
  let i = -1;
  return () => {
    while (true) {
      i = (i + 1) % n;
      if (i === 0) {
        cw -= gcdWeight;
        if (cw <= 0) {
          cw = maxWeight;
          if (cw === 0) {
            return 'null';
          }
        }
      }
      if (weights[i] >= cw) {
        return servers[i].server;
      }
    }
  };
};

/**
 * greatest common divisor
 */
function gcd(arr: number[]) {
  let result = arr[0];
  for (let i = 1; i < arr.length; i++) {
    let b = arr[i];
    while (true) {
      if (result <= b) {
        [result, b] = [b, result];
      }
      const s = result % b;
      result = b;
      b = s;
      if (s === 0) {
        break;
      }
    }
  }
  return result;
}

const getSelector: Selector = servers => {
  const isWeighted = servers.some((server: string | UpstreamServer) =>
    typeof server === 'object' && server.weight && server.weight > 1);

  return isWeighted
    ? swrr(servers)
    : rr(servers);
};

export default getSelector;
