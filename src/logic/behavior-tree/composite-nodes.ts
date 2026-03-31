/**
 * 组合节点实现
 */

import { BehaviorNodeStatus } from './interfaces';
import { CompositeNode } from './nodes';

/**
 * 序列节点
 * 按顺序执行所有子节点，直到一个失败，然后返回失败
 * 如果所有子节点都成功，则返回成功
 */
export class SequenceNode extends CompositeNode {
  /**
   * 构造函数
   * @param id 节点ID
   * @param name 节点名称
   */
  constructor(id: string, name: string = 'Sequence') {
    super(id, name);
  }

  /**
   * 执行节点
   * @param context 行为树上下文
   * @returns 执行状态
   */
  public override execute(context: any): BehaviorNodeStatus {
    for (const child of this.children) {
      const status = child.execute(context);
      
      switch (status) {
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
    
    this.setStatus(BehaviorNodeStatus.SUCCESS);
    return BehaviorNodeStatus.SUCCESS;
  }
}

/**
 * 选择节点
 * 按顺序执行子节点，直到一个成功，然后返回成功
 * 如果所有子节点都失败，则返回失败
 */
export class SelectorNode extends CompositeNode {
  /**
   * 构造函数
   * @param id 节点ID
   * @param name 节点名称
   */
  constructor(id: string, name: string = 'Selector') {
    super(id, name);
  }

  /**
   * 执行节点
   * @param context 行为树上下文
   * @returns 执行状态
   */
  public override execute(context: any): BehaviorNodeStatus {
    for (const child of this.children) {
      const status = child.execute(context);
      
      switch (status) {
        case BehaviorNodeStatus.SUCCESS:
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
    
    this.setStatus(BehaviorNodeStatus.FAILURE);
    return BehaviorNodeStatus.FAILURE;
  }
}

/**
 * 并行节点
 * 同时执行所有子节点，根据策略返回结果
 */
export class BehaviorParallelNode extends CompositeNode {
  /** 成功阈值 */
  private successThreshold: number;
  /** 失败阈值 */
  private failureThreshold: number;

  /**
   * 构造函数
   * @param id 节点ID
   * @param successThreshold 成功阈值（默认：子节点数量）
   * @param failureThreshold 失败阈值（默认：0）
   * @param name 节点名称
   */
  constructor(
    id: string, 
    successThreshold?: number,
    failureThreshold: number = 0,
    name: string = 'Parallel'
  ) {
    super(id, name);
    this.successThreshold = successThreshold !== undefined ? successThreshold : -1;
    this.failureThreshold = failureThreshold;
  }

  /**
   * 执行节点
   * @param context 行为树上下文
   * @returns 执行状态
   */
  public override execute(context: any): BehaviorNodeStatus {
    let successCount = 0;
    let failureCount = 0;
    let runningCount = 0;

    for (const child of this.children) {
      const status = child.execute(context);
      
      switch (status) {
        case BehaviorNodeStatus.SUCCESS:
          successCount++;
          break;
          
        case BehaviorNodeStatus.FAILURE:
          failureCount++;
          break;
          
        case BehaviorNodeStatus.RUNNING:
          runningCount++;
          break;
          
        case BehaviorNodeStatus.ERROR:
          this.setStatus(BehaviorNodeStatus.ERROR);
          return BehaviorNodeStatus.ERROR;
      }
    }

    // 检查成功条件
    const actualSuccessThreshold = this.successThreshold === -1 ? this.children.length : this.successThreshold;
    if (successCount >= actualSuccessThreshold) {
      this.setStatus(BehaviorNodeStatus.SUCCESS);
      return BehaviorNodeStatus.SUCCESS;
    }

    // 检查失败条件
    if (failureCount >= this.failureThreshold) {
      this.setStatus(BehaviorNodeStatus.FAILURE);
      return BehaviorNodeStatus.FAILURE;
    }

    // 如果有节点正在运行，则返回RUNNING
    if (runningCount > 0) {
      this.setStatus(BehaviorNodeStatus.RUNNING);
      return BehaviorNodeStatus.RUNNING;
    }

    // 如果所有节点都执行完毕但未满足成功条件，返回失败
    this.setStatus(BehaviorNodeStatus.FAILURE);
    return BehaviorNodeStatus.FAILURE;
  }
}

/**
 * 随机选择节点
 * 随机选择一个子节点执行
 */
export class RandomNode extends CompositeNode {
  /**
   * 构造函数
   * @param id 节点ID
   * @param name 节点名称
   */
  constructor(id: string, name: string = 'Random') {
    super(id, name);
  }

  /**
   * 执行节点
   * @param context 行为树上下文
   * @returns 执行状态
   */
  public override execute(context: any): BehaviorNodeStatus {
    if (this.children.length === 0) {
      this.setStatus(BehaviorNodeStatus.FAILURE);
      return BehaviorNodeStatus.FAILURE;
    }

    // 随机选择一个子节点
    const randomIndex = Math.floor(Math.random() * this.children.length);
    const selectedChild = this.children[randomIndex];

    if (!selectedChild) {
      this.setStatus(BehaviorNodeStatus.FAILURE);
      return BehaviorNodeStatus.FAILURE;
    }

    const status = selectedChild.execute(context);
    this.setStatus(status);
    return status;
  }
}