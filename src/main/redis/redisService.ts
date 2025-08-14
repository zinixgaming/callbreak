import {NUMERICAL, REDIS} from '../../constants';

const {PREFIX} = REDIS;

class RedisService {
  public redisCommand: any;

  constructor(redisCommand: any) {
    this.redisCommand = redisCommand;
  }

  async setValueInKey(key: any, obj: any) {
    return this.redisCommand.KEY.set(key, JSON.stringify(obj));
  }

  async setValueInKeyWithExpiry(key: any, obj: any, exp = NUMERICAL.ONE_HOUR) {
    return this.redisCommand.KEY.setex(key, exp, JSON.stringify(obj));
  }

  async getValueFromKey(key: any) {
    const valueStr = await this.redisCommand.KEY.get(key);
    return JSON.parse(valueStr);
  }

  /* Hash set queries */
  async setValueInHashKeyField(key: any, field: any, value: any) {
    const hashKey = `${PREFIX.HASH}:${key}`;
    const hashData = await this.redisCommand.HASH.hset(
      hashKey,
      field,
      JSON.stringify(value),
    );
    return hashData;
  }

  async getValueFromHashKeyFeild(key: any, field: any) {
    const hashKey = `${PREFIX.HASH}:${key}`;
    const resStr = await this.redisCommand.HASH.hget(hashKey, field);
    return JSON.parse(resStr) || {};
  }

  async getAllValueFromHashKeyFeild(key: any) {
    const hashKey = `${PREFIX.HASH}:${key}`;
    const resStr = await this.redisCommand.HASH.hgetall(hashKey);
    return resStr;
    // return JSON.parse(resStr) || {};
  }

  /* list queries */
  async pushIntoQueue(key: any, element: any) {
    return this.redisCommand.QUEUE.push(
      `${PREFIX.QUEUE}:${key}`,
      JSON.stringify(element),
    );
  }

  async popFromQueue(key: any) {
    const resStr = await this.redisCommand.QUEUE.pop(`${PREFIX.QUEUE}:${key}`);
    return JSON.parse(resStr);
  }

  async remFromQueue(key: any, tableId: string) {
    const resStr = await this.redisCommand.QUEUE.lrem(
      `${PREFIX.QUEUE}:${key}`,
      `${NUMERICAL.ZERO}`,
      JSON.stringify(tableId),
    );
    return JSON.parse(resStr);
  }

  async getValueFromIndexFromQueue(key: any, index: number) {
    const resStr = await this.redisCommand.QUEUE.lindex(
      `${PREFIX.QUEUE}:${key}`,
      index,
    );
    return JSON.parse(resStr);
  }

  async getLengthfromQueue(key: any) {
    const resStr = await this.redisCommand.QUEUE.llen(`${PREFIX.QUEUE}:${key}`);
    console.log('resStr :>>>> ', resStr);
    return JSON.parse(resStr);
  }

  async deleteKey(Key: any) {
    return this.redisCommand.KEY.delete(Key);
  }

  async setIncrementCounter(key: any) {
    return this.redisCommand.KEY.incr(key);
  }

  async setDecrementCounter(key: any) {
    return this.redisCommand.KEY.decr(key);
  }

  async setValueInKeyWithExpiryTime(key: any, obj: any, exp: number) {
    return this.redisCommand.KEY.setex(key, exp, JSON.stringify(obj));
  }
}

export = RedisService;
