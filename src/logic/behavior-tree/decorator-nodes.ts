/**
 * 装饰节点实现
 */

import { BehaviorNodeStatus } from './interfaces';
import { DecoratorNode } from './nodes';

/**
 * 反转节点
 * 反转子节点的执行结果
 */
export class InverterNode extends DecoratorNode {
  /**
   * 构造函数
   * @param id 节点ID
   * @param name 节点名称
   */
  constructor(id: string, name: string = 'Inverter') {
    super(id, name);
  }

  /**
   * 执行节点
   * @param context 行为树上下文
   * @returns 执行状态
   */
  public override execute(context: any): BehaviorNodeStatus {
    if (!this.child) {
      this.setStatus(BehaviorNodeStatus.ERROR);
      return BehaviorNodeStatus.ERROR;
    }

    const status = this.child.execute(context);

    switch (status) {
      case BehaviorNodeStatus.SUCCESS:
        this.setStatus(BehaviorNodeStatus.FAILURE);
        return BehaviorNodeStatus.FAILURE;
        
      case BehaviorNodeStatus.FAILURE:
        this.setStatus(BehaviorNodeStatus.SUCCESS);
        return BehaviorNodeStatus.SUCCESS;
        
      case BehaviorNodeStatus.RUNNING:
        this.setStatus(BehaviorNodeStatus.RUNNING);
        return BehaviorNodeStatus.RUNNING;
        
      case BehaviorNodeStatus.ERROR:
        this.setStatus(BehaviorNodeStatus.ERROR);
        return BehaviorNodeStatus.ERROR;
    }
  }
}

/**
 * 重复节点
 * 重复执行子节点指定次数
 */
export class RepeaterNode extends DecoratorNode {
  /** 重复次数 */
  private maxRepeats: number;
  /** 当前重复次数 */
  private currentRepeats: number = 0;
  /** 是否无限重复 */
  private isInfinite: boolean;

  /**
   * 构造函数
   * @param id 节点ID
   * @param maxRepeats 最大重复次数（-1表示无限重复）
   * @param name 节点名称
   */
  constructor(id: string, maxRepeats: number = -1, name: string = 'Repeater') {
    super(id, name);
    this.maxRepeats = maxRepeats;
    this.isInfinite = maxRepeats === -1;
  }

  /**
   * 执行节点
   * @param context 行为树上下文
   * @returns 执行状态
   */
  public override execute(context: any): BehaviorNodeStatus {
    if (!this.child) {
      this.setStatus(BehaviorNodeStatus.ERROR);
      return BehaviorNodeStatus.ERROR;
    }

    // 检查是否达到重复次数限制
    if (!this.isInfinite && this.currentRepeats >= this.maxRepeats) {
      this.setStatus(BehaviorNodeStatus.SUCCESS);
      return BehaviorNodeStatus.SUCCESS;
    }

    const status = this.child.execute(context);

    switch (status) {
      case BehaviorNodeStatus.SUCCESS:
        this.currentRepeats++;
        
        // 检查是否达到最大重复次数
        if (!this.isInfinite && this.currentRepeats >= this.maxRepeats) {
          this.setStatus(BehaviorNodeStatus.SUCCESS);
          return BehaviorNodeStatus.SUCCESS;
        }
        
        this.child.reset(); // 重置子节点以便再次执行
        this.setStatus(BehaviorNodeStatus.RUNNING);
        return BehaviorNodeStatus.RUNNING;
        
      case BehaviorNodeStatus.FAILURE:
        this.setStatus(BehaviorNodeStatus.FAILURE);
        return BehaviorNodeStatus.FAILURE;
        
      case BehaviorNodeStatus.RUNNING:
        this.setStatus(BehaviorNodeStatus.RUNNING);
        return BehaviorNodeStatus.RUNNING;
        
      case BehaviorNodeStatus.ERROR:
        this.setStatus(BehaviorNodeStatus.ERROR);
        return BehaviorNodeStatus.ERROR;
    }
  }

