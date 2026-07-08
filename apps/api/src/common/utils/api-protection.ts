import { logger } from '@matchpulse/logger';

export interface CircuitBreakerOptions {
  threshold: number; // Number of failures before opening
  timeout: number; // Time in ms before attempting to close
  resetTimeout: number; // Time in ms before half-open state
}

export interface RetryOptions {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(private options: CircuitBreakerOptions) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.options.timeout) {
        this.state = 'half-open';
        logger.info('Circuit breaker transitioning to half-open');
      } else {
        throw new Error('Circuit breaker is open');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    if (this.state === 'half-open') {
      this.state = 'closed';
      logger.info('Circuit breaker closed');
    }
  }

  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.options.threshold) {
      this.state = 'open';
      logger.warn('Circuit breaker opened', { failures: this.failures });
    }
  }

  getState() {
    return this.state;
  }
}

export class RetryWithBackoff {
  async execute<T>(fn: () => Promise<T>, options: RetryOptions): Promise<T> {
    let lastError: Error;
    let delay = options.initialDelay;

    for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        logger.warn(`Attempt ${attempt} failed`, { error: lastError.message });

        if (attempt < options.maxAttempts) {
          await this.sleep(delay);
          delay = Math.min(delay * options.backoffMultiplier, options.maxDelay);
        }
      }
    }

    throw lastError!;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export class APIProtector {
  private circuitBreakers = new Map<string, CircuitBreaker>();

  constructor() {
    // Default circuit breaker options
    this.circuitBreakers.set('default', new CircuitBreaker({
      threshold: 5,
      timeout: 60000,
      resetTimeout: 30000,
    }));
  }

  async execute<T>(
    apiName: string,
    fn: () => Promise<T>,
    retryOptions?: RetryOptions
  ): Promise<T> {
    const circuitBreaker = this.circuitBreakers.get(apiName) || this.circuitBreakers.get('default')!;

    const defaultRetryOptions: RetryOptions = {
      maxAttempts: 3,
      initialDelay: 1000,
      maxDelay: 10000,
      backoffMultiplier: 2,
    };

    const retry = new RetryWithBackoff();

    return retry.execute(async () => {
      return circuitBreaker.execute(fn);
    }, retryOptions || defaultRetryOptions);
  }

  addCircuitBreaker(apiName: string, options: CircuitBreakerOptions) {
    this.circuitBreakers.set(apiName, new CircuitBreaker(options));
  }

  getCircuitBreakerState(apiName: string) {
    const cb = this.circuitBreakers.get(apiName);
    return cb?.getState() || 'unknown';
  }
}

// Singleton instance
export const apiProtector = new APIProtector();
