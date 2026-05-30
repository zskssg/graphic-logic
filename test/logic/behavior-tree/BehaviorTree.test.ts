import { describe, it, expect } from 'vitest';
import {
  BehaviorTree,
  BehaviorNodeStatus,
  // 组合节点
  SequenceNode,
  SelectorNode,
  BehaviorParallelNode,
  RandomNode,
  // 装饰节点
  InverterNode,
  RepeaterNode,
  SucceederNode,
  FailerNode,
  ConditionDecoratorNode,
  TimeoutNode,
  // 叶子节点
  ActionNode,
  ConditionNode,
  SuccessNode,
  FailureNode,
  RunningNode,
  ErrorNode,
  WaitNode,
  LogNode
} from '../../../src';

describe('BehaviorTree', () => {
  describe('基础功能测试', () => {
    it('should create behavior tree with root node', () => {
      const root = new SuccessNode('root');
      const tree = new BehaviorTree('test-tree', 'Test Tree', root);
      
      expect(tree.id).toBe('test-tree');
      expect(tree.name).toBe('Test Tree');
      expect(tree.root).toBe(root);
    });

    it('should execute behavior tree', () => {
      const root = new SuccessNode('root');
      const tree = new BehaviorTree('test-tree', 'Test Tree', root);
      
      const result = tree.execute({});
      expect(result).toBe(BehaviorNodeStatus.SUCCESS);
      expect(tree.getStatus()).toBe(BehaviorNodeStatus.SUCCESS);
    });

    it('should reset behavior tree', () => {
      const root = new RunningNode('root');
      const tree = new BehaviorTree('test-tree', 'Test Tree', root);
      
      tree.execute({});
      expect(tree.getStatus()).toBe(BehaviorNodeStatus.RUNNING);
      
      tree.reset();
      expect(tree.getStatus()).toBe(BehaviorNodeStatus.SUCCESS);
    });

    it('should get tree info', () => {
      const root = new SuccessNode('root');
      const tree = new BehaviorTree('test-tree', 'Test Tree', root);
      
      const info = tree.getInfo();
      expect(info.id).toBe('test-tree');
      expect(info.name).toBe('Test Tree');
      expect(info.status).toBe(BehaviorNodeStatus.SUCCESS);
      expect(info.hasRoot).toBe(true);
    });

    it('should check tree validity', () => {
      const root = new SuccessNode('root');
      const tree = new BehaviorTree('test-tree', 'Test Tree', root);
      
      expect(tree.isValid()).toBe(true);
    });

    it('should serialize behavior tree', () => {
      const root = new SuccessNode('root');
      const tree = new BehaviorTree('test-tree', 'Test Tree', root);
      
      const serialized = tree.serialize();
      expect(serialized.id).toBe('test-tree');
      expect(serialized.name).toBe('Test Tree');
      expect(serialized.status).toBe(BehaviorNodeStatus.SUCCESS);
      expect(serialized.root).toBeDefined();
    });
  });

  describe('组合节点测试', () => {
    describe('SequenceNode', () => {
      it('should execute all children in sequence when all succeed', () => {
        const sequence = new SequenceNode('sequence');
        const action1 = new ActionNode('action1', () => BehaviorNodeStatus.SUCCESS);
        const action2 = new ActionNode('action2', () => BehaviorNodeStatus.SUCCESS);
        const action3 = new ActionNode('action3', () => BehaviorNodeStatus.SUCCESS);
        
        sequence.addChild(action1);
        sequence.addChild(action2);
        sequence.addChild(action3);
        
        const tree = new BehaviorTree('sequence-test', 'Sequence Test', sequence);
        const result = tree.execute({});
        
        expect(result).toBe(BehaviorNodeStatus.SUCCESS);
      });

      it('should stop execution when a child fails', () => {
        const sequence = new SequenceNode('sequence');
        const action1 = new ActionNode('action1', () => BehaviorNodeStatus.SUCCESS);
        const action2 = new ActionNode('action2', () => BehaviorNodeStatus.FAILURE);
        const action3 = new ActionNode('action3', () => BehaviorNodeStatus.SUCCESS);
        
        sequence.addChild(action1);
        sequence.addChild(action2);
        sequence.addChild(action3);
        
        const tree = new BehaviorTree('sequence-test', 'Sequence Test', sequence);
        const result = tree.execute({});
        
        expect(result).toBe(BehaviorNodeStatus.FAILURE);
      });

      it('should return running when a child is running', () => {
        const sequence = new SequenceNode('sequence');
        const action1 = new ActionNode('action1', () => BehaviorNodeStatus.SUCCESS);
        const action2 = new ActionNode('action2', () => BehaviorNodeStatus.RUNNING);
        const action3 = new ActionNode('action3', () => BehaviorNodeStatus.SUCCESS);
        
        sequence.addChild(action1);
        sequence.addChild(action2);
        sequence.addChild(action3);
        
        const tree = new BehaviorTree('sequence-test', 'Sequence Test', sequence);
        const result = tree.execute({});
        
        expect(result).toBe(BehaviorNodeStatus.RUNNING);
      });
    });

    describe('SelectorNode', () => {
      it('should return success when any child succeeds', () => {
        const selector = new SelectorNode('selector');
        const action1 = new ActionNode('action1', () => BehaviorNodeStatus.FAILURE);
        const action2 = new ActionNode('action2', () => BehaviorNodeStatus.SUCCESS);
        const action3 = new ActionNode('action3', () => BehaviorNodeStatus.FAILURE);
        
        selector.addChild(action1);
        selector.addChild(action2);
        selector.addChild(action3);
        
        const tree = new BehaviorTree('selector-test', 'Selector Test', selector);
        const result = tree.execute({});
        
        expect(result).toBe(BehaviorNodeStatus.SUCCESS);
      });

      it('should return failure when all children fail', () => {
        const selector = new SelectorNode('selector');
        const action1 = new ActionNode('action1', () => BehaviorNodeStatus.FAILURE);
        const action2 = new ActionNode('action2', () => BehaviorNodeStatus.FAILURE);
        const action3 = new ActionNode('action3', () => BehaviorNodeStatus.FAILURE);
        
        selector.addChild(action1);
        selector.addChild(action2);
        selector.addChild(action3);
        
        const tree = new BehaviorTree('selector-test', 'Selector Test', selector);
        const result = tree.execute({});
        
        expect(result).toBe(BehaviorNodeStatus.FAILURE);
      });

      it('should return running when a child is running', () => {
        const selector = new SelectorNode('selector');
        const action1 = new ActionNode('action1', () => BehaviorNodeStatus.FAILURE);
        const action2 = new ActionNode('action2', () => BehaviorNodeStatus.RUNNING);
        const action3 = new ActionNode('action3', () => BehaviorNodeStatus.FAILURE);
        
        selector.addChild(action1);
        selector.addChild(action2);
        selector.addChild(action3);
        
        const tree = new BehaviorTree('selector-test', 'Selector Test', selector);
        const result = tree.execute({});
        
        expect(result).toBe(BehaviorNodeStatus.RUNNING);
      });
    });

    describe('BehaviorParallelNode', () => {
      it('should return success when success threshold is met', () => {
        const parallel = new BehaviorParallelNode('parallel', 2);
        const action1 = new ActionNode('action1', () => BehaviorNodeStatus.SUCCESS);
        const action2 = new ActionNode('action2', () => BehaviorNodeStatus.SUCCESS);
        const action3 = new ActionNode('action3', () => BehaviorNodeStatus.FAILURE);
        
        parallel.addChild(action1);
        parallel.addChild(action2);
        parallel.addChild(action3);
        
        const tree = new BehaviorTree('parallel-test', 'Parallel Test', parallel);
        const result = tree.execute({});
        
        expect(result).toBe(BehaviorNodeStatus.SUCCESS);
      });

      it('should return failure when failure threshold is met', () => {
        const parallel = new BehaviorParallelNode('parallel', 3, 2);
        const action1 = new ActionNode('action1', () => BehaviorNodeStatus.FAILURE);
        const action2 = new ActionNode('action2', () => BehaviorNodeStatus.FAILURE);
        const action3 = new ActionNode('action3', () => BehaviorNodeStatus.SUCCESS);
        
        parallel.addChild(action1);
        parallel.addChild(action2);
        parallel.addChild(action3);
        
        const tree = new BehaviorTree('parallel-test', 'Parallel Test', parallel);
        const result = tree.execute({});
        
        expect(result).toBe(BehaviorNodeStatus.FAILURE);
      });

       it('should return running when some children are running', () => {
        const parallel = new BehaviorParallelNode('parallel', 2, 2); // 成功阈值2，失败阈值2
        const action1 = new ActionNode('action1', () => BehaviorNodeStatus.SUCCESS);
        const action2 = new ActionNode('action2', () => BehaviorNodeStatus.RUNNING);
        const action3 = new ActionNode('action3', () => BehaviorNodeStatus.FAILURE);
        
        parallel.addChild(action1);
        parallel.addChild(action2);
        parallel.addChild(action3);
        
        const tree = new BehaviorTree('parallel-test', 'Parallel Test', parallel);
        const result = tree.execute({});
        
        expect(result).toBe(BehaviorNodeStatus.RUNNING);
      });
    });

    describe('RandomNode', () => {
      it('should select a random child', () => {
        const random = new RandomNode('random');
        const action1 = new ActionNode('action1', () => BehaviorNodeStatus.SUCCESS);
        const action2 = new ActionNode('action2', () => BehaviorNodeStatus.SUCCESS);
        
        random.addChild(action1);
        random.addChild(action2);
        
        const tree = new BehaviorTree('random-test', 'Random Test', random);
        const result = tree.execute({});
        
        expect([BehaviorNodeStatus.SUCCESS, BehaviorNodeStatus.FAILURE]).toContain(result);
      });

      it('should return failure when no children', () => {
        const random = new RandomNode('random');
        const tree = new BehaviorTree('random-test', 'Random Test', random);
        const result = tree.execute({});
        
        expect(result).toBe(BehaviorNodeStatus.FAILURE);
      });
    });
  });

  describe('装饰节点测试', () => {
    describe('InverterNode', () => {
      it('should invert success to failure', () => {
        const inverter = new InverterNode('inverter');
        const child = new ActionNode('child', () => BehaviorNodeStatus.SUCCESS);
        inverter.setChild(child);
        
        const tree = new BehaviorTree('inverter-test', 'Inverter Test', inverter);
        const result = tree.execute({});
        
        expect(result).toBe(BehaviorNodeStatus.FAILURE);
      });

      it('should invert failure to success', () => {
        const inverter = new InverterNode('inverter');
        const child = new ActionNode('child', () => BehaviorNodeStatus.FAILURE);
        inverter.setChild(child);
        
        const tree = new BehaviorTree('inverter-test', 'Inverter Test', inverter);
        const result = tree.execute({});
        
        expect(result).toBe(BehaviorNodeStatus.SUCCESS);
      });

      it('should preserve running state', () => {
        const inverter = new InverterNode('inverter');
        const child = new ActionNode('child', () => BehaviorNodeStatus.RUNNING);
        inverter.setChild(child);
        
        const tree = new BehaviorTree('inverter-test', 'Inverter Test', inverter);
        const result = tree.execute({});
        
        expect(result).toBe(BehaviorNodeStatus.RUNNING);
      });
    });

    describe('RepeaterNode', () => {
      it('should repeat child a specified number of times', () => {
        let executionCount = 0;
        const repeater = new RepeaterNode('repeater', 3);
        const child = new ActionNode('child', () => {
          executionCount++;
          return BehaviorNodeStatus.SUCCESS;
        });
        repeater.setChild(child);
        
        const tree = new BehaviorTree('repeater-test', 'Repeater Test', repeater);
        
        // 第一次执行（开始重复）
        let result = tree.execute({});
        expect(result).toBe(BehaviorNodeStatus.RUNNING);
        expect(executionCount).toBe(1);
        
        // 第二次执行
        result = tree.execute({});
        expect(result).toBe(BehaviorNodeStatus.RUNNING);
        expect(executionCount).toBe(2);
        
        // 第三次执行（完成重复）
        result = tree.execute({});
        expect(result).toBe(BehaviorNodeStatus.SUCCESS);
        expect(executionCount).toBe(3);
      });

      it('should reset counter when reset', () => {
        let executionCount = 0;
        const repeater = new RepeaterNode('repeater', 2);
        const child = new ActionNode('child', () => {
          executionCount++;
          return BehaviorNodeStatus.SUCCESS;
        });
        repeater.setChild(child);
        
        const tree = new BehaviorTree('repeater-test', 'Repeater Test', repeater);
        
        tree.execute({});
        expect(executionCount).toBe(1);
        
        tree.reset();
        executionCount = 0;
        
        tree.execute({});
        expect(executionCount).toBe(1);
      });
    });

    describe('SucceederNode', () => {
      it('should always return success regardless of child result', () => {
        const succeeder = new SucceederNode('succeeder');
        const child = new ActionNode('child', () => BehaviorNodeStatus.FAILURE);
        succeeder.setChild(child);
        
        const tree = new BehaviorTree('succeeder-test', 'Succeeder Test', succeeder);
        const result = tree.execute({});
        
        expect(result).toBe(BehaviorNodeStatus.SUCCESS);
      });
    });

    describe('FailerNode', () => {
      it('should always return failure regardless of child result', () => {
        const failer = new FailerNode('failer');
        const child = new ActionNode('child', () => BehaviorNodeStatus.SUCCESS);
        failer.setChild(child);
        
        const tree = new BehaviorTree('failer-test', 'Failer Test', failer);
        const result = tree.execute({});
        
        expect(result).toBe(BehaviorNodeStatus.FAILURE);
      });
    });

    describe('ConditionDecoratorNode', () => {
      it('should execute child when condition is true', () => {
        const conditionDecorator = new ConditionDecoratorNode('condition', (context) => context.condition);
        const child = new ActionNode('child', () => BehaviorNodeStatus.SUCCESS);
        conditionDecorator.setChild(child);
        
        const tree = new BehaviorTree('condition-test', 'Condition Test', conditionDecorator);
        const result = tree.execute({ condition: true });
        
        expect(result).toBe(BehaviorNodeStatus.SUCCESS);
      });

      it('should not execute child when condition is false', () => {
        let childExecuted = false;
        const conditionDecorator = new ConditionDecoratorNode('condition', (context) => context.condition);
        const child = new ActionNode('child', () => {
          childExecuted = true;
          return BehaviorNodeStatus.SUCCESS;
        });
        conditionDecorator.setChild(child);
        
        const tree = new BehaviorTree('condition-test', 'Condition Test', conditionDecorator);
        const result = tree.execute({ condition: false });
        
        expect(result).toBe(BehaviorNodeStatus.FAILURE);
        expect(childExecuted).toBe(false);
      });
    });

    describe('TimeoutNode', () => {
      it('should return failure when timeout occurs', () => {
        const timeout = new TimeoutNode('timeout', 100);
        const child = new ActionNode('child', () => BehaviorNodeStatus.RUNNING);
        timeout.setChild(child);
        
        const tree = new BehaviorTree('timeout-test', 'Timeout Test', timeout);
        
        // 第一次执行（开始计时）
        tree.execute({});
        
        // 模拟时间流逝
        const originalDateNow = Date.now;
        Date.now = () => originalDateNow() + 200; // 200ms后
        
        const result = tree.execute({});
        
        Date.now = originalDateNow;
        expect(result).toBe(BehaviorNodeStatus.FAILURE);
      });

      it('should return success when child completes before timeout', () => {
        const timeout = new TimeoutNode('timeout', 100);
        const child = new ActionNode('child', () => BehaviorNodeStatus.SUCCESS);
        timeout.setChild(child);
        
        const tree = new BehaviorTree('timeout-test', 'Timeout Test', timeout);
        const result = tree.execute({});
        
        expect(result).toBe(BehaviorNodeStatus.SUCCESS);
      });

      it('should reset timeout when reset', () => {
        const timeout = new TimeoutNode('timeout', 100);
        const child = new ActionNode('child', () => BehaviorNodeStatus.RUNNING);
        timeout.setChild(child);
        
        const tree = new BehaviorTree('timeout-test', 'Timeout Test', timeout);
        
        // 第一次执行（开始计时）
        tree.execute({});
        
        // 重置
        tree.reset();
        
        // 模拟时间流逝但不超时
        const originalDateNow = Date.now;
        Date.now = () => originalDateNow() + 50; // 50ms后
        
        const result = tree.execute({});
        
        Date.now = originalDateNow;
        expect(result).toBe(BehaviorNodeStatus.RUNNING);
      });
    });
  });

  describe('叶子节点测试', () => {
    describe('ActionNode', () => {
      it('should execute action function', () => {
        let executed = false;
        const action = new ActionNode('action', (context) => {
          executed = true;
          context.result = 'success';
          return BehaviorNodeStatus.SUCCESS;
        });
        
        const tree = new BehaviorTree('action-test', 'Action Test', action);
        const context = { result: '' };
        const result = tree.execute(context);
        
        expect(result).toBe(BehaviorNodeStatus.SUCCESS);
        expect(executed).toBe(true);
        expect(context.result).toBe('success');
      });
    });

    describe('ConditionNode', () => {
      it('should return success when condition is true', () => {
        const condition = new ConditionNode('condition', (context) => context.value > 0);
        
        const tree = new BehaviorTree('condition-test', 'Condition Test', condition);
        const result = tree.execute({ value: 10 });
        
        expect(result).toBe(BehaviorNodeStatus.SUCCESS);
      });

      it('should return failure when condition is false', () => {
        const condition = new ConditionNode('condition', (context) => context.value > 0);
        
        const tree = new BehaviorTree('condition-test', 'Condition Test', condition);
        const result = tree.execute({ value: -10 });
        
        expect(result).toBe(BehaviorNodeStatus.FAILURE);
      });
    });

    describe('WaitNode', () => {
      it('should return running during wait time', () => {
        const wait = new WaitNode('wait', 100);
        
        const tree = new BehaviorTree('wait-test', 'Wait Test', wait);
        const result = tree.execute({});
        
        expect(result).toBe(BehaviorNodeStatus.RUNNING);
      });

      it('should return success after wait time', () => {
        const wait = new WaitNode('wait', 100);
        
        const tree = new BehaviorTree('wait-test', 'Wait Test', wait);
        
        // 保存原始Date.now
        const originalDateNow = Date.now;
        
        // 设置模拟时间
        let mockTime = originalDateNow();
        Date.now = () => mockTime;
        
        // 第一次执行（开始等待）
        tree.execute({});
        
        // 模拟时间流逝
        mockTime += 200; // 200ms后
        
        // 第二次执行（检查是否完成等待）
        const result = tree.execute({});
        
        // 恢复原始Date.now
        Date.now = originalDateNow;
        
        expect(result).toBe(BehaviorNodeStatus.SUCCESS);
      });

      it('should reset wait time when reset', () => {
        const wait = new WaitNode('wait', 100);
        
        const tree = new BehaviorTree('wait-test', 'Wait Test', wait);
        
        // 第一次执行（开始等待）
        tree.execute({});
        
        // 重置
        tree.reset();
        
        // 模拟时间流逝但不超时
        const originalDateNow = Date.now;
        Date.now = () => originalDateNow() + 50; // 50ms后
        
        const result = tree.execute({});
        
        Date.now = originalDateNow;
        expect(result).toBe(BehaviorNodeStatus.RUNNING);
      });
    });

    describe('LogNode', () => {
      it('should log message with context variables', () => {
        const log = new LogNode('log', 'Value: {value}', 'info');
        
        const tree = new BehaviorTree('log-test', 'Log Test', log);
        const result = tree.execute({ value: 42 });
        
        expect(result).toBe(BehaviorNodeStatus.SUCCESS);
      });
    });

    describe('状态节点', () => {
      it('should return success for SuccessNode', () => {
        const success = new SuccessNode('success');
        
        const tree = new BehaviorTree('success-test', 'Success Test', success);
        const result = tree.execute({});
        
        expect(result).toBe(BehaviorNodeStatus.SUCCESS);
      });

      it('should return failure for FailureNode', () => {
        const failure = new FailureNode('failure');
        
        const tree = new BehaviorTree('failure-test', 'Failure Test', failure);
        const result = tree.execute({});
        
        expect(result).toBe(BehaviorNodeStatus.FAILURE);
      });

      it('should return running for RunningNode', () => {
        const running = new RunningNode('running');
        
        const tree = new BehaviorTree('running-test', 'Running Test', running);
        const result = tree.execute({});
        
        expect(result).toBe(BehaviorNodeStatus.RUNNING);
      });

      it('should return error for ErrorNode', () => {
        const error = new ErrorNode('error');
        
        const tree = new BehaviorTree('error-test', 'Error Test', error);
        const result = tree.execute({});
        
        expect(result).toBe(BehaviorNodeStatus.ERROR);
      });
    });
  });

  describe('复杂行为树测试', () => {
    it('should handle complex behavior tree structure', () => {
      // 创建复杂的行为树结构
      const root = new SelectorNode('root');
      
      // 分支1: 紧急情况处理
      const emergencySequence = new SequenceNode('emergency');
      emergencySequence.addChild(new ConditionNode('low-health', (ctx) => ctx.health < 20));
      emergencySequence.addChild(new ActionNode('flee', (ctx) => {
        ctx.action = 'flee';
        return BehaviorNodeStatus.SUCCESS;
      }));
      
      // 分支2: 攻击逻辑
      const attackSequence = new SequenceNode('attack');
      attackSequence.addChild(new ConditionNode('has-target', (ctx) => ctx.hasTarget));
      attackSequence.addChild(new ConditionNode('in-range', (ctx) => ctx.distance < 5));
      attackSequence.addChild(new ActionNode('attack', (ctx) => {
        ctx.action = 'attack';
        return BehaviorNodeStatus.SUCCESS;
      }));
      
      // 分支3: 巡逻逻辑
      const patrolSequence = new SequenceNode('patrol');
      const inverter = new InverterNode('no-target');
      inverter.setChild(new ConditionNode('check-target', (ctx) => ctx.hasTarget));
      patrolSequence.addChild(inverter);
      patrolSequence.addChild(new ActionNode('patrol', (ctx) => {
        ctx.action = 'patrol';
        return BehaviorNodeStatus.SUCCESS;
      }));
      
      // 组装行为树
      root.addChild(emergencySequence);
      root.addChild(attackSequence);
      root.addChild(patrolSequence);
      
      const tree = new BehaviorTree('complex-test', 'Complex Test', root);
      
      // 测试紧急情况
      const emergencyContext = { health: 10, hasTarget: true, distance: 3, action: '' };
      tree.execute(emergencyContext);
      expect(emergencyContext.action).toBe('flee');
      
      // 测试攻击逻辑
      const attackContext = { health: 50, hasTarget: true, distance: 3, action: '' };
      tree.reset();
      tree.execute(attackContext);
      expect(attackContext.action).toBe('attack');
      
      // 测试巡逻逻辑
      const patrolContext = { health: 50, hasTarget: false, distance: 10, action: '' };
      tree.reset();
      tree.execute(patrolContext);
      expect(patrolContext.action).toBe('patrol');
    });

    it('should handle nested decorators', () => {
      const root = new SequenceNode('root');
      
      // 创建嵌套的装饰器结构：repeater -> inverter -> condition
      // 条件：count < 5，反转后为 count >= 5
      const repeater = new RepeaterNode('repeater', 2);
      const inverter = new InverterNode('inverter');
      const condition = new ConditionNode('condition', (ctx) => ctx.count < 5);
      
      inverter.setChild(condition);
      repeater.setChild(inverter);
      root.addChild(repeater);
      
      const tree = new BehaviorTree('nested-test', 'Nested Test', root);
      
      // 第一次执行：count = 6 >= 5，条件返回false，反转后为true
      // repeater执行子节点成功，currentRepeats = 1，继续重复
      let result = tree.execute({ count: 6 });
      expect(result).toBe(BehaviorNodeStatus.RUNNING);
      
      // 第二次执行：count = 6 >= 5，条件返回false，反转后为true
      // repeater执行子节点成功，currentRepeats = 2，达到最大次数，返回success
      result = tree.execute({ count: 6 });
      expect(result).toBe(BehaviorNodeStatus.SUCCESS);
    });

    it('should handle parallel execution with mixed results', () => {
      const parallel = new BehaviorParallelNode('parallel', 2, 2);
      
      // 添加不同结果的节点
      parallel.addChild(new ActionNode('success1', () => BehaviorNodeStatus.SUCCESS));
      parallel.addChild(new ActionNode('success2', () => BehaviorNodeStatus.SUCCESS));
      parallel.addChild(new ActionNode('failure', () => BehaviorNodeStatus.FAILURE));
      parallel.addChild(new ActionNode('running', () => BehaviorNodeStatus.RUNNING));
      
      const tree = new BehaviorTree('parallel-mixed-test', 'Parallel Mixed Test', parallel);
      const result = tree.execute({});
      
      expect(result).toBe(BehaviorNodeStatus.SUCCESS);
    });
  });

  describe('错误处理测试', () => {
      it('should return error status when action throws error', () => {
        const errorAction = new ActionNode('error-action', () => {
          throw new Error('Test error');
        });
        
        const tree = new BehaviorTree('error-test', 'Error Test', errorAction);
        
        const result = tree.execute({});
        expect(result).toBe(BehaviorNodeStatus.ERROR);
      });

      it('should have default root node when not provided', () => {
        const tree = new BehaviorTree('no-root-test', 'No Root Test');
        
        const root = tree.getRoot();
        expect(root).toBeDefined();
        expect(root.type).toBe('leaf');
      });
    });
});