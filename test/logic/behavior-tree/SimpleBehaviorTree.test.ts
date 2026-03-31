import { describe, it, expect } from 'vitest';
import {
  BehaviorTree,
  BehaviorNodeStatus,
  SuccessNode,
  FailureNode,
  ActionNode,
  ConditionNode
} from '../../../src';

describe('SimpleBehaviorTree', () => {
  it('should create behavior tree with success node', () => {
    const root = new SuccessNode('root');
    const tree = new BehaviorTree('test-tree', 'Test Tree', root);
    
    const result = tree.execute({});
    expect(result).toBe(BehaviorNodeStatus.SUCCESS);
  });

  it('should create behavior tree with failure node', () => {
    const root = new FailureNode('root');
    const tree = new BehaviorTree('test-tree', 'Test Tree', root);
    
    const result = tree.execute({});
    expect(result).toBe(BehaviorNodeStatus.FAILURE);
  });

  it('should execute action node', () => {
    let executed = false;
    const action = new ActionNode('action', () => {
      executed = true;
      return BehaviorNodeStatus.SUCCESS;
    });
    
    const tree = new BehaviorTree('test-tree', 'Test Tree', action);
    const result = tree.execute({});
    
    expect(result).toBe(BehaviorNodeStatus.SUCCESS);
    expect(executed).toBe(true);
  });

  it('should execute condition node with true condition', () => {
    const condition = new ConditionNode('condition', () => true);
    
    const tree = new BehaviorTree('test-tree', 'Test Tree', condition);
    const result = tree.execute({});
    
    expect(result).toBe(BehaviorNodeStatus.SUCCESS);
  });

  it('should execute condition node with false condition', () => {
    const condition = new ConditionNode('condition', () => false);
    
    const tree = new BehaviorTree('test-tree', 'Test Tree', condition);
    const result = tree.execute({});
    
    expect(result).toBe(BehaviorNodeStatus.FAILURE);
  });
});