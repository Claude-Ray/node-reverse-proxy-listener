import { rr, swrr, lvs, Selector, UpstreamServer } from '../src/selector';

const servers = [
  { server: 'a' },
  { server: 'b' },
  { server: 'c' }
];

const weightedServers1 = [
  { server: 'a', weight: 5 },
  { server: 'b', weight: 1 },
  { server: 'c', weight: 1 },
];
const weightedServers2 = [
  { server: 'a', weight: 4 },
  { server: 'b', weight: 3 },
  { server: 'c', weight: 2 },
];

describe('get selector', () => {
  it('load balance', () => {
    const result = select(rr, servers);
    expect(result).toEqual('abc');
  });
  it('smooth weighted load balance', () => {
    const result = select(swrr, weightedServers1);
    expect(result).toEqual('aabacaa');
  });
  it('lvs weighted load balance', () => {
    const result = select(lvs, weightedServers2);
    expect(result).toEqual('aababcabc');
  });
});

function select(fn: Selector, arr: UpstreamServer[]) {
  const selector = fn(arr);
  const totalWeight = arr.reduce((total, opts) => total + (opts.weight || 1), 0);
  return Array.from({ length: totalWeight })
    .map(selector)
    .join('');
}