  /**
   * 重置节点状态
   */
  public override reset(): void {
    super.reset();
    this.currentRepeats = 0;
  }
}

/**
 * 成功节点
 * 总是返回成功，忽略子节点的结果
 */
export class SucceederNode extends DecoratorNode {
  /**
   * 构造函数
   * @param id 节点ID
   * @param name 节点名称
   */
  constructor(id: string, name: string = 'Succeeder') {
    super(id, name);
  }

  /**
   * 执行节点
   * @param context 行为树上下文
   * @returns 执行状态
   */
  public override execute(context: any): BehaviorNodeStatus {
    if (this.child) {
      this.child.execute(context); // 执行子节点但忽略结果
    }

    this.setStatus(BehaviorNodeStatus.SUCCESS);
    return BehaviorNodeStatus.SUCCESS;
  }
}

/**
 * 失败节点
 * 总是返回失败，忽略子节点的结果
 */
export class FailerNode extends DecoratorNode {
  /**
   * 构造函数
   * @param id 节点ID
   * @param name 节点名称
   */
  constructor(id: string, name: string = 'Failer') {
    super(id, name);
  }

  /**
   * 执行节点
   * @param context 行为树上下文
   * @returns 执行状态
   */
  public override execute(context: any): BehaviorNodeStatus {
    if (this.child) {
      this.child.execute(context); // 执行子节点但忽略结果
    }

    this.setStatus(BehaviorNodeStatus.FAILURE);
    return BehaviorNodeStatus.FAILURE;
  }
}

/**
 * 条件装饰节点
 * 根据条件决定是否执行子节点
 */
export class ConditionDecoratorNode extends DecoratorNode {
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
    if (!this.condition(context)) {
      this.setStatus(BehaviorNodeStatus.FAILURE);
      return BehaviorNodeStatus.FAILURE;
    }

    if (!this.child) {
      this.setStatus(BehaviorNodeStatus.ERROR);
      return BehaviorNodeStatus.ERROR;
    }

    const status = this.child.execute(context);
    this.setStatus(status);
    return status;
  }
}

/**
 * 超时节点
 * 如果子节点执行时间超过指定时间，则返回失败
 */
export class TimeoutNode extends DecoratorNode {
  /** 超时时间（毫秒） */
  private timeout: number;
  /** 开始时间 */
  private startTime: number | null = null;

  /**
   * 构造函数
   * @param id 节点ID
   * @param timeout 超时时间（毫秒）
   * @param name 节点名称
   */
  constructor(id: string, timeout: number, name: string = 'Timeout') {
    super(id, name);
    this.timeout = timeout;
  }

  /**
   * 执行节点
   * @param context 行为树上下文
   * @returns 执行状态
   */
  public override execute(context: any): BehaviorNodeStatus {
    if (!this.child) {
      this.setStatus(BehaviorNodeStatus.ERROR);
      return BehaviorNodeStatus.ERROR;
    }

    // 记录开始时间
    if (this.startTime === null) {
      this.startTime = Date.now();
    }

    // 检查是否超时
    if (Date.now() - this.startTime > this.timeout) {
      this.setStatus(BehaviorNodeStatus.FAILURE);
      return BehaviorNodeStatus.FAILURE;
    }

    const status = this.child.execute(context);

    switch (status) {
      case BehaviorNodeStatus.SUCCESS:
      case BehaviorNodeStatus.FAILURE:
      case BehaviorNodeStatus.ERROR:
        this.startTime = null; // 重置开始时间
        this.setStatus(status);
        return status;
        
      case BehaviorNodeStatus.RUNNING:
        this.setStatus(BehaviorNodeStatus.RUNNING);
        return BehaviorNodeStatus.RUNNING;
    }
  }

  /**
   * 重置节点状态
   */
  public override reset(): void {
    super.reset();
    this.startTime = null;
  }
}