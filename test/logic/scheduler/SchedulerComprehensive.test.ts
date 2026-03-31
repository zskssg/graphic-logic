import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from 'vitest';
import {
  PriorityScheduler,
  GroupScheduler,
  ConditionalScheduler,
  DynamicScheduler,
  QueueScheduler,
  TimeTravelScheduler
} from '../../../src/logic/scheduler';

describe('Scheduler Comprehensive Tests', () => {
  let mockTime: number;
  let mockRequestAnimationFrame: Mock;
  let mockCancelAnimationFrame: Mock;
  let tickCallback: ((time: number) => void) | null;

  beforeEach(() => {
    mockTime = 0;
    tickCallback = null;
    
    mockRequestAnimationFrame = vi.fn((callback) => {
      tickCallback = callback;
      return 1;
    });
    
    mockCancelAnimationFrame = vi.fn();
    
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('PriorityScheduler - Edge Cases', () => {
    it('should handle zero priority', () => {
      const scheduler = new PriorityScheduler({
        timeProvider: () => mockTime,
        requestAnimationFrame: mockRequestAnimationFrame,
        cancelAnimationFrame: mockCancelAnimationFrame
      });

      const action1 = vi.fn();
      const action2 = vi.fn();

      scheduler.addTask(1000, action1, 'task1', true, 0);
      scheduler.addTask(1000, action2, 'task2', true, 0);

      scheduler.start();
      mockTime = 1000;
      tickCallback?.(mockTime);

      expect(action1).toHaveBeenCalledTimes(1);
      expect(action2).toHaveBeenCalledTimes(1);
    });

    it('should handle negative priority', () => {
      const scheduler = new PriorityScheduler({
        timeProvider: () => mockTime,
        requestAnimationFrame: mockRequestAnimationFrame,
        cancelAnimationFrame: mockCancelAnimationFrame
      });

      const action1 = vi.fn();
      const action2 = vi.fn();

      scheduler.addTask(1000, action1, 'task1', true, -1);
      scheduler.addTask(1000, action2, 'task2', true, -5);

      scheduler.start();
      mockTime = 1000;
      tickCallback?.(mockTime);

      expect(action1).toHaveBeenCalledTimes(1);
      expect(action2).toHaveBeenCalledTimes(1);
    });
  });

  describe('GroupScheduler - Advanced Features', () => {
    it('should handle empty groups', () => {
      const scheduler = new GroupScheduler({
        timeProvider: () => mockTime,
        requestAnimationFrame: mockRequestAnimationFrame,
        cancelAnimationFrame: mockCancelAnimationFrame
      });

      expect(scheduler.getGroups()).toEqual([]);
      expect(scheduler.getGroupTasks('nonexistent')).toEqual([]);
      expect(scheduler.removeGroup('nonexistent')).toBe(0);
    });

    it('should preserve task order when removing groups', () => {
      const scheduler = new GroupScheduler({
        timeProvider: () => mockTime,
        requestAnimationFrame: mockRequestAnimationFrame,
        cancelAnimationFrame: mockCancelAnimationFrame
      });

      const action1 = vi.fn();
      const action2 = vi.fn();
      const action3 = vi.fn();

      scheduler.addTask(1000, action1, 'task1', true, 'group1');
      scheduler.addTask(2000, action2, 'task2', true, 'group2');
      scheduler.addTask(3000, action3, 'task3', true, 'group1');

      scheduler.removeGroup('group1');

      expect(scheduler.getTasks()).toHaveLength(1);
      expect(scheduler.getTasks()[0]!.id).toBe('task2');
    });
  });

  describe('ConditionalScheduler - Complex Conditions', () => {
    it('should handle complex conditions', () => {
      let counter = 0;
      const scheduler = new ConditionalScheduler({
        timeProvider: () => mockTime,
        requestAnimationFrame: mockRequestAnimationFrame,
        cancelAnimationFrame: mockCancelAnimationFrame
      });

      const action = vi.fn(() => counter++);

      scheduler.addTask(1000, action, 'conditional-task', false, () => counter< 3);

      scheduler.start();
      mockTime = 1000;
      
      // 第一次触发
      tickCallback?.(mockTime);
      expect(action).toHaveBeenCalledTimes(1);
      expect(counter).toBe(1);
      
      // 第二次触发
      tickCallback?.(mockTime);
      expect(action).toHaveBeenCalledTimes(2);
      expect(counter).toBe(2);
      
      // 第三次触发
      tickCallback?.(mockTime);
      expect(action).toHaveBeenCalledTimes(3);
      expect(counter).toBe(3);
      
      // 第四次触发，条件不满足
      tickCallback?.(mockTime);
      expect(action).toHaveBeenCalledTimes(3);
      expect(counter).toBe(3);
    });
  });

  describe('DynamicScheduler - Advanced Updates', () => {
    it('should handle multiple updates to the same task', () =>{
      const scheduler = new DynamicScheduler({
        timeProvider: () => mockTime,
        requestAnimationFrame: mockRequestAnimationFrame,
        cancelAnimationFrame: mockCancelAnimationFrame
      });

      const action1 = vi.fn();
      const action2 = vi.fn();
      const action3 = vi.fn();

      const taskId = scheduler.addTask(1000, action1);

      scheduler.start();

      // 第一次更新
      scheduler.updateTask(taskId, { time: 2000, action: action2 });
      
      // 第二次更新
      scheduler.updateTask(taskId, { time: 3000, action: action3 });

      // 时间到1000ms
      mockTime = 1000;
      tickCallback?.(mockTime);
      expect(action1).not.toHaveBeenCalled();
      expect(action2).not.toHaveBeenCalled();
      expect(action3).not.toHaveBeenCalled();

      // 时间到2000ms
      mockTime = 2000;
      tickCallback?.(mockTime);
      expect(action1).not.toHaveBeenCalled();
      expect(action2).not.toHaveBeenCalled();
      expect(action3).not.toHaveBeenCalled();

      // 时间到3000ms
      mockTime = 3000;
      tickCallback?.(mockTime);
      expect(action3).toHaveBeenCalledTimes(1);
    });

    it('should handle enabling disabled tasks', () => {
      const scheduler = new DynamicScheduler({
        timeProvider: () => mockTime,
        requestAnimationFrame: mockRequestAnimationFrame,
        cancelAnimationFrame: mockCancelAnimationFrame
      });

      const action = vi.fn();

      const taskId = scheduler.addTask(1000, action);

      scheduler.start();

      // 禁用任务
      scheduler.disableTask(taskId);

      // 时间到1000ms，任务不执行
      mockTime = 1000;
      tickCallback?.(mockTime);
      expect(action).not.toHaveBeenCalled();

      // 启用任务
      scheduler.enableTask(taskId);

      // 再次触发，任务执行
      tickCallback?.(mockTime);
      expect(action).toHaveBeenCalledTimes(1);
    });
  });

  describe('QueueScheduler - Advanced Queue Management', () => {
    it('should handle empty queues', () => {
      const scheduler = new QueueScheduler({
        timeProvider: () => mockTime,
        requestAnimationFrame: mockRequestAnimationFrame,
        cancelAnimationFrame: mockCancelAnimationFrame
      });

      expect(scheduler.getQueues()).toEqual([]);
      expect(scheduler.getQueueTasks('nonexistent')).toEqual([]);

      // 处理不存在的队列
      scheduler.processQueue('nonexistent');
    });

    it('should handle queue task removal', () => {
      const scheduler = new QueueScheduler({
        timeProvider: () => mockTime,
        requestAnimationFrame: mockRequestAnimationFrame,
        cancelAnimationFrame: mockCancelAnimationFrame
      });

      const action1 = vi.fn();
      const action2 = vi.fn();

      scheduler.addQueueTask('queue1', action1, 'task1', 1);
      scheduler.addQueueTask('queue1', action2, 'task2', 2);

      // 移除队列
      scheduler.removeQueue('queue1');

      expect(scheduler.getQueues()).toEqual([]);
      expect(scheduler.getTasks()).toHaveLength(0);
    });

    it('should process all queues', () => {
      const scheduler = new QueueScheduler({
        timeProvider: () => mockTime,
        requestAnimationFrame: mockRequestAnimationFrame,
        cancelAnimationFrame: mockCancelAnimationFrame
      });

      const action1 = vi.fn();
      const action2 = vi.fn();
      const action3 = vi.fn();

      scheduler.addQueueTask('queue1', action1, 'task1', 1);
      scheduler.addQueueTask('queue1', action2, 'task2', 2);
      scheduler.addQueueTask('queue2', action3, 'task3', 1);

      scheduler.processAllQueues();

      expect(action1).toHaveBeenCalledTimes(1);
      expect(action3).toHaveBeenCalledTimes(1);
      expect(action2).not.toHaveBeenCalled();

      scheduler.processAllQueues();

      expect(action2).toHaveBeenCalledTimes(1);
    });
  });

  describe('TimeTravelScheduler - State Management', () => {
    it('should handle state limits', () => {
      const scheduler = new TimeTravelScheduler({
        timeProvider: () => mockTime,
        requestAnimationFrame: mockRequestAnimationFrame,
        cancelAnimationFrame: mockCancelAnimationFrame
      }, 3); // 最大保存3个状态

      scheduler.start();

      // 保存多个状态
      for (let i = 0; i< 5; i++) {
        mockTime += 1000;
        tickCallback?.(mockTime);
        scheduler.saveState();
      }

      expect(scheduler.getStates()).toHaveLength(3);
    });

    it('should handle clear states', () => {
      const scheduler = new TimeTravelScheduler({
        timeProvider: () => mockTime,
        requestAnimationFrame: mockRequestAnimationFrame,
        cancelAnimationFrame: mockCancelAnimationFrame
      });

      scheduler.start();
      mockTime = 1000;
      tickCallback?.(mockTime);
      scheduler.saveState();

      expect(scheduler.getStates()).toHaveLength(2); // start()会自动保存一个状态
      expect(scheduler.getCurrentStateIndex()).toBe(1);

      scheduler.clearStates();

      expect(scheduler.getStates()).toHaveLength(0);
      expect(scheduler.getCurrentStateIndex()).toBe(-1);
    });

    it('should handle undo/redo with empty states', () => {
      const scheduler = new TimeTravelScheduler({
        timeProvider: () => mockTime,
        requestAnimationFrame: mockRequestAnimationFrame,
        cancelAnimationFrame: mockCancelAnimationFrame
      });

      scheduler.start();
      scheduler.clearStates(); // 清空所有状态

      // 没有保存状态时的操作
      expect(scheduler.undo()).toBe(false);
      expect(scheduler.redo()).toBe(false);
      expect(scheduler.gotoState(0)).toBe(false);
    });
  });

  describe('Scheduler Integration', () => {
    it('should work with mixed task types', () => {
      const scheduler = new QueueScheduler({
        timeProvider: () => mockTime,
        requestAnimationFrame: mockRequestAnimationFrame,
        cancelAnimationFrame: mockCancelAnimationFrame
      });

      const timeAction = vi.fn();
      const queueAction = vi.fn();

      // 添加时间任务
      scheduler.addTask(1000, timeAction);

      // 添加队列任务
      scheduler.addQueueTask('queue1', queueAction, 'queue-task', 1);

      scheduler.start();

      // 时间到1000ms，时间任务执行
      mockTime = 1000;
      tickCallback?.(mockTime);
      expect(timeAction).toHaveBeenCalledTimes(1);
      expect(queueAction).not.toHaveBeenCalled();

      // 处理队列，队列任务执行
      scheduler.processQueue('queue1');
      expect(queueAction).toHaveBeenCalledTimes(1);
    });
  });
});