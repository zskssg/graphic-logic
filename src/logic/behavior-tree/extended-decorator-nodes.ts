import { BehaviorNodeStatus } from './interfaces';
import { DecoratorNode } from './nodes';

/**
 * 重试节点
 * 失败时自动重试指定次数
 */
export class RetryNode extends DecoratorNode {
  private maxRetries: number;
  private currentRetries: number = 0;

  constructor(id: string, maxRetries: number, name: string = 'Retry') {
    super(id, name);
    this.maxRetries = maxRetries;
  }

  public override execute(context: any): BehaviorNodeStatus {
    if (!this.child) {
      this.setStatus(BehaviorNodeStatus.ERROR);
      return BehaviorNodeStatus.ERROR;
    }

    const status = this.child.execute(context);

    switch (status) {
      case BehaviorNodeStatus.SUCCESS:
        this.currentRetries = 0;
        this.setStatus(BehaviorNodeStatus.SUCCESS);
        return BehaviorNodeStatus.SUCCESS;

      case BehaviorNodeStatus.FAILURE:
        this.currentRetries++;
        
        if (this.currentRetries<= this.maxRetries) {
          this.child.reset();
          this.setStatus(BehaviorNodeStatus.RUNNING);
          return BehaviorNodeStatus.RUNNING;
        }
        
        this.currentRetries = 0;
        this.setStatus(BehaviorNodeStatus.FAILURE);
        return BehaviorNodeStatus.FAILURE;

      case BehaviorNodeStatus.RUNNING:
        this.setStatus(BehaviorNodeStatus.RUNNING);
        return BehaviorNodeStatus.RUNNING;

      case BehaviorNodeStatus.ERROR:
        this.currentRetries = 0;
        this.setStatus(BehaviorNodeStatus.ERROR);
        return BehaviorNodeStatus.ERROR;
    }
  }

  public override reset(): void {
    super.reset();
    this.currentRetries = 0;
  }
}

/**
 * 限速节点
 * 限制节点执行频率
 */
export class RateLimiterNode extends DecoratorNode {
  private interval: number;
  private lastExecutionTime: number | null = null;

  constructor(id: string, interval: number, name: string = 'RateLimiter') {
    super(id, name);
    this.interval = interval;
  }

  public override execute(context: any): BehaviorNodeStatus {
    if (!this.child) {
      this.setStatus(BehaviorNodeStatus.ERROR);
      return BehaviorNodeStatus.ERROR;
    }

    const now = Date.now();

    // 如果是第一次执行或已经过了间隔时间
    if (this.lastExecutionTime === null || now - this.lastExecutionTime >= this.interval) {
      this.lastExecutionTime = now;
      const status = this.child.execute(context);
      this.setStatus(status);
      return status;
    }

    // 还在限制时间内，返回RUNNING
    this.setStatus(BehaviorNodeStatus.RUNNING);
    return BehaviorNodeStatus.RUNNING;
  }

  public override reset(): void {
    super.reset();
    this.lastExecutionTime = null;
  }
}

/**
 * 断路器节点
 * 连续失败后暂停执行
 */
export class CircuitBreakerNode extends DecoratorNode {
  private failureThreshold: number;
  private resetTimeout: number;
  private failureCount: number = 0;
  private circuitState: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private openTime: number | null = null;

  constructor(id: string, failureThreshold: number, resetTimeout: number, name: string = 'CircuitBreaker') {
    super(id, name);
    this.failureThreshold = failureThreshold;
    this.resetTimeout = resetTimeout;
  }

