import getSelector from '../src/selector';

const servers = [
  { server: 'a' },
  { server: 'b' },
  { server: 'c' }
];

const weightedServers = [
  { server: 'a', weight: 5 },
  { server: 'b', weight: 1 },
  { server: 'c', weight: 1 },
];

describe('get selector', () => {
  it('load balance', () => {
    const selector = getSelector(servers);
    const result = Array.from({ length: servers.length }).map(selector);
    expect(result.join('')).toEqual('abc');
  });
  it('smooth weighted load balance', () => {
    const totalWeight = weightedServers.reduce((total, opts) => total + opts.weight, 0);
    const selector = getSelector(weightedServers);
    const result = Array.from({ length: totalWeight }).map(selector);
    expect(result.join('')).toEqual('aabacaa');
  });
});
