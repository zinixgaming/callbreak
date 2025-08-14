const { promisify } = require('util');

class RedisCommands {
  public KEY: any;
  public SET: any;
  public SORTEDSET: any;
  public QUEUE: any;
  public HASH: any;

  constructor(redisClient: any) {
    this.KEY = {
      set: promisify(redisClient.set).bind(redisClient),
      setex: promisify(redisClient.setex).bind(redisClient),
      get: promisify(redisClient.get).bind(redisClient),
      mset: promisify(redisClient.mset).bind(redisClient),
      delete: promisify(redisClient.del).bind(redisClient),
      setnx: promisify(redisClient.setnx).bind(redisClient),
      pexpire: promisify(redisClient.pexpire).bind(redisClient),
      incr: promisify(redisClient.incr).bind(redisClient),
      decr: promisify(redisClient.decr).bind(redisClient),
    };

    this.SET = {
      add: promisify(redisClient.sadd).bind(redisClient),
      rem: promisify(redisClient.srem).bind(redisClient),
    };

    this.SORTEDSET = {
      add: promisify(redisClient.zadd).bind(redisClient),
      rem: promisify(redisClient.zrem).bind(redisClient),
    };

    this.QUEUE = {
      push: promisify(redisClient.rpush).bind(redisClient),
      pop: promisify(redisClient.lpop).bind(redisClient),
      peek: promisify(redisClient.lrange).bind(redisClient),
      lindex : promisify(redisClient.lindex).bind(redisClient),
      llen : promisify(redisClient.llen).bind(redisClient),
      lrem : promisify(redisClient.lrem).bind(redisClient)
    };

    this.HASH = {
      hset: promisify(redisClient.hset).bind(redisClient),
      hget: promisify(redisClient.hget).bind(redisClient),
      hdel: promisify(redisClient.hdel).bind(redisClient),
      hmset: promisify(redisClient.hmset).bind(redisClient),
      hmget: promisify(redisClient.hmget).bind(redisClient),
      hgetall: promisify(redisClient.hgetall).bind(redisClient),
    };
  }
}

export = RedisCommands;
