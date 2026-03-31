import { describe, it, expect, beforeEach } from 'vitest';
import {
  HierarchicalStateMachine,
  PushdownStateMachine,
  HierarchicalStateInterface,
  AlwaysTrueCondition
} from '../../../src/logic/state-machine';

// 测试状态类
class TestState implements HierarchicalStateInterface {
  public enterCalled: boolean = false;
  public updateCalled: boolean = false;
  public exitCalled: boolean = false;
  public updateCount: number = 0;
  public children: string[] = [];

  constructor(public name: string, public parent?: string, public defaultChild?: string) {}

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

describe('Advanced State Machines', () => {
  describe('Hierarchical State Machine', () => {
    let stateMachine: HierarchicalStateMachine;
    let context: any;
    let rootState: TestState;
    let parentState: TestState;
    let childState: TestState;
    let siblingState: TestState;

    beforeEach(() => {
      context = {
        enterState: '',
        exitState: '',
        updateState: '',
        deltaTime: 0
      };

      stateMachine = new HierarchicalStateMachine(context);
      
      rootState = new TestState('Root');
      parentState = new TestState('Parent', 'Root');
      childState = new TestState('Child', 'Parent');
      siblingState = new TestState('Sibling', 'Parent');

      stateMachine.addState(rootState);
      stateMachine.addState(parentState);
      stateMachine.addState(childState);
      stateMachine.addState(siblingState);
    });

    it('should initialize with state path', () => {
      stateMachine.initialize('Child');
      
      expect(stateMachine.currentState).toBe('Child');
      expect(rootState.enterCalled).toBe(true);
      expect(parentState.enterCalled).toBe(true);
      expect(childState.enterCalled).toBe(true);
    });

    it('should update all active states', () => {
      stateMachine.initialize('Child');
      stateMachine.update(0.016);
      
      expect(rootState.updateCalled).toBe(true);
      expect(parentState.updateCalled).toBe(true);
      expect(childState.updateCalled).toBe(true);
      expect(rootState.updateCount).toBe(1);
      expect(parentState.updateCount).toBe(1);
      expect(childState.updateCount).toBe(1);
    });

    it('should change state with proper enter/exit sequence', () => {
      stateMachine.initialize('Child');
      
      // 重置状态跟踪
      rootState.reset();
      parentState.reset();
      childState.reset();
      siblingState.reset();

      stateMachine.changeState('Sibling');
      
      expect(childState.exitCalled).toBe(true);
      expect(siblingState.enterCalled).toBe(true);
      expect(rootState.enterCalled).toBe(false); // 根状态不应该重新进入
      expect(parentState.enterCalled).toBe(false); // 父状态不应该重新进入
      expect(stateMachine.currentState).toBe('Sibling');
    });

    it('should get active states path', () => {
      stateMachine.initialize('Child');
      const activeStates = stateMachine.getActiveStates();
      
      expect(activeStates).toEqual(['Root', 'Parent', 'Child']);
    });

    it('should check if in state or substate', () => {
      stateMachine.initialize('Child');
      
      expect(stateMachine.isInStateOrSubstate('Root')).toBe(true);
      expect(stateMachine.isInStateOrSubstate('Parent')).toBe(true);
      expect(stateMachine.isInStateOrSubstate('Child')).toBe(true);
      expect(stateMachine.isInStateOrSubstate('Sibling')).toBe(false);
    });

    it('should handle transition between different branches', () => {
      stateMachine.initialize('Child');
      
      // 添加从Child到Sibling的转换
      stateMachine.addTransition({
        from: 'Child',
        to: 'Sibling',
        condition: new AlwaysTrueCondition()
      });

      // 更新应该触发转换
      stateMachine.update(0.016);
      
      expect(stateMachine.currentState).toBe('Sibling');
      expect(childState.exitCalled).toBe(true);
      expect(siblingState.enterCalled).toBe(true);
    });
  });

  describe('Pushdown State Machine', () => {
    let stateMachine: PushdownStateMachine;
    let context: any;
    let stateA: TestState;
    let stateB: TestState;
    let stateC: TestState;

    beforeEach(() => {
      context = {
        enterState: '',
        exitState: '',
        updateState: '',
        deltaTime: 0
      };

      stateMachine = new PushdownStateMachine(context);
      
      stateA = new TestState('StateA');
      stateB = new TestState('StateB');
      stateC = new TestState('StateC');

      stateMachine.addState(stateA);
      stateMachine.addState(stateB);
      stateMachine.addState(stateC);
    });

    it('should initialize with initial state', () => {
      stateMachine.initialize('StateA');
      
      expect(stateMachine.currentState).toBe('StateA');
      expect(stateA.enterCalled).toBe(true);
    });

    it('should push state onto stack', () => {
      stateMachine.initialize('StateA');
      
      // 重置状态跟踪
      stateA.reset();
      stateB.reset();

      stateMachine.pushState('StateB');
      
      expect(stateB.enterCalled).toBe(true);
      expect(stateMachine.currentState).toBe('StateB');
      expect(stateMachine.getStackDepth()).toBe(2);
      expect(stateMachine.getStateStack()).toEqual(['StateA', 'StateB']);
    });

    it('should pop state from stack', () => {
      stateMachine.initialize('StateA');
      stateMachine.pushState('StateB');
      
      // 重置状态跟踪
      stateA.reset();
      stateB.reset();

      stateMachine.popState();
      
      expect(stateB.exitCalled).toBe(true);
      expect(stateMachine.currentState).toBe('StateA');
      expect(stateMachine.getStackDepth()).toBe(1);
      expect(stateMachine.getStateStack()).toEqual(['StateA']);
    });

    it('should throw error when popping from empty stack', () => {
      stateMachine.initialize('StateA');
      
      expect(() => stateMachine.popState()).toThrowError();
    });

    it('should update only top state', () => {
      stateMachine.initialize('StateA');
      stateMachine.pushState('StateB');
      stateMachine.update(0.016);
      
      expect(stateB.updateCalled).toBe(true);
      expect(stateB.updateCount).toBe(1);
      expect(stateA.updateCalled).toBe(false); // 只有栈顶状态会更新
    });

    it('should change state by replacing top of stack', () => {
      stateMachine.initialize('StateA');
      stateMachine.pushState('StateB');
      
      // 重置状态跟踪
      stateB.reset();
      stateC.reset();

      stateMachine.changeState('StateC');
      
      expect(stateB.exitCalled).toBe(true);
      expect(stateC.enterCalled).toBe(true);
      expect(stateMachine.currentState).toBe('StateC');
      expect(stateMachine.getStackDepth()).toBe(2);
      expect(stateMachine.getStateStack()).toEqual(['StateA', 'StateC']);
    });

    it('should clear stack', () => {
      stateMachine.initialize('StateA');
      stateMachine.pushState('StateB');
      stateMachine.pushState('StateC');
      
      // 重置状态跟踪
      stateA.reset();
      stateB.reset();
      stateC.reset();

      stateMachine.clearStack();
      
      expect(stateC.exitCalled).toBe(true);
      expect(stateB.exitCalled).toBe(true);
      expect(stateA.exitCalled).toBe(true);
      expect(stateMachine.getStackDepth()).toBe(0);
      expect(stateMachine.isStackEmpty()).toBe(true);
    });

    it('should handle transitions in pushdown stack', () => {
      stateMachine.initialize('StateA');
      stateMachine.pushState('StateB');
      
      // 添加从StateB到StateC的转换
      stateMachine.addTransition({
        from: 'StateB',
        to: 'StateC',
        condition: new AlwaysTrueCondition()
      });

      stateMachine.update(0.016);
      
      expect(stateMachine.currentState).toBe('StateC');
      expect(stateB.exitCalled).toBe(true);
      expect(stateC.enterCalled).toBe(true);
    });
  });
});