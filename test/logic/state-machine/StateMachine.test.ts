import { describe, it, expect, beforeEach } from 'vitest';
import {
  BaseStateMachine,
  StateInterface,
  AlwaysTrueCondition,
  TimeCondition,
  PropertyCondition,
  AndCondition,
  OrCondition,
  NotCondition
} from '../../../src/logic/state-machine';

// 测试状态类
class TestState implements StateInterface {
  public enterCalled: boolean = false;
  public updateCalled: boolean = false;
  public exitCalled: boolean = false;
  public updateCount: number = 0;

  constructor(public name: string) {}

  enter(context: any): void {
    this.enterCalled = true;
    context.enterState = this.name;
  }

  update(context: any, deltaTime: number): void {
    this.updateCalled = true;
    this.updateCount++;
    context.updateState = this.name;
    context.deltaTime = deltaTime;
  }

  exit(context: any): void {
    this.exitCalled = true;
    context.exitState = this.name;
  }

  reset(): void {
    this.enterCalled = false;
    this.updateCalled = false;
    this.exitCalled = false;
    this.updateCount = 0;
  }
}

describe('State Machine', () => {
  let stateMachine: BaseStateMachine;
  let context: any;
  let stateA: TestState;
  let stateB: TestState;
  let stateC: TestState;

  beforeEach(() => {
    context = {
      enterState: '',
      exitState: '',
      updateState: '',
      deltaTime: 0,
      testProperty: false
    };

    stateMachine = new BaseStateMachine(context);
    
    stateA = new TestState('StateA');
    stateB = new TestState('StateB');
    stateC = new TestState('StateC');

    stateMachine.addState(stateA);
    stateMachine.addState(stateB);
    stateMachine.addState(stateC);
  });

  describe('Basic Functionality', () => {
    it('should initialize with initial state', () => {
      stateMachine.initialize('StateA');
      
      expect(stateMachine.currentState).toBe('StateA');
      expect(stateA.enterCalled).toBe(true);
      expect(context.enterState).toBe('StateA');
    });

    it('should throw error when initializing with non-existent state', () => {
      expect(() => stateMachine.initialize('NonExistentState')).toThrowError();
    });

    it('should update current state', () => {
      stateMachine.initialize('StateA');
      stateMachine.update(0.016);
      
      expect(stateA.updateCalled).toBe(true);
      expect(stateA.updateCount).toBe(1);
      expect(context.updateState).toBe('StateA');
      expect(context.deltaTime).toBe(0.016);
    });

    it('should change state manually', () => {
      stateMachine.initialize('StateA');
      stateMachine.changeState('StateB');
      
      expect(stateA.exitCalled).toBe(true);
      expect(stateB.enterCalled).toBe(true);
      expect(stateMachine.currentState).toBe('StateB');
      expect(context.exitState).toBe('StateA');
      expect(context.enterState).toBe('StateB');
    });

    it('should not change state if already in target state', () => {
      stateMachine.initialize('StateA');
      stateA.reset();
      
      stateMachine.changeState('StateA');
      
      expect(stateA.enterCalled).toBe(false);
      expect(stateA.exitCalled).toBe(false);
    });

    it('should throw error when changing to non-existent state', () => {
      stateMachine.initialize('StateA');
      
      expect(() => stateMachine.changeState('NonExistentState')).toThrowError();
    });

    it('should check if in specific state', () => {
      stateMachine.initialize('StateA');
      
      expect(stateMachine.isInState('StateA')).toBe(true);
      expect(stateMachine.isInState('StateB')).toBe(false);
    });

    it('should get all states', () => {
      const states = stateMachine.getStates();
      
      expect(states).toContain('StateA');
      expect(states).toContain('StateB');
      expect(states).toContain('StateC');
      expect(states).toHaveLength(3);
    });
  });

  describe('Transitions', () => {
    it('should transition automatically based on condition', () => {
      // 添加从A到B的转换
      stateMachine.addTransition({
        from: 'StateA',
        to: 'StateB',
        condition: new AlwaysTrueCondition()
      });

      stateMachine.initialize('StateA');
      stateMachine.update(0.016);
      
      expect(stateMachine.currentState).toBe('StateB');
    });

    it('should not transition when condition is false', () => {
      // 添加从A到B的转换，但条件永远为false
      const neverCondition = {
        canTransition: () => false
      };

      stateMachine.addTransition({
        from: 'StateA',
        to: 'StateB',
        condition: neverCondition
      });

      stateMachine.initialize('StateA');
      stateMachine.update(0.016);
      
      expect(stateMachine.currentState).toBe('StateA');
    });

    it('should execute transition action', () => {
      let actionCalled = false;

      stateMachine.addTransition({
        from: 'StateA',
        to: 'StateB',
        condition: new AlwaysTrueCondition(),
        action: () => {
          actionCalled = true;
        }
      });

      stateMachine.initialize('StateA');
      stateMachine.update(0.016);
      
      expect(actionCalled).toBe(true);
      expect(stateMachine.currentState).toBe('StateB');
    });

    it('should get transitions from current state', () => {
      stateMachine.addTransition({
        from: 'StateA',
        to: 'StateB',
        condition: new AlwaysTrueCondition()
      });

      stateMachine.initialize('StateA');
      const transitions = stateMachine.getTransitions();
      
      expect(transitions).toHaveLength(1);
      expect(transitions[0].from).toBe('StateA');
      expect(transitions[0].to).toBe('StateB');
    });
  });

  describe('Conditions', () => {
    it('should use TimeCondition', () => {
      const timeCondition = new TimeCondition(1000); // 1秒
      
      stateMachine.addTransition({
        from: 'StateA',
        to: 'StateB',
        condition: timeCondition
      });

      stateMachine.initialize('StateA');
      
      // 时间不足，不转换
      context.deltaTime = 500;
      stateMachine.update(0.5);
      expect(stateMachine.currentState).toBe('StateA');
      
      // 时间足够，转换
      context.deltaTime = 600;
      stateMachine.update(0.6);
      expect(stateMachine.currentState).toBe('StateB');
    });

    it('should use PropertyCondition', () => {
      stateMachine.addTransition({
        from: 'StateA',
        to: 'StateB',
        condition: new PropertyCondition('testProperty', true)
      });

      stateMachine.initialize('StateA');
      
      // 属性值为false，不转换
      stateMachine.update(0.016);
      expect(stateMachine.currentState).toBe('StateA');
      
      // 属性值为true，转换
      context.testProperty = true;
      stateMachine.update(0.016);
      expect(stateMachine.currentState).toBe('StateB');
    });

    it('should use AndCondition', () => {
      const condition1 = new PropertyCondition('testProperty', true);
      const timeCondition = new TimeCondition(1000);
      
      stateMachine.addTransition({
        from: 'StateA',
        to: 'StateB',
        condition: new AndCondition(condition1, timeCondition)
      });

      stateMachine.initialize('StateA');
      
      // 条件1满足，时间不足，不转换
      context.testProperty = true;
      context.deltaTime = 500;
      stateMachine.update(0.5);
      expect(stateMachine.currentState).toBe('StateA');
      
      // 两个条件都满足，转换
      context.deltaTime = 600;
      stateMachine.update(0.6);
      expect(stateMachine.currentState).toBe('StateB');
    });

    it('should use OrCondition', () => {
      const condition1 = new PropertyCondition('testProperty', true);
      const condition2 = new PropertyCondition('testProperty', false);
      
      stateMachine.addTransition({
        from: 'StateA',
        to: 'StateB',
        condition: new OrCondition(condition1, condition2)
      });

      stateMachine.initialize('StateA');
      
      // 任意条件满足，转换
      stateMachine.update(0.016);
      expect(stateMachine.currentState).toBe('StateB');
    });

    it('should use NotCondition', () => {
      stateMachine.addTransition({
        from: 'StateA',
        to: 'StateB',
        condition: new NotCondition(new PropertyCondition('testProperty', true))
      });

      stateMachine.initialize('StateA');
      
      // 属性为false，条件满足，转换
      stateMachine.update(0.016);
      expect(stateMachine.currentState).toBe('StateB');
    });
  });

  describe('Context Management', () => {
    it('should set and get context', () => {
      const newContext = { test: 'value' };
      stateMachine.setContext(newContext);
      
      expect(stateMachine.getContext()).toBe(newContext);
    });
  });
});