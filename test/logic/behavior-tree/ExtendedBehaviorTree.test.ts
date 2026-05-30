import { describe, it, expect } from 'vitest';
import {
  BehaviorTree,
  ActionNode,
  BehaviorNodeStatus,
  // 扩展组合节点
  PriorityNode,
  WeightedParallelNode,
  ConditionalParallelNode,
  RandomWeightedNode,
  // 扩展装饰节点
  RetryNode,
  RateLimiterNode,
  CircuitBreakerNode,
  DelayedRetryNode,
  CounterNode,
  // 扩展叶子节点
  AsyncNode,
  CoroutineNode,
  EventNode,
  ParameterizedActionNode,
  DynamicConditionNode
} from '../../../src/logic/behavior-tree';

interface BehaviorTreeContext {
  _counters?: {
    [key: string]: number;
  };
  result?: any;
  phase?: string;
  event?: {
    name: string;
    data: any;
  };
  value?: number;
  action?: string;
  distance?: number;
}

describe('ExtendedBehaviorTree', () => {
  describe('扩展组合节点测试', () => {
    describe('PriorityNode', () => {
      it('should return success when first successful child is found', () => {
        const priority = new PriorityNode('priority');
        priority.addChild(new ActionNode('action1', () => BehaviorNodeStatus.FAILURE));
        priority.addChild(new ActionNode('action2', () => BehaviorNodeStatus.SUCCESS));
        priority.addChild(new ActionNode('action3', () => BehaviorNodeStatus.SUCCESS));

        const tree = new BehaviorTree('priority-test', 'Priority Test', priority);
        const result = tree.execute({});

        expect(result).toBe(BehaviorNodeStatus.SUCCESS);
      });

      it('should return running when a child is running', () => {
        const priority = new PriorityNode('priority');
        priority.addChild(new ActionNode('action1', () => BehaviorNodeStatus.FAILURE));
        priority.addChild(new ActionNode('action2', () => BehaviorNodeStatus.RUNNING));
        priority.addChild(new ActionNode('action3', () => BehaviorNodeStatus.SUCCESS));

        const tree = new BehaviorTree('priority-running-test', 'Priority Running Test', priority);
        const result = tree.execute({});

        expect(result).toBe(BehaviorNodeStatus.RUNNING);
      });

      it('should return failure when all children fail', () => {
        const priority = new PriorityNode('priority');
        priority.addChild(new ActionNode('action1', () => BehaviorNodeStatus.FAILURE));
        priority.addChild(new ActionNode('action2', () => BehaviorNodeStatus.FAILURE));
        priority.addChild(new ActionNode('action3', () => BehaviorNodeStatus.FAILURE));

        const tree = new BehaviorTree('priority-failure-test', 'Priority Failure Test', priority);
        const result = tree.execute({});

        expect(result).toBe(BehaviorNodeStatus.FAILURE);
      });
    });

    describe('WeightedParallelNode', () => {
      it('should return success when total weight meets threshold', () => {
        const weightedParallel = new WeightedParallelNode('weighted-parallel', 5);
        const action1 = new ActionNode('action1', () => BehaviorNodeStatus.SUCCESS);
        const action2 = new ActionNode('action2', () => BehaviorNodeStatus.SUCCESS);
        const action3 = new ActionNode('action3', () => BehaviorNodeStatus.FAILURE);

        weightedParallel.addChild(action1);
        weightedParallel.addChild(action2);
        weightedParallel.addChild(action3);

        weightedParallel.setChildWeight('action1', 3);
        weightedParallel.setChildWeight('action2', 2);
        weightedParallel.setChildWeight('action3', 1);

        const tree = new BehaviorTree('weighted-test', 'Weighted Test', weightedParallel);
        const result = tree.execute({});

        expect(result).toBe(BehaviorNodeStatus.SUCCESS);
      });

      it('should return failure when total weight does not meet threshold', () => {
        const weightedParallel = new WeightedParallelNode('weighted-parallel', 10);
        const action1 = new ActionNode('action1', () => BehaviorNodeStatus.SUCCESS);
        const action2 = new ActionNode('action2', () => BehaviorNodeStatus.SUCCESS);

        weightedParallel.addChild(action1);
        weightedParallel.addChild(action2);

        weightedParallel.setChildWeight('action1', 3);
        weightedParallel.setChildWeight('action2', 2);

        const tree = new BehaviorTree('weighted-failure-test', 'Weighted Failure Test', weightedParallel);
        const result = tree.execute({});

        expect(result).toBe(BehaviorNodeStatus.FAILURE);
      });

      it('should return running when some children are running', () => {
        const weightedParallel = new WeightedParallelNode('weighted-parallel', 5);
        const action1 = new ActionNode('action1', () => BehaviorNodeStatus.SUCCESS);
        const action2 = new ActionNode('action2', () => BehaviorNodeStatus.RUNNING);

        weightedParallel.addChild(action1);
        weightedParallel.addChild(action2);

        weightedParallel.setChildWeight('action1', 3);
        weightedParallel.setChildWeight('action2', 2);

        const tree = new BehaviorTree('weighted-running-test', 'Weighted Running Test', weightedParallel);
        const result = tree.execute({});

        expect(result).toBe(BehaviorNodeStatus.RUNNING);
      });
    });

    describe('ConditionalParallelNode', () => {
      it('should execute children that meet conditions', () => {
        const conditionalParallel = new ConditionalParallelNode('conditional-parallel');
        const attackAction = new ActionNode('attack', () => BehaviorNodeStatus.SUCCESS);
        const defendAction = new ActionNode('defend', () => BehaviorNodeStatus.SUCCESS);

        conditionalParallel.addChild(attackAction);
        conditionalParallel.addChild(defendAction);

        conditionalParallel.setChildCondition('attack', (ctx) => ctx.hasTarget);
        conditionalParallel.setChildCondition('defend', (ctx) => ctx.health < 30);

        const tree = new BehaviorTree('conditional-test', 'Conditional Test', conditionalParallel);

        // 只有attack条件满足
        const result1 = tree.execute({ hasTarget: true, health: 50 });
        expect(result1).toBe(BehaviorNodeStatus.SUCCESS);

        // 两个条件都满足
        const result2 = tree.execute({ hasTarget: true, health: 20 });
        expect(result2).toBe(BehaviorNodeStatus.SUCCESS);

        // 没有条件满足
        const result3 = tree.execute({ hasTarget: false, health: 50 });
        expect(result3).toBe(BehaviorNodeStatus.FAILURE);
      });

      it('should return running when some children are running', () => {
        const conditionalParallel = new ConditionalParallelNode('conditional-parallel');
        const attackAction = new ActionNode('attack', () => BehaviorNodeStatus.RUNNING);
        const defendAction = new ActionNode('defend', () => BehaviorNodeStatus.SUCCESS);

        conditionalParallel.addChild(attackAction);
        conditionalParallel.addChild(defendAction);

        conditionalParallel.setChildCondition('attack', (ctx) => ctx.hasTarget);
        conditionalParallel.setChildCondition('defend', (ctx) => ctx.health < 30);

        const tree = new BehaviorTree('conditional-running-test', 'Conditional Running Test', conditionalParallel);
        const result = tree.execute({ hasTarget: true, health: 20 });

        expect(result).toBe(BehaviorNodeStatus.RUNNING);
      });
    });

    describe('RandomWeightedNode', () => {
      it('should select child based on weights', () => {
        const randomWeighted = new RandomWeightedNode('random-weighted');
        const action1 = new ActionNode('action1', () => BehaviorNodeStatus.SUCCESS);
        const action2 = new ActionNode('action2', () => BehaviorNodeStatus.SUCCESS);

        randomWeighted.addChild(action1);
        randomWeighted.addChild(action2);

        randomWeighted.setChildWeight('action1', 1);
        randomWeighted.setChildWeight('action2', 1);

        const tree = new BehaviorTree('random-weighted-test', 'Random Weighted Test', randomWeighted);

        for (let i = 0; i < 10; i++) {
          tree.execute({});
        }

        expect(tree.getStatus()).toBe(BehaviorNodeStatus.SUCCESS);
      });

      it('should return failure when no children', () => {
        const randomWeighted = new RandomWeightedNode('random-weighted');

        const tree = new BehaviorTree('random-weighted-empty-test', 'Random Weighted Empty Test', randomWeighted);
        const result = tree.execute({});

        expect(result).toBe(BehaviorNodeStatus.FAILURE);
      });
    });
  });

  describe('扩展装饰节点测试', () => {
    describe('RetryNode', () => {
      it('should retry child specified number of times', () => {
        let attemptCount = 0;
        const retry = new RetryNode('retry', 3);
        const action = new ActionNode('action', () => {
          attemptCount++;
          return attemptCount <= 2 ? BehaviorNodeStatus.FAILURE : BehaviorNodeStatus.SUCCESS;
        });
        retry.setChild(action);

        const tree = new BehaviorTree('retry-test', 'Retry Test', retry);

        // 第一次执行（失败）
        let result = tree.execute({});
        expect(result).toBe(BehaviorNodeStatus.RUNNING);
        expect(attemptCount).toBe(1);

        // 第二次执行（失败）
        result = tree.execute({});
        expect(result).toBe(BehaviorNodeStatus.RUNNING);
        expect(attemptCount).toBe(2);

        // 第三次执行（成功）
        result = tree.execute({});
        expect(result).toBe(BehaviorNodeStatus.SUCCESS);
        expect(attemptCount).toBe(3);
      });

      it('should fail after max retries', () => {
        let attemptCount = 0;
        const retry = new RetryNode('retry', 2);
        const action = new ActionNode('action', () => {
          attemptCount++;
          return BehaviorNodeStatus.FAILURE;
        });
        retry.setChild(action);

        const tree = new BehaviorTree('retry-failure-test', 'Retry Failure Test', retry);

        // 第一次执行（失败）
        let result = tree.execute({});
        expect(result).toBe(BehaviorNodeStatus.RUNNING);
        expect(attemptCount).toBe(1);

        // 第二次执行（失败）
        result = tree.execute({});
        expect(result).toBe(BehaviorNodeStatus.RUNNING);
        expect(attemptCount).toBe(2);

        // 第三次执行（失败，达到最大重试次数）
        result = tree.execute({});
        expect(result).toBe(BehaviorNodeStatus.FAILURE);
        expect(attemptCount).toBe(3);
      });
    });

    describe('RateLimiterNode', () => {
      it('should limit execution rate', () => {
        let executionCount = 0;
        const rateLimiter = new RateLimiterNode('rate-limiter', 100);
        const action = new ActionNode('action', () => {
          executionCount++;
          return BehaviorNodeStatus.SUCCESS;
        });
        rateLimiter.setChild(action);

        const tree = new BehaviorTree('rate-limiter-test', 'Rate Limiter Test', rateLimiter);

        // 第一次执行（应该执行）
        let result = tree.execute({});
        expect(result).toBe(BehaviorNodeStatus.SUCCESS);
        expect(executionCount).toBe(1);

        // 立即再次执行（应该被限制）
        result = tree.execute({});
        expect(result).toBe(BehaviorNodeStatus.RUNNING);
        expect(executionCount).toBe(1);
      });
    });

    describe('CircuitBreakerNode', () => {
      it('should open circuit after repeated failures', () => {
        let failureCount = 0;
        const circuitBreaker = new CircuitBreakerNode('circuit-breaker', 2, 1000);
        const action = new ActionNode('action', () => {
          failureCount++;
          return BehaviorNodeStatus.FAILURE;
        });
        circuitBreaker.setChild(action);

        const tree = new BehaviorTree('circuit-breaker-test', 'Circuit Breaker Test', circuitBreaker);

        // 第一次失败
        let result = tree.execute({});
        expect(result).toBe(BehaviorNodeStatus.FAILURE);
        expect(failureCount).toBe(1);

        // 第二次失败（断路器应该打开）
        result = tree.execute({});
        expect(result).toBe(BehaviorNodeStatus.FAILURE);
        expect(failureCount).toBe(2);

        // 第三次执行（断路器已打开，应该直接失败）
        result = tree.execute({});
        expect(result).toBe(BehaviorNodeStatus.FAILURE);
        expect(failureCount).toBe(2); // 不再执行动作
      });
    });

    describe('DelayedRetryNode', () => {
      it('should retry with delay', () => {
        let attemptCount = 0;
        const delayedRetry = new DelayedRetryNode('delayed-retry', 2, 100);
        const action = new ActionNode('action', () => {
          attemptCount++;
          return attemptCount <= 1 ? BehaviorNodeStatus.FAILURE : BehaviorNodeStatus.SUCCESS;
        });
        delayedRetry.setChild(action);

        const tree = new BehaviorTree('delayed-retry-test', 'Delayed Retry Test', delayedRetry);

        // 第一次执行（失败）
        let result = tree.execute({});
        expect(result).toBe(BehaviorNodeStatus.RUNNING);
        expect(attemptCount).toBe(1);

        // 立即再次执行（应该等待延迟）
        result = tree.execute({});
        expect(result).toBe(BehaviorNodeStatus.RUNNING);
        expect(attemptCount).toBe(1);
      });
    });

    describe('CounterNode', () => {
      it('should count successful executions', () => {
        const counter = new CounterNode('counter');
        const action = new ActionNode('action', () => BehaviorNodeStatus.SUCCESS);
        counter.setChild(action);

        const tree = new BehaviorTree('counter-test', 'Counter Test', counter);
        const context: BehaviorTreeContext = {};

        for (let i = 0; i < 5; i++) {
          tree.execute(context);
        }

        expect(counter.getCount()).toBe(5);
        expect(context._counters?.['counter']).toBe(5);
      });

      it('should reset counter', () => {
        const counter = new CounterNode('counter');
        const action = new ActionNode('action', () => BehaviorNodeStatus.SUCCESS);
        counter.setChild(action);

        const tree = new BehaviorTree('counter-reset-test', 'Counter Reset Test', counter);

        // 执行几次
        tree.execute({});
        tree.execute({});

        expect(counter.getCount()).toBe(2);

        // 重置计数器
        counter.resetCount();
        expect(counter.getCount()).toBe(0);
      });
    });
  });

  describe('扩展叶子节点测试', () => {
    describe('AsyncNode', () => {
      it('should handle async operations', async () => {
        let completed = false;
        const asyncNode = new AsyncNode('async', async (context) => {
          await new Promise(resolve => setTimeout(resolve, 10));
          completed = true;
          context.result = 'async completed';
          return BehaviorNodeStatus.SUCCESS;
        });

        const tree = new BehaviorTree('async-test', 'Async Test', asyncNode);
        const context: BehaviorTreeContext = {};

        // 第一次执行（返回RUNNING）
        let result = tree.execute(context);
        expect(result).toBe(BehaviorNodeStatus.RUNNING);
        expect(completed).toBe(false);

        // 等待异步操作完成
        await new Promise(resolve => setTimeout(resolve, 20));

        // 再次执行（应该返回SUCCESS）
        result = tree.execute(context);
        expect(result).toBe(BehaviorNodeStatus.SUCCESS);
        expect(completed).toBe(true);
        expect(context.result).toBe('async completed');
      });
    });

    describe('CoroutineNode', () => {
      it('should handle generator functions', () => {
        const coroutineFunction = function* (context: any) {
          context.phase = 'starting';
          yield BehaviorNodeStatus.RUNNING;

          context.phase = 'processing';
          yield BehaviorNodeStatus.RUNNING;

          context.phase = 'completed';
          return BehaviorNodeStatus.SUCCESS;
        };

        const coroutineNode = new CoroutineNode('coroutine', coroutineFunction);
        const tree = new BehaviorTree('coroutine-test', 'Coroutine Test', coroutineNode);
        const context: BehaviorTreeContext = {};

        // 第一次执行
        let result = tree.execute(context);
        expect(result).toBe(BehaviorNodeStatus.RUNNING);
        expect(context.phase).toBe('starting');

        // 第二次执行
        result = tree.execute(context);
        expect(result).toBe(BehaviorNodeStatus.RUNNING);
        expect(context.phase).toBe('processing');

        // 第三次执行
        result = tree.execute(context);
        expect(result).toBe(BehaviorNodeStatus.SUCCESS);
        expect(context.phase).toBe('completed');
      });
    });

    describe('EventNode', () => {
      it('should wait for event trigger', () => {
        const eventNode = new EventNode('event', 'test-event');
        const tree = new BehaviorTree('event-test', 'Event Test', eventNode);
        const context: BehaviorTreeContext = {};

        // 第一次执行（等待事件）
        let result = tree.execute(context);
        expect(result).toBe(BehaviorNodeStatus.RUNNING);

        // 触发事件
        eventNode.trigger({ data: 'test data' });

        // 再次执行（事件已触发）
        result = tree.execute(context);
        expect(result).toBe(BehaviorNodeStatus.SUCCESS);
        expect(context.event?.name).toBe('test-event');
        expect(context.event?.data).toEqual({ data: 'test data' });
      });
    });

    describe('ParameterizedActionNode', () => {
      it('should execute with parameters', () => {
        const parameterizedAction = new ParameterizedActionNode(
          'parameterized',
          (context, params) => {
            context.result = params.value * params.multiplier;
            return BehaviorNodeStatus.SUCCESS;
          },
          { value: 10, multiplier: 2 }
        );

        const tree = new BehaviorTree('parameterized-test', 'Parameterized Test', parameterizedAction);
        const context: BehaviorTreeContext = {};

        tree.execute(context);
        expect(context.result).toBe(20);

        // 更新参数
        parameterizedAction.updateParams({ multiplier: 3 });
        tree.execute(context);
        expect(context.result).toBe(30);
      });
    });

    describe('DynamicConditionNode', () => {
      it('should evaluate condition with parameters', () => {
        const dynamicCondition = new DynamicConditionNode(
          'dynamic-condition',
          (context, params) => context.value > params.threshold,
          { threshold: 100 }
        );

        const tree = new BehaviorTree('dynamic-condition-test', 'Dynamic Condition Test', dynamicCondition);

        let result = tree.execute({ value: 150 });
        expect(result).toBe(BehaviorNodeStatus.SUCCESS); // 150 > 100

        // 更新阈值
        dynamicCondition.updateParams({ threshold: 200 });
        result = tree.execute({ value: 150 });
        expect(result).toBe(BehaviorNodeStatus.FAILURE); // 150 < 200

        result = tree.execute({ value: 250 });
        expect(result).toBe(BehaviorNodeStatus.SUCCESS); // 250 > 200
      });
    });
  });

  describe('动态行为树测试', () => {
    it('should support dynamic node modification', () => {
      const dynamicTree = new BehaviorTree('dynamic', 'Dynamic Behavior Tree');
      const root = new PriorityNode('root');

      // 动态添加节点
      function addDynamicActions(sequence: PriorityNode, actions: Array<() => BehaviorNodeStatus>) {
        actions.forEach((action, index) => {
          sequence.addChild(new ActionNode(`action-${index}`, action));
        });
      }

      addDynamicActions(root, [
        () => BehaviorNodeStatus.FAILURE,
        () => BehaviorNodeStatus.SUCCESS,
        () => BehaviorNodeStatus.SUCCESS
      ]);

      dynamicTree.setRoot(root);
      const result = dynamicTree.execute({});

      expect(result).toBe(BehaviorNodeStatus.SUCCESS);
    });

    it('should support behavior tree templates', () => {
      // 创建行为树模板工厂
      function createAttackBehavior(targetType: string) {
        const attackSequence = new PriorityNode(`attack-${targetType}`);

        if (targetType === 'melee') {
          attackSequence.addChild(new ActionNode('melee-attack', (ctx) => {
            ctx.action = 'melee-attack';
            return BehaviorNodeStatus.SUCCESS;
          }));
        } else {
          attackSequence.addChild(new ActionNode('ranged-attack', (ctx) => {
            ctx.action = 'ranged-attack';
            return BehaviorNodeStatus.SUCCESS;
          }));
        }

        return attackSequence;
      }

      const meleeAttack = createAttackBehavior('melee');
      const tree = new BehaviorTree('template-test', 'Template Test', meleeAttack);
      const context: BehaviorTreeContext = { distance: 1 };

      const result = tree.execute(context);
      expect(result).toBe(BehaviorNodeStatus.SUCCESS);
      expect(context.action).toBe('melee-attack');
    });
  });
});
