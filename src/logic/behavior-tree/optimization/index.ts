/**
 * 行为树优化模块
 */

import { BaseBehaviorNode } from '../nodes';
import { BehaviorTree } from '../BehaviorTree';
import { BehaviorNodeInterface, BehaviorNodeStatus } from '../interfaces';
import { ConditionNode } from '../leaf-nodes';

/**
 * 节点对象池
 * 用于复用节点对象，减少内存分配
 */
export class NodePool<T extends BaseBehaviorNode> {
  private pool: T[] = [];
  private factory: () => T;

  /**
   * 构造函数
   * @param factory 节点工厂函数
   */
  constructor(factory: () => T) {
    this.factory = factory;
  }

  /**
   * 获取节点实例
   * @returns 节点实例
   */
  acquire(): T {
    return this.pool.pop() || this.factory();
  }

  /**
   * 释放节点实例回对象池
   * @param node 要释放的节点
   */
  release(node: T): void {
    node.reset();
    this.pool.push(node);
  }

  /**
   * 清空对象池
   */
  clear(): void {
    this.pool = [];
  }

  /**
   * 获取对象池大小
   * @returns 对象池大小
   */
  getSize(): number {
    return this.pool.length;
  }
}

/**
 * 上下文对象池
 * 用于复用上下文对象，减少内存分配
 */
export class ContextPool {
  private pool: any[] = [];

  /**
   * 获取上下文对象
   * @returns 上下文对象
   */
  acquire(): any {
    return this.pool.pop() || {};
  }

  /**
   * 释放上下文对象回对象池
   * @param context 要释放的上下文对象
   */
  release(context: any): void {
    // 清理上下文数据
    Object.keys(context).forEach(key => {
      const value = context[key];
      if (value && typeof value === 'object') {
        if (Array.isArray(value)) {
          value.length = 0;
        } else {
          Object.keys(value).forEach(subKey => {
            delete value[subKey];
          });
        }
      }
      delete context[key];
    });
    this.pool.push(context);
  }

  /**
   * 清空对象池
   */
  clear(): void {
    this.pool = [];
  }

  /**
   * 获取对象池大小
   * @returns 对象池大小
   */
  getSize(): number {
    return this.pool.length;
  }
}

/**
 * 带缓存的条件节点
 * 缓存条件计算结果，避免重复计算
 */
export class CachedConditionNode extends ConditionNode {
  private lastContext: any = null;
  private lastResult: boolean | null = null;

  /**
   * 构造函数
   * @param id 节点ID
   * @param condition 条件函数
   * @param _cacheKey 缓存键（可选）
   */
  constructor(id: string, condition: (context: any) => boolean, _cacheKey?: string) {
    super(id, condition);
  }

  /**
   * 执行节点
   * @param context 行为树上下文
   * @returns 执行状态
   */
  public override execute(context: any): BehaviorNodeStatus {
    // 如果上下文相同且有缓存结果，直接返回
    if (this.lastContext === context && this.lastResult !== null) {
      return this.lastResult ? BehaviorNodeStatus.SUCCESS : BehaviorNodeStatus.FAILURE;
    }

    // 调用父类的execute方法来执行条件
    const status = super.execute(context);
    this.lastContext = context;
    this.lastResult = status === BehaviorNodeStatus.SUCCESS;
    return status;
  }

  /**
   * 重置节点状态
   */
  public override reset(): void {
    super.reset();
    this.lastContext = null;
    this.lastResult = null;
  }
}

/**
 * 行为树批处理执行器
 * 批量执行多个行为树，减少函数调用开销
 */
export class BehaviorTreeBatchExecutor {
  private trees: BehaviorTree[] = [];
  private contexts: Map<BehaviorTree, any> = new Map();

  /**
   * 添加行为树到执行器
   * @param tree 行为树实例
   * @param context 上下文对象
   */
  addTree(tree: BehaviorTree, context: any): void {
    this.trees.push(tree);
    this.contexts.set(tree, context);
  }

  /**
   * 批量执行所有行为树
   * @returns 执行结果映射
   */
  executeAll(): Map<BehaviorTree, BehaviorNodeStatus> {
    const results = new Map<BehaviorTree, BehaviorNodeStatus>();

    // 批量执行所有行为树
    for (const tree of this.trees) {
      const context = this.contexts.get(tree);
      if (context) {
        results.set(tree, tree.execute(context));
      }
    }

    return results;
  }

  /**
   * 清空执行器
   */
  clear(): void {
    this.trees = [];
    this.contexts.clear();
  }

  /**
   * 获取执行器中的行为树数量
   * @returns 行为树数量
   */
  getTreeCount(): number {
    return this.trees.length;
  }
}

/**
 * 带优先级的行为树
 * 根据节点优先级执行，优先执行高优先级节点
 */
export class PrioritizedBehaviorTree extends BehaviorTree {
  private nodePriorities = new Map<string, number>();

  /**
   * 设置节点优先级
   * @param nodeId 节点ID
   * @param priority 优先级（数值越大优先级越高）
   */
  setNodePriority(nodeId: string, priority: number): void {
    this.nodePriorities.set(nodeId, priority);
  }

