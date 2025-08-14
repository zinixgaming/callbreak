import { grpcRequestsMapIF } from '../interface/grpcIf';

const grpcRequestsMap: grpcRequestsMapIF = {};

(global as any).grpcRequestsMap = grpcRequestsMap;

function incr(key: string): number {
  if (grpcRequestsMap[key]) grpcRequestsMap[key] += 1;
  else grpcRequestsMap[key] = 1;

  return grpcRequestsMap[key];
}

function decr(key: string): number {
  if (grpcRequestsMap[key]) grpcRequestsMap[key] -= 1;

  return grpcRequestsMap[key];
}

const getGrpcRequestsMap = () => grpcRequestsMap;
const exportObject = { incr, decr, getGrpcRequestsMap };
export = exportObject;
