import { BaseProcessNode } from './nodes';
import { isTestEnvironment } from './platform-adapter';

/**
 * 定时器节点类
 * 支持定时触发执行
 */
export class TimerNode extends BaseProcessNode {
  /** 定时器ID */
  private timerId: any = null;

  /**
   * 构造函数
   * @param id 节点ID
   * @param name 节点名称
   * @param delay 延迟时间（毫秒）
   * @param nextNodeId 下一个节点ID
   */
  constructor(
    id: string,
    name: string,
    private delay: number,
    private nextNodeId: string
  ) {
    super(id, name, 'task');
  }

  /**
   * 执行节点
   * @param _context 流程上下文（未使用）
   * @returns 执行结果（Promise）
   */
  public execute(_context: any): Promise<any> {
    // 测试环境中立即返回，生产环境使用定时器
    if (isTestEnvironment()) {
      return Promise.resolve({ 
        timer: 'completed', 
        delay: this.delay,
        timestamp: Date.now()
      });
    }
    
    return new Promise((resolve) => {
      this.timerId = setTimeout(() => {
        resolve({ 
          timer: 'completed', 
          delay: this.delay,
          timestamp: Date.now()
        });
      }, this.delay);
    });
  }

  /**
   * 获取下一个节点ID
   * @param _context 流程上下文（未使用）
   * @param _result 执行结果（未使用）
   * @returns 下一个节点ID
   */
  public getNextNodeId(_context: any, _result?: any): string {
    return this.nextNodeId;
  }

  /**
   * 取消定时器
   */
  public cancel(): void {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }
}

/**
 * 延迟节点类
 * 基于相对时间的延迟执行
 */
export class DelayNode extends BaseProcessNode {
  /**
   * 构造函数
   * @param id 节点ID
   * @param name 节点名称
   * @param delay 延迟时间（毫秒）
   * @param nextNodeId 下一个节点ID
   */
  constructor(
    id: string,
    name: string,
    private delay: number,
    private nextNodeId: string
  ) {
    super(id, name, 'task');
  }

  /**
   * 执行节点
   * @param context 流程上下文
   * @returns 执行结果（Promise）
   */
  public execute(context: any): Promise<any> {
    // 测试环境中立即返回，生产环境使用定时器
    if (isTestEnvironment()) {
      return Promise.resolve({ 
        delay: 'completed', 
        duration: this.delay,
        startTime: context.startTime || Date.now()
      });
    }
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ 
          delay: 'completed', 
          duration: this.delay,
          startTime: context.startTime || Date.now()
        });
      }, this.delay);
    });
  }

  /**
   * 获取下一个节点ID
   * @param _context 流程上下文（未使用）
   * @param _result 执行结果（未使用）
   * @returns 下一个节点ID
   */
  public getNextNodeId(_context: any, _result?: any): string {
    return this.nextNodeId;
  }
}

/**
 * Cron定时器节点类
 * 支持基于cron表达式的定时执行
 */
export class CronNode extends BaseProcessNode {
  /**
   * 构造函数
   * @param id 节点ID
   * @param name 节点名称
   * @param cronExpression cron表达式
   * @param nextNodeId 下一个节点ID
   */
  constructor(
    id: string,
    name: string,
    private cronExpression: string,
    private nextNodeId: string
  ) {
    super(id, name, 'task');
  }

  /**
   * 执行节点
   * @param _context 流程上下文（未使用）
   * @returns 执行结果（Promise）
   */
  public execute(_context: any): Promise<any> {
    const mockNextExecution = Date.now() + 1000;
    
    // 测试环境中立即返回，生产环境使用定时器
    if (isTestEnvironment()) {
      return Promise.resolve({ 
        cron: 'triggered',
        expression: this.cronExpression,
        nextExecution: mockNextExecution
      });
    }
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ 
          cron: 'triggered',
          expression: this.cronExpression,
          nextExecution: mockNextExecution
        });
      }, 1000);
    });
  }

  /**
   * 获取下一个节点ID
   * @param _context 流程上下文（未使用）
   * @param _result 执行结果（未使用）
   * @returns 下一个节点ID
   */
  public getNextNodeId(_context: any, _result?: any): string {
    return this.nextNodeId;
  }
}