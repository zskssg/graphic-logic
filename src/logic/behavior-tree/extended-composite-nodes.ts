import { BehaviorNodeStatus } from './interfaces';
import { CompositeNode } from './nodes';

/**
 * 优先级节点
 * 按优先级顺序执行子节点，只要有一个节点成功就返回成功
 */
export class PriorityNode extends CompositeNode {
  constructor(id: string, name: string = 'Priority') {
    super(id, name);
  }

  public override execute(context: any): BehaviorNodeStatus {
    for (const child of this.getChildren()) {
      const status = child.execute(context);
      
      if (status === BehaviorNodeStatus.SUCCESS) {
        this.setStatus(BehaviorNodeStatus.SUCCESS);
        return BehaviorNodeStatus.SUCCESS;
      }
      
      if (status === BehaviorNodeStatus.RUNNING) {
        this.setStatus(BehaviorNodeStatus.RUNNING);
        return BehaviorNodeStatus.RUNNING;
      }
    }
    
    this.setStatus(BehaviorNodeStatus.FAILURE);
    return BehaviorNodeStatus.FAILURE;
  }
}

/**
 * 加权并行节点
 * 基于权重计算成功条件
 */
export class WeightedParallelNode extends CompositeNode {
  private successWeight: number;
  private weights: Map<string, number> = new Map();

  constructor(id: string, successWeight: number, name: string = 'WeightedParallel') {
    super(id, name);
    this.successWeight = successWeight;
  }

  /**
   * 设置子节点权重
   * @param childId 子节点ID
   * @param weight 权重值
   */
  public setChildWeight(childId: string, weight: number): void {
    this.weights.set(childId, weight);
  }

  public override execute(context: any): BehaviorNodeStatus {
    let totalWeight = 0;
    let runningCount = 0;

    for (const child of this.getChildren()) {
      const status = child.execute(context);
      
      if (status === BehaviorNodeStatus.SUCCESS) {
        const weight = this.weights.get(child.id) || 1;
        totalWeight += weight;
      }
      
      if (status === BehaviorNodeStatus.RUNNING) {
        runningCount++;
      }
    }

    // 如果有节点正在运行，返回RUNNING
    if (runningCount > 0) {
      this.setStatus(BehaviorNodeStatus.RUNNING);
      return BehaviorNodeStatus.RUNNING;
    }

    // 检查是否达到成功权重
    if (totalWeight >= this.successWeight) {
      this.setStatus(BehaviorNodeStatus.SUCCESS);
      return BehaviorNodeStatus.SUCCESS;
    }

    this.setStatus(BehaviorNodeStatus.FAILURE);
    return BehaviorNodeStatus.FAILURE;
  }
}

/**
 * 条件并行节点
 * 根据条件选择执行哪些子节点
 */
export class ConditionalParallelNode extends CompositeNode {
  private conditions: Map<string, (context: any) => boolean> = new Map();

  constructor(id: string, name: string = 'ConditionalParallel') {
    super(id, name);
  }

  /**
   * 设置子节点条件
   * @param childId 子节点ID
   * @param condition 条件函数
   */
  public setChildCondition(childId: string, condition: (context: any) => boolean): void {
    this.conditions.set(childId, condition);
  }

  public override execute(context: any): BehaviorNodeStatus {
    let successCount = 0;
    let failureCount = 0;
    let runningCount = 0;

    for (const child of this.getChildren()) {
      const condition = this.conditions.get(child.id);
      
      // 如果没有条件或条件满足，则执行子节点
      if (!condition || condition(context)) {
        const status = child.execute(context);
        
        if (status === BehaviorNodeStatus.SUCCESS) {
          successCount++;
        } else if (status === BehaviorNodeStatus.FAILURE) {
          failureCount++;
        } else if (status === BehaviorNodeStatus.RUNNING) {
          runningCount++;
        }
      }
    }

    // 如果有节点正在运行，返回RUNNING
    if (runningCount > 0) {
      this.setStatus(BehaviorNodeStatus.RUNNING);
      return BehaviorNodeStatus.RUNNING;
    }

    // 如果所有执行的节点都成功，返回SUCCESS
    if (failureCount === 0 && successCount > 0) {
      this.setStatus(BehaviorNodeStatus.SUCCESS);
      return BehaviorNodeStatus.SUCCESS;
    }

    this.setStatus(BehaviorNodeStatus.FAILURE);
    return BehaviorNodeStatus.FAILURE;
  }
}

/**
 * 随机权重节点
 * 按权重概率选择子节点执行
 */
export class RandomWeightedNode extends CompositeNode {
  private weights: Map<string, number> = new Map();

  constructor(id: string, name: string = 'RandomWeighted') {
    super(id, name);
  }

  /**
   * 设置子节点权重
   * @param childId 子节点ID
   * @param weight 权重值
   */
  public setChildWeight(childId: string, weight: number): void {
    this.weights.set(childId, weight);
  }

  public override execute(context: any): BehaviorNodeStatus {
    const children = this.getChildren();
    if (children.length === 0) {
      this.setStatus(BehaviorNodeStatus.FAILURE);
      return BehaviorNodeStatus.FAILURE;
    }

    // 计算总权重
    let totalWeight = 0;
    for (const child of children) {
      totalWeight += this.weights.get(child.id) || 1;
    }

    // 随机选择一个子节点
    let random = Math.random() * totalWeight;
    let selectedChild: any = null;

    for (const child of children) {
      const weight = this.weights.get(child.id) || 1;
      random -= weight;
      if (random<= 0) {
        selectedChild = child;
        break;
      }
    }

    if (selectedChild) {
      const status = selectedChild.execute(context);
      this.setStatus(status);
      return status;
    }

    this.setStatus(BehaviorNodeStatus.FAILURE);
    return BehaviorNodeStatus.FAILURE;
  }
}
