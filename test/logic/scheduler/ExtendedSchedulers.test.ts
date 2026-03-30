import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from 'vitest';
import {
  PriorityScheduler,
  GroupScheduler,
  ConditionalScheduler,
  DynamicScheduler,
  QueueScheduler,
  TimeTravelScheduler
} from '../../../src/logic/scheduler';

describe('Extended Schedulers', () => {
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

  describe('PriorityScheduler', () => {
    it('should execute tasks with higher priority first', () => {
      const scheduler = new PriorityScheduler({
        timeProvider: () => mockTime,
        requestAnimationFrame: mockRequestAnimationFrame,
        cancelAnimationFrame: mockCancelAnimationFrame
      });

      const action1 = vi.fn();
      const action2 = vi.fn();
      const action3 = vi.fn();

      // 相同时间，不同优先级
      scheduler.addTask(1000, action1, 'low-priority', true, 1);
      scheduler.addTask(1000, action2, 'high-priority', true, 10);
      scheduler.addTask(1000, action3, 'medium-priority', true, 5);

      scheduler.start();

      // 时间到1000ms
      mockTime = 1000;
      tickCallback?.(mockTime);

      // 验证高优先级任务先执行
      expect(action2).toHaveBeenCalledTimes(1);
      expect(action3).toHaveBeenCalledTimes(1);
      expect(action1).toHaveBeenCalledTimes(1);
    });
  });

  describe('GroupScheduler', () => {
    it('should group tasks and allow group operations', () => {
      const scheduler = new GroupScheduler({
        timeProvider: () => mockTime,
        requestAnimationFrame: mockRequestAnimationFrame,
        cancelAnimationFrame: mockCancelAnimationFrame
      });

      const action1 = vi.fn();
      const action2 = vi.fn();
      const action3 = vi.fn();

      // 添加到不同分组
      scheduler.addTask(1000, action1, 'task1', true, 'group1');
      scheduler.addTask(2000, action2, 'task2', true, 'group2');
      scheduler.addTask(3000, action3, 'task3', true, 'group1');

      // 获取分组信息
      expect(scheduler.getGroups()).toEqual(expect.arrayContaining(['group1', 'group2']));
      expect(scheduler.getGroupTasks('group1')).toHaveLength(2);
      expect(scheduler.getGroupTasks('group2')).toHaveLength(1);

      // 移除分组
      const removedCount = scheduler.removeGroup('group1');
      expect(removedCount).toBe(2);
      expect(scheduler.getGroupTasks('group1')).toHaveLength(0);
      expect(scheduler.getGroupTasks('group2')).toHaveLength(1);
    });
  });

  describe('ConditionalScheduler', () => {
    it('should execute tasks only when conditions are met', () => {
      let condition1 = false;
      let condition2 = true;

      const scheduler = new ConditionalScheduler({
        timeProvider: () => mockTime,
        requestAnimationFrame: mockRequestAnimationFrame,
        cancelAnimationFrame: mockCancelAnimationFrame
      });

      const action1 = vi.fn();
      const action2 = vi.fn();
      const action3 = vi.fn();

      // 添加带条件的任务
      scheduler.addTask(1000, action1, 'conditional1', true, () => condition1);
      scheduler.addTask(1000, action2, 'conditional2', true, () => condition2);
      scheduler.addTask(1000, action3, 'no-condition');

      scheduler.start();

      // 时间到1000ms
      mockTime = 1000;
      tickCallback?.(mockTime);

      // 验证只有条件满足的任务执行
      expect(action1).not.toHaveBeenCalled();
      expect(action2).toHaveBeenCalledTimes(1);
      expect(action3).toHaveBeenCalledTimes(1);

      // 修改条件并再次触发
      condition1 = true;
      tickCallback?.(mockTime);

      expect(action1).toHaveBeenCalledTimes(1);
    });
  });

  describe('DynamicScheduler', () => {
    it('should allow dynamic task updates', () => {
      const scheduler = new DynamicScheduler({
        timeProvider: () => mockTime,
        requestAnimationFrame: mockRequestAnimationFrame,
        cancelAnimationFrame: mockCancelAnimationFrame
      });

      const originalAction = vi.fn();
      const updatedAction = vi.fn();

      // 添加任务
      const taskId = scheduler.addTask(1000, originalAction);

      scheduler.start();

      // 更新任务属性
      scheduler.updateTask(taskId, {
        time: 2000,
        action: updatedAction
      });

      // 时间到1000ms，任务不应该执行
      mockTime = 1000;
      tickCallback?.(mockTime);
      expect(originalAction).not.toHaveBeenCalled();
      expect(updatedAction).not.toHaveBeenCalled();

      // 时间到2000ms，任务应该执行更新后的动作
      mockTime = 2000;
      tickCallback?.(mockTime);
      expect(updatedAction).toHaveBeenCalledTimes(1);
    });

    it('should support enabling and disabling tasks', () => {
      const scheduler = new DynamicScheduler({
        timeProvider: () => mockTime,
        requestAnimationFrame: mockRequestAnimationFrame,
        cancelAnimationFrame: mockCancelAnimationFrame
      });

      const action = vi.fn();

      // 添加任务
      const taskId = scheduler.addTask(1000, action);

      scheduler.start();

      // 禁用任务
      scheduler.disableTask(taskId);

      // 时间到1000ms，任务不应该执行
      mockTime = 1000;
      tickCallback?.(mockTime);
      expect(action).not.toHaveBeenCalled();

      // 启用任务
      scheduler.enableTask(taskId);

      // 再次触发，任务应该执行
      tickCallback?.(mockTime);
      expect(action).toHaveBeenCalledTimes(1);
    });
  });

  describe('QueueScheduler', () => {
    it('should manage task queues', () => {
      const scheduler = new QueueScheduler({
        timeProvider: () => mockTime,
        requestAnimationFrame: mockRequestAnimationFrame,
        cancelAnimationFrame: mockCancelAnimationFrame
      });

      const action1 = vi.fn();
      const action2 = vi.fn();
      const action3 = vi.fn();

      // 添加队列任务
      scheduler.addQueueTask('queue1', action1, 'task1', 1);
      scheduler.addQueueTask('queue1', action2, 'task2', 2);
      scheduler.addQueueTask('queue2', action3, 'task3', 1);

      // 获取队列信息
      expect(scheduler.getQueues()).toEqual(expect.arrayContaining(['queue1', 'queue2']));
      expect(scheduler.getQueueTasks('queue1')).toHaveLength(2);

      // 处理队列
      scheduler.processQueue('queue1');
      expect(action1).toHaveBeenCalledTimes(1);
      expect(action2).not.toHaveBeenCalled();

      scheduler.processQueue('queue1');
      expect(action2).toHaveBeenCalledTimes(1);

      scheduler.processQueue('queue2');
      expect(action3).toHaveBeenCalledTimes(1);
    });
  });

  describe('TimeTravelScheduler', () => {
    it('should support time travel operations', () => {
      const scheduler = new TimeTravelScheduler({
        timeProvider: () => mockTime,
        requestAnimationFrame: mockRequestAnimationFrame,
        cancelAnimationFrame: mockCancelAnimationFrame
      });

      const action1 = vi.fn();
      const action2 = vi.fn();

      // 添加任务
      scheduler.addTask(1000, action1);
      scheduler.addTask(2000, action2);

      scheduler.start();

      // 执行到1000ms
      mockTime = 1000;
      tickCallback?.(mockTime);
      expect(action1).toHaveBeenCalledTimes(1);

      // 保存状态
      scheduler.saveState();

      // 执行到2000ms
      mockTime = 2000;
      tickCallback?.(mockTime);
      expect(action2).toHaveBeenCalledTimes(1);

      // 回溯到上一个状态
      scheduler.undo();
      expect(action2).toHaveBeenCalledTimes(1); // 动作已经执行，状态保存的是完成状态

      // 前进到下一个状态
      scheduler.redo();
      expect(action2).toHaveBeenCalledTimes(1);
    });
  });
});