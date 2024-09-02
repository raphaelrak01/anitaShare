import { Logger } from '@nestjs/common';

export function Profile() {
  return function (target: any, key: string, descriptor: PropertyDescriptor) {
    const logger = new Logger(Profile.name);
    const originalMethod = descriptor.value;
    const className = target.constructor.name;

    descriptor.value = function (...args: any[]) {
      // logger.log(`■ Start  [ ${className}.${key} ]`);
      const startMethodTime = process.hrtime.bigint();
      const result = originalMethod.apply(this, args);
      const endMethodTime = process.hrtime.bigint();
      const methodElapsedTime = Number(endMethodTime - startMethodTime) / 1e6; // Convert nanoseconds to milliseconds

      logger.log(
        `➔➔➔ Method [ ${className}.${key} ] executed in —— ${methodElapsedTime} ms ——`,
      );

      return result;
    };

    return descriptor;
  };
}
