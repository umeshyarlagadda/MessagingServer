import { createClient, RedisClientType } from "redis";

let cacheClient: RedisClientType;
export let redisServerURL: string;

export function connectRedis() {
    cacheClient = createClient({
        password: 'EYGOfLVV3GSRg5Ge8jNCUcLx9Gpys6VT',
        socket: {
            host: 'redis-11817.c281.us-east-1-2.ec2.cloud.redislabs.com',
            port: 11817
        }
    });
    
    cacheClient.connect();
    cacheClient.on('connect', function () {
        console.log("Redis Client Connected Successfully...");
    });
    cacheClient.on('error', function (err) {
        console.log(`Something went wrong...Redis Client Couldn't Connect...trying to reconnect...${err}`);
    });
}

function getCacheClient() {
    if ((cacheClient == null) || (cacheClient.isOpen == false)) {
        connectRedis();
        return null;
    } else {
        if (cacheClient.isOpen) {
            return cacheClient;
        } else {
            return null;
        }
    }
}

export async function Get(keyName: string) {
    try {
        if (getCacheClient() == null) {
            return null;
        }
        const cacheResult = await cacheClient.get(keyName);
        if (cacheResult) {
            const resultJSON = JSON.parse(cacheResult);
            return resultJSON;
        } else {
            return null;
        }
    } catch (error) {
        console.log(error);
        return null;
    }
}

export function Set(keyName: string, value: any) {
    if (getCacheClient() == null) {
        return null;
    }
    cacheClient.set(keyName, JSON.stringify(value));
    return true;
}

export function Del(keyName: string) {
    if (getCacheClient() == null) {
        return null;
    }
    cacheClient.del(keyName);
    return true;
}