  public override execute(context: any): BehaviorNodeStatus {
    if (!this.child) {
      this.setStatus(BehaviorNodeStatus.ERROR);
      return BehaviorNodeStatus.ERROR;
    }

    const now = Date.now();

    // 检查断路器状态
    switch (this.circuitState) {
      case 'OPEN':
        // 检查是否可以重置
        if (this.openTime && now - this.openTime >= this.resetTimeout) {
          this.circuitState = 'HALF_OPEN';
          // 继续执行HALF_OPEN逻辑
        } else {
          this.setStatus(BehaviorNodeStatus.FAILURE);
          return BehaviorNodeStatus.FAILURE;
        }
        // 继续到HALF_OPEN逻辑
        break;

      case 'HALF_OPEN':
        // 尝试执行一次
        const status = this.child.execute(context);
        
        if (status === BehaviorNodeStatus.SUCCESS) {
          this.circuitState = 'CLOSED';
          this.failureCount = 0;
          this.setStatus(BehaviorNodeStatus.SUCCESS);
          return BehaviorNodeStatus.SUCCESS;
        } else {
          this.circuitState = 'OPEN';
          this.openTime = now;
          this.setStatus(BehaviorNodeStatus.FAILURE);
          return BehaviorNodeStatus.FAILURE;
        }

      case 'CLOSED':
        const result = this.child.execute(context);
        
        if (result === BehaviorNodeStatus.FAILURE) {
          this.failureCount++;
          
          if (this.failureCount >= this.failureThreshold) {
            this.circuitState = 'OPEN';
            this.openTime = now;
            this.setStatus(BehaviorNodeStatus.FAILURE);
            return BehaviorNodeStatus.FAILURE;
          }
        } else {
          this.failureCount = 0;
        }
        
        this.setStatus(result);
        return result;
    }

    // 默认返回FAILURE
    this.setStatus(BehaviorNodeStatus.FAILURE);
    return BehaviorNodeStatus.FAILURE;
  }

  public override reset(): void {
    super.reset();
    this.failureCount = 0;
    this.circuitState = 'CLOSED';
    this.openTime = null;
  }
}

/**
 * 延迟重试节点
 * 带延迟的重试机制
 */
export class DelayedRetryNode extends DecoratorNode {
  private maxRetries: number;
  private delay: number;
  private currentRetries: number = 0;
  private retryTime: number | null = null;

  constructor(id: string, maxRetries: number, delay: number, name: string = 'DelayedRetry') {
    super(id, name);
    this.maxRetries = maxRetries;
    this.delay = delay;
  }

  public override execute(context: any): BehaviorNodeStatus {
    if (!this.child) {
      this.setStatus(BehaviorNodeStatus.ERROR);
      return BehaviorNodeStatus.ERROR;
    }

    const now = Date.now();

    // 如果正在等待重试
    if (this.retryTime && now < this.retryTime) {
      this.setStatus(BehaviorNodeStatus.RUNNING);
      return BehaviorNodeStatus.RUNNING;
    }

    const status = this.child.execute(context);

    switch (status) {
      case BehaviorNodeStatus.SUCCESS:
        this.currentRetries = 0;
        this.retryTime = null;
        this.setStatus(BehaviorNodeStatus.SUCCESS);
        return BehaviorNodeStatus.SUCCESS;

      case BehaviorNodeStatus.FAILURE:
        this.currentRetries++;
        
        if (this.currentRetries <= this.maxRetries) {
          this.retryTime = now + this.delay;
          this.child.reset();
          this.setStatus(BehaviorNodeStatus.RUNNING);
          return BehaviorNodeStatus.RUNNING;
        }
        
        this.currentRetries = 0;
        this.retryTime = null;
        this.setStatus(BehaviorNodeStatus.FAILURE);
        return BehaviorNodeStatus.FAILURE;

      case BehaviorNodeStatus.RUNNING:
        this.setStatus(BehaviorNodeStatus.RUNNING);
        return BehaviorNodeStatus.RUNNING;

      case BehaviorNodeStatus.ERROR:
        this.currentRetries = 0;
        this.retryTime = null;
        this.setStatus(BehaviorNodeStatus.ERROR);
        return BehaviorNodeStatus.ERROR;
    }
  }

  public override reset(): void {
    super.reset();
    this.currentRetries = 0;
    this.retryTime = null;
  }
}

/**
 * 计数器节点
 * 统计执行次数
 */
export class CounterNode extends DecoratorNode {
  private counter: number = 0;

  constructor(id: string, name: string = 'Counter') {
    super(id, name);
  }

  public override execute(context: any): BehaviorNodeStatus {
    if (!this.child) {
      this.setStatus(BehaviorNodeStatus.ERROR);
      return BehaviorNodeStatus.ERROR;
    }

    const status = this.child.execute(context);
    
    if (status === BehaviorNodeStatus.SUCCESS) {
      this.counter++;
    }

    // 将计数保存到上下文中
    if (!context._counters) {
      context._counters = {};
    }
    context._counters[this.id] = this.counter;

    this.setStatus(status);
    return status;
  }

  /**
   * 获取当前计数
   * @returns 当前计数
   */
  public getCount(): number {
    return this.counter;
  }

  /**
   * 重置计数器
   */
  public resetCount(): void {
    this.counter = 0;
  }

  public override reset(): void {
    super.reset();
    this.counter = 0;
  }
}
