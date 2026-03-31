import { describe, it, expect } from 'vitest';
import {
  NodePool,
  ContextPool,
  CachedConditionNode,
  BehaviorTreeBatchExecutor,
  PrioritizedBehaviorTree,
  PerformanceMonitor,
  BehaviorTreeOptimizer
} from '../../../src/logic/behavior-tree/optimization';
import {
  BehaviorTree,
  ActionNode,
  SequenceNode,
  BehaviorNodeStatus
} from '../../../src/logic/behavior-tree';

describe('BehaviorTree Optimization', () => {
  describe('NodePool', () => {
    it('should acquire and release nodes', () => {
      const pool = new NodePool(() => new ActionNode('test', () => BehaviorNodeStatus.SUCCESS));

      // 获取节点
      const node1 = pool.acquire();
      expect(node1).toBeDefined();
      expect(pool.getSize()).toBe(0);

      // 释放节点
      pool.release(node1);
      expect(pool.getSize()).toBe(1);

      // 再次获取应该得到相同的节点
      const node2 = pool.acquire();
      expect(node2).toBe(node1);
      expect(pool.getSize()).toBe(0);
    });

    it('should reset nodes when released', () => {
      const pool = new NodePool(() => new ActionNode('test', () => BehaviorNodeStatus.SUCCESS));
      const node = pool.acquire();

      // 设置节点状态
      node.setStatus(BehaviorNodeStatus.RUNNING);
      expect(node.getStatus()).toBe(BehaviorNodeStatus.RUNNING);

      // 释放节点
      pool.release(node);

      // 再次获取节点，状态应该被重置
      const releasedNode = pool.acquire();
      expect(releasedNode.getStatus()).toBe(BehaviorNodeStatus.SUCCESS);
    });

    it('should clear the pool', () => {
      const pool = new NodePool(() => new ActionNode('test', () => BehaviorNodeStatus.SUCCESS));
      const node = pool.acquire();
      pool.release(node);

      expect(pool.getSize()).toBe(1);
      pool.clear();
      expect(pool.getSize()).toBe(0);
    });
  });

  describe('ContextPool', () => {
    it('should acquire and release contexts', () => {
      const pool = new ContextPool();

      // 获取上下文
      const context1 = pool.acquire();
      expect(context1).toEqual({});
      expect(pool.getSize()).toBe(0);

      // 添加数据
      context1.test = 'value';
      context1.nested = { key: 'value' };

      // 释放上下文
      pool.release(context1);
      expect(pool.getSize()).toBe(1);

      // 再次获取应该得到清理后的上下文
      const context2 = pool.acquire();
      expect(context2).toEqual({});
      expect(pool.getSize()).toBe(0);
    });

    it('should clear nested objects', () => {
      const pool = new ContextPool();
      const context = pool.acquire();

      context.complex = {
        array: [1, 2, 3],
        nested: { value: 'test' }
      };

      pool.release(context);
      const releasedContext = pool.acquire();

      expect(releasedContext.complex).toBeUndefined();
    });

    it('should clear the pool', () => {
      const pool = new ContextPool();
      const context = pool.acquire();
      pool.release(context);

      expect(pool.getSize()).toBe(1);
      pool.clear();
      expect(pool.getSize()).toBe(0);
    });
  });

  describe('CachedConditionNode', () => {
    it('should cache condition results', () => {
      let callCount = 0;
      const condition = (context: any) => {
        callCount++;
        return context.value > 10;
      };

      const node = new CachedConditionNode('cached', condition);
      const context = { value: 20 };

      // 第一次调用，应该计算条件
      const result1 = node.execute(context);
      expect(result1).toBe(BehaviorNodeStatus.SUCCESS);
      expect(callCount).toBe(1);

      // 第二次调用相同上下文，应该使用缓存
      const result2 = node.execute(context);
      expect(result2).toBe(BehaviorNodeStatus.SUCCESS);
      expect(callCount).toBe(1);

      // 不同上下文，应该重新计算
      const newContext = { value: 5 };
      const result3 = node.execute(newContext);
      expect(result3).toBe(BehaviorNodeStatus.FAILURE);
      expect(callCount).toBe(2);
    });

    it('should reset cache on reset', () => {
      let callCount = 0;
      const condition = () => {
        callCount++;
        return true;
      };

      const node = new CachedConditionNode('cached', condition);
      const context = {};

      // 第一次调用
      node.execute(context);
      expect(callCount).toBe(1);

      // 第二次调用（缓存）
      node.execute(context);
      expect(callCount).toBe(1);

      // 重置节点
      node.reset();

      // 第三次调用（应该重新计算）
      node.execute(context);
      expect(callCount).toBe(2);
    });
  });

  describe('BehaviorTreeBatchExecutor', () => {
    it('should execute multiple trees', () => {
      const executor = new BehaviorTreeBatchExecutor();

      // 创建两个行为树
      const tree1 = new BehaviorTree('tree1', 'Tree 1');
      const tree2 = new BehaviorTree('tree2', 'Tree 2');

      const action1 = new ActionNode('action1', () => BehaviorNodeStatus.SUCCESS);
      const action2 = new ActionNode('action2', () => BehaviorNodeStatus.FAILURE);

      tree1.setRoot(action1);
      tree2.setRoot(action2);

      // 添加到执行器
      const context1 = {};
      const context2 = {};
      executor.addTree(tree1, context1);
      executor.addTree(tree2, context2);

      // 执行所有行为树
      const results = executor.executeAll();

      expect(results.size).toBe(2);
      expect(results.get(tree1)).toBe(BehaviorNodeStatus.SUCCESS);
      expect(results.get(tree2)).toBe(BehaviorNodeStatus.FAILURE);
    });

    it('should clear the executor', () => {
      const executor = new BehaviorTreeBatchExecutor();
      const tree = new BehaviorTree('tree', 'Test Tree');
      executor.addTree(tree, {});

      expect(executor.getTreeCount()).toBe(1);
      executor.clear();
      expect(executor.getTreeCount()).toBe(0);
    });
  });

  describe('PrioritizedBehaviorTree', () => {
    it('should execute nodes in priority order', () => {
      const executionOrder: string[] = [];

      const highPriorityAction = new ActionNode('high', () => {
        executionOrder.push('high');
        return BehaviorNodeStatus.FAILURE;
      });

      const mediumPriorityAction = new ActionNode('medium', () => {
        executionOrder.push('medium');
        return BehaviorNodeStatus.FAILURE;
      });

      const lowPriorityAction = new ActionNode('low', () => {
        executionOrder.push('low');
        return BehaviorNodeStatus.SUCCESS;
      });

      const tree = new PrioritizedBehaviorTree('prioritized', 'Prioritized Tree');
      const sequence = new SequenceNode('sequence');

      sequence.addChild(lowPriorityAction);
      sequence.addChild(mediumPriorityAction);
      sequence.addChild(highPriorityAction);
      tree.setRoot(sequence);

      // 设置优先级
      tree.setNodePriority('high', 3);
      tree.setNodePriority('medium', 2);
      tree.setNodePriority('low', 1);

      // 执行行为树
      tree.execute({});

      // 验证执行顺序（按优先级）
      expect(executionOrder).toEqual(['high', 'medium', 'low']);
    });

    it('should return success when high priority node succeeds', () => {
      const highPriorityAction = new ActionNode('high', () => BehaviorNodeStatus.SUCCESS);
      const lowPriorityAction = new ActionNode('low', () => {
        throw new Error('Should not execute');
      });

      const tree = new PrioritizedBehaviorTree('prioritized', 'Prioritized Tree');
      const sequence = new SequenceNode('sequence');

      sequence.addChild(lowPriorityAction);
      sequence.addChild(highPriorityAction);
      tree.setRoot(sequence);

      // 设置优先级
      tree.setNodePriority('high', 2);
      tree.setNodePriority('low', 1);

      // 执行行为树，应该优先执行高优先级节点并成功返回
      const result = tree.execute({});
      expect(result).toBe(BehaviorNodeStatus.SUCCESS);
    });
  });

  describe('PerformanceMonitor', () => {
    it('should record execution times', () => {
      const monitor = new PerformanceMonitor();

      // 记录执行时间
      monitor.recordExecution('node1', 10);
      monitor.recordExecution('node1', 20);
      monitor.recordExecution('node2', 15);

      // 验证统计数据
      expect(monitor.getTotalExecutions('node1')).toBe(2);
      expect(monitor.getTotalExecutions('node2')).toBe(1);
      expect(monitor.getAverageExecutionTime('node1')).toBe(15);
      expect(monitor.getAverageExecutionTime('node2')).toBe(15);
    });

    it('should generate performance report', () => {
      const monitor = new PerformanceMonitor();
      monitor.recordExecution('node1', 10);
      monitor.recordExecution('node1', 30);

      const report = monitor.generateReport();

      expect(report.node1).toEqual({
        averageExecutionTime: 20,
        totalExecutions: 2,
        maxExecutionTime: 30,
        minExecutionTime: 10
      });
    });

    it('should reset monitoring data', () => {
      const monitor = new PerformanceMonitor();
      monitor.recordExecution('node1', 10);

      expect(monitor.getTotalExecutions('node1')).toBe(1);

      monitor.reset();
      expect(monitor.getTotalExecutions('node1')).toBe(0);
    });
  });

  describe('BehaviorTreeOptimizer', () => {
    it('should optimize behavior tree with performance monitoring', () => {
      const monitor = new PerformanceMonitor();
      const tree = new BehaviorTree('optimized', 'Optimized Tree');
      const action = new ActionNode('action', () => {
        // 模拟耗时操作
        let sum = 0;
        for (let i = 0; i < 1000; i++) {
          sum += i;
        }
        return BehaviorNodeStatus.SUCCESS;
      });

      tree.setRoot(action);

      // 优化行为树
      BehaviorTreeOptimizer.optimize(tree, monitor);

      // 执行行为树
      tree.execute({});

      // 验证监控数据被记录
      expect(monitor.getTotalExecutions('optimized')).toBe(1);
    });
  });
});
