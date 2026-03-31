/**
 * 叶子节点实现
 */

import { BehaviorNodeStatus } from './interfaces';
import { LeafNode } from './nodes';

/**
 * 动作节点
 * 执行具体的动作
 */
export class ActionNode extends LeafNode {
  /** 动作函数 */
  private action: (context: any) => BehaviorNodeStatus;

  /**
   * 构造函数
   * @param id 节点ID
   * @param action 动作函数
   * @param name 节点名称
   */
  constructor(id: string, action: (context: any) => BehaviorNodeStatus, name: string = 'Action') {
    super(id, name);
    this.action = action;
  }

  /**
   * 执行节点
   * @param context 行为树上下文
   * @returns 执行状态
   */
  public override execute(context: any): BehaviorNodeStatus {
    const status = this.action(context);
    this.setStatus(status);
    return status;
  }
}

/**
 * 条件节点
 * 检查条件是否满足
 */
export class ConditionNode extends LeafNode {
  /** 条件函数 */
  private condition: (context: any) => boolean;

  /**
   * 构造函数
   * @param id 节点ID
   * @param condition 条件函数
   * @param name 节点名称
   */
  constructor(id: string, condition: (context: any) => boolean, name: string = 'Condition') {
    super(id, name);
    this.condition = condition;
  }

  /**
   * 执行节点
   * @param context 行为树上下文
   * @returns 执行状态
   */
  public override execute(context: any): BehaviorNodeStatus {
    const result = this.condition(context);
    const status = result ? BehaviorNodeStatus.SUCCESS : BehaviorNodeStatus.FAILURE;
    this.setStatus(status);
    return status;
  }
}

/**
 * 成功节点（叶子版本）
 * 总是返回成功
 */
export class SuccessNode extends LeafNode {
  /**
   * 构造函数
   * @param id 节点ID
   * @param name 节点名称
   */
  constructor(id: string, name: string = 'Success') {
    super(id, name);
  }

  /**
   * 执行节点
   * @param _context 行为树上下文
   * @returns 执行状态
   */
  public override execute(_context: any): BehaviorNodeStatus {
    this.setStatus(BehaviorNodeStatus.SUCCESS);
    return BehaviorNodeStatus.SUCCESS;
  }
}

/**
 * 失败节点（叶子版本）
 * 总是返回失败
 */
export class FailureNode extends LeafNode {
  /**
   * 构造函数
   * @param id 节点ID
   * @param name 节点名称
   */
  constructor(id: string, name: string = 'Failure') {
    super(id, name);
  }

  /**
   * 执行节点
   * @param _context 行为树上下文
   * @returns 执行状态
   */
  public override execute(_context: any): BehaviorNodeStatus {
    this.setStatus(BehaviorNodeStatus.FAILURE);
    return BehaviorNodeStatus.FAILURE;
  }
}

/**
 * 运行中节点
 * 总是返回运行中状态
 */
export class RunningNode extends LeafNode {
  /**
   * 构造函数
   * @param id 节点ID
   * @param name 节点名称
   */
  constructor(id: string, name: string = 'Running') {
    super(id, name);
  }

  /**
   * 执行节点
   * @param _context 行为树上下文
   * @returns 执行状态
   */
  public override execute(_context: any): BehaviorNodeStatus {
    this.setStatus(BehaviorNodeStatus.RUNNING);
    return BehaviorNodeStatus.RUNNING;
  }
}

/**
 * 错误节点
 * 总是返回错误状态
 */
export class ErrorNode extends LeafNode {
  /**
   * 构造函数
   * @param id 节点ID
   * @param name 节点名称
   */
  constructor(id: string, name: string = 'Error') {
    super(id, name);
  }

  /**
   * 执行节点
   * @param _context 行为树上下文
   * @returns 执行状态
   */
  public override execute(_context: any): BehaviorNodeStatus {
    this.setStatus(BehaviorNodeStatus.ERROR);
    return BehaviorNodeStatus.ERROR;
  }
}

/**
 * 等待节点
 * 等待指定时间后返回成功
 */
export class WaitNode extends LeafNode {
  /** 等待时间（毫秒） */
  private waitTime: number;
  /** 开始时间 */
  private startTime: number | null = null;

  /**
   * 构造函数
   * @param id 节点ID
   * @param waitTime 等待时间（毫秒）
   * @param name 节点名称
   */
  constructor(id: string, waitTime: number, name: string = 'Wait') {
    super(id, name);
    this.waitTime = waitTime;
  }

  /**
   * 执行节点
   * @param _context 行为树上下文
   * @returns 执行状态
   */
  public override execute(_context: any): BehaviorNodeStatus {
    // 记录开始时间
    if (this.startTime === null) {
      this.startTime = Date.now();
    }

    // 检查是否达到等待时间
    if (Date.now() - this.startTime >= this.waitTime) {
      this.startTime = null; // 重置开始时间
      this.setStatus(BehaviorNodeStatus.SUCCESS);
      return BehaviorNodeStatus.SUCCESS;
    }

    this.setStatus(BehaviorNodeStatus.RUNNING);
    return BehaviorNodeStatus.RUNNING;
  }

  /**
   * 重置节点状态
   */
  public override reset(): void {
    super.reset();
    this.startTime = null;
  }
}

/**
 * 日志节点
 * 记录日志并返回成功
 */
export class LogNode extends LeafNode {
  /** 日志消息 */
  private message: string;
  /** 日志级别 */
  private level: 'info' | 'warn' | 'error' | 'debug';

  /**
   * 构造函数
   * @param id 节点ID
   * @param name 节点名称
   * @param message 日志消息
   * @param level 日志级别
   */
  constructor(
    id: string, 
    name: string = 'Log', 
    message: string, 
    level: 'info' | 'warn' | 'error' | 'debug' = 'info'
  ) {
    super(id, name);
    this.message = message;
    this.level = level;
  }

  /**
   * 执行节点
   * @param context 行为树上下文
   * @returns 执行状态
   */
  public override execute(context: any): BehaviorNodeStatus {
    // 使用模板字符串支持上下文变量
    const formattedMessage = this.message.replace(/\{(\w+)\}/g, (match, key) => {
      return context[key] !== undefined ? context[key] : match;
    });

    // 记录日志
    switch (this.level) {
      case 'info':
        console.info(formattedMessage);
        break;
      case 'warn':
        console.warn(formattedMessage);
        break;
      case 'error':
        console.error(formattedMessage);
        break;
      case 'debug':
        console.debug(formattedMessage);
        break;
    }

    this.setStatus(BehaviorNodeStatus.SUCCESS);
    return BehaviorNodeStatus.SUCCESS;
  }
}