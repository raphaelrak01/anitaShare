import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { createClient } from 'redis';
import { RedisData } from './interfaces/redis-data.interface';
import { environnement } from 'src/common/environnement';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client ;

  async onModuleInit() {
    this.client = createClient({
      url: `redis://${environnement().redis.host}:${environnement().redis.port.toString()}`,
    });

    this.client.on('connect', () => {
      this.logger.log('Connecting to Redis...');
    });

    this.client.on('ready', () => {
      this.logger.log('Redis client connected');
    });

    this.client.on('error', (err) => {
      this.handleRedisError(err);
    });

    try {
      await this.client.connect();
    } catch (error) {
      this.handleRedisError(error);
    }
  }

  onModuleDestroy() {
    this.client.quit();
  }

  getClient() {
    return this.client;
  }

  async set(key: string, value: RedisData): Promise<void> {
    this.logger.debug(`Setting key: ${key} with value: ${JSON.stringify(value)}`);
    try {
      await  this.client.set(key, JSON.stringify(value));
      this.logger.debug(`Key ${key} set successfully`);
    } catch (error) {
      this.logger.error(`Failed to set key: ${key}`, error.stack);
      throw new InternalServerErrorException(error);
    }
  }

  async get(key: string): Promise<RedisData> {
    this.logger.debug(`Getting value for key: ${key}`);
    try {
      const value = await this.client.get(key);
      this.logger.debug(`Retrieved value: ${value} for key: ${key}`);
      return value ? JSON.parse(value) : {};
    } catch (error) {
      this.logger.error(`Failed to get key: ${key}`, error.stack);
      throw new InternalServerErrorException(error);
    }
  }

  private handleRedisError(error: any) {
    let lastError;
    if (error.errors && error.errors.length > 0) {
      lastError = error.errors[error.errors.length - 1];
    }
    this.logger.error('Redis error:', lastError ?? error);
  }
}