  /**
   * 获取节点优先级
   * @param nodeId 节点ID
   * @returns 优先级值
   */
  getNodePriority(nodeId: string): number {
    return this.nodePriorities.get(nodeId) || 0;
  }

  /**
   * 执行行为树（按优先级）
   * @param context 行为树上下文
   * @returns 执行结果
   */
  public override execute(context: any): BehaviorNodeStatus {
    // 获取按优先级排序的节点列表
    const prioritizedNodes = this.getPrioritizedNodes(this.root);

    // 按优先级执行节点
    for (const node of prioritizedNodes) {
      const status = node.execute(context);
      if (status !== BehaviorNodeStatus.FAILURE) {
        return status;
      }
    }

    return BehaviorNodeStatus.FAILURE;
  }

  /**
   * 获取按优先级排序的节点列表
   * @param node 起始节点
   * @returns 排序后的节点列表
   */
  private getPrioritizedNodes(node: BehaviorNodeInterface): BehaviorNodeInterface[] {
    const nodes: BehaviorNodeInterface[] = [];

    // 递归收集所有节点
    const collectNodes = (currentNode: BehaviorNodeInterface) => {
      nodes.push(currentNode);

      // 处理组合节点
      if ('getChildren' in currentNode && typeof currentNode.getChildren === 'function') {
        currentNode.getChildren().forEach(collectNodes);
      }
      // 处理装饰节点
      else if ('getChild' in currentNode && typeof currentNode.getChild === 'function') {
        const child = currentNode.getChild();
        if (child) collectNodes(child);
      }
    };

    collectNodes(node);

    // 按优先级排序（优先级高的在前）
    return nodes.sort((a, b) => {
      const priorityA = this.getNodePriority(a.id);
      const priorityB = this.getNodePriority(b.id);
      return priorityB - priorityA;
    });
  }
}

/**
 * 性能监控工具
 * 监控行为树执行性能
 */
export class PerformanceMonitor {
  private executionTimes = new Map<string, number[]>();
  private totalExecutions = new Map<string, number>();

  /**
   * 记录执行时间
   * @param nodeId 节点ID
   * @param time 执行时间（毫秒）
   */
  recordExecution(nodeId: string, time: number): void {
    if (!this.executionTimes.has(nodeId)) {
      this.executionTimes.set(nodeId, []);
      this.totalExecutions.set(nodeId, 0);
    }

    this.executionTimes.get(nodeId)!.push(time);
    this.totalExecutions.set(nodeId, (this.totalExecutions.get(nodeId) || 0) + 1);
  }

  /**
   * 获取节点平均执行时间
   * @param nodeId 节点ID
   * @returns 平均执行时间（毫秒）
   */
  getAverageExecutionTime(nodeId: string): number {
    const times = this.executionTimes.get(nodeId);
    if (!times || times.length === 0) return 0;

    const sum = times.reduce((acc, time) => acc + time, 0);
    return sum / times.length;
  }

  /**
   * 获取节点总执行次数
   * @param nodeId 节点ID
   * @returns 总执行次数
   */
  getTotalExecutions(nodeId: string): number {
    return this.totalExecutions.get(nodeId) || 0;
  }

  /**
   * 重置监控数据
   */
  reset(): void {
    this.executionTimes.clear();
    this.totalExecutions.clear();
  }

  /**
   * 生成性能报告
   * @returns 性能报告对象
   */
  generateReport(): any {
    const report: any = {};

    this.executionTimes.forEach((times, nodeId) => {
      const avgTime = this.getAverageExecutionTime(nodeId);
      const totalExecutions = this.getTotalExecutions(nodeId);

      report[nodeId] = {
        averageExecutionTime: avgTime,
        totalExecutions,
        maxExecutionTime: Math.max(...times),
        minExecutionTime: Math.min(...times)
      };
    });

    return report;
  }
}

/**
 * 行为树优化工具类
 */
export class BehaviorTreeOptimizer {
  /**
   * 创建性能监控装饰器
   * @param monitor 性能监控器
   * @returns 装饰器函数
   */
  static createPerformanceDecorator(monitor: PerformanceMonitor) {
    return function <T extends (...args: any[]) => any>(func: T): T {
      return function (this: any, ...args: any[]) {
        const startTime = performance.now();
        const result = func.apply(this, args);
        const endTime = performance.now();
        const executionTime = endTime - startTime;

        // 记录执行时间
        if (this && this.id) {
          monitor.recordExecution(this.id, executionTime);
        }

        return result;
      } as unknown as T;
    };
  }

  /**
   * 优化行为树执行
   * @param tree 行为树实例
   * @param monitor 性能监控器（可选）
   */
  static optimize(tree: BehaviorTree, monitor?: PerformanceMonitor): void {
    if (monitor) {
      // 为execute方法添加性能监控
      const decorator = this.createPerformanceDecorator(monitor);
      tree.execute = decorator(tree.execute.bind(tree));
    }
  }
}
