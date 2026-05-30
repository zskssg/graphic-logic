import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from 'vitest';
import { TimeScheduler, SchedulerManager } from '../../src/logic/TimeScheduler';

describe('TimeScheduler', () => {
  let scheduler: TimeScheduler;
  let mockTime: number;
  let mockRequestAnimationFrame: Mock;
  let mockCancelAnimationFrame: Mock;
  let tickCallback: ((time: number) => void) | null;

  beforeEach(() => {
    mockTime = 0;
    tickCallback = null;

    // 创建模拟函数
    mockRequestAnimationFrame = vi.fn((callback) => {
      tickCallback = callback;
      return 1;
    });

    mockCancelAnimationFrame = vi.fn();

    // 创建调度器实例，使用自定义时间源和定时器
    scheduler = new TimeScheduler({
      timeProvider: () => mockTime,
      requestAnimationFrame: mockRequestAnimationFrame,
      cancelAnimationFrame: mockCancelAnimationFrame
    });

    vi.useFakeTimers();
  });

  afterEach(() => {
    scheduler.stop();
    vi.useRealTimers();
  });

  it('should create a scheduler instance', () => {
    expect(scheduler).toBeInstanceOf(TimeScheduler);
    expect(scheduler.getIsRunning()).toBe(false);
    expect(scheduler.getCurrentTime()).toBe(0);
    expect(scheduler.getTasks()).toEqual([]);
  });

  it('should add tasks correctly', () => {
    const task1 = scheduler.addTask(1000, () => { });
    const task2 = scheduler.addTask(5000, () => { }, 'task2');

    expect(task1).toBeDefined();
    expect(task2).toBe('task2');

    const tasks = scheduler.getTasks();
    expect(tasks).toHaveLength(2);
    expect(tasks[0]!.time).toBe(1000);
    expect(tasks[1]!.time).toBe(5000);
  });

  it('should remove tasks correctly', () => {
    const taskId = scheduler.addTask(1000, () => { });
    expect(scheduler.getTasks()).toHaveLength(1);

    const result = scheduler.removeTask(taskId);
    expect(result).toBe(true);
    expect(scheduler.getTasks()).toHaveLength(0);

    const result2 = scheduler.removeTask('non-existent');
    expect(result2).toBe(false);
  });

  it('should execute tasks at specified times', () => {
    const action1 = vi.fn();
    const action2 = vi.fn();

    scheduler.addTask(1000, action1);
    scheduler.addTask(5000, action2);

    scheduler.start();

    // 时间到999ms，任务1不应该执行
    mockTime = 999;
    tickCallback?.(mockTime);
    expect(action1).not.toHaveBeenCalled();
    expect(action2).not.toHaveBeenCalled();

    // 时间到1000ms，任务1应该执行
    mockTime = 1000;
    tickCallback?.(mockTime);
    expect(action1).toHaveBeenCalledTimes(1);
    expect(action2).not.toHaveBeenCalled();

    // 时间到5000ms，任务2应该执行
    mockTime = 5000;
    tickCallback?.(mockTime);
    expect(action2).toHaveBeenCalledTimes(1);
  });

  it('should handle non-once tasks', () => {
    const action = vi.fn();

    scheduler.addTask(1000, action, 'repeat-task', false);
    scheduler.start();

    // 第一次执行
    mockTime = 1000;
    tickCallback?.(mockTime);
    expect(action).toHaveBeenCalledTimes(1);

    // 由于是重复任务，应该可以再次执行
    mockTime = 2000;
    tickCallback?.(mockTime);
    expect(action).toHaveBeenCalledTimes(2);
  });

  it('should stop and reset correctly', () => {
    const action = vi.fn();

    scheduler.addTask(1000, action);
    scheduler.start();
    expect(scheduler.getIsRunning()).toBe(true);

    scheduler.stop();
    expect(scheduler.getIsRunning()).toBe(false);

    mockTime = 2000;
    tickCallback?.(mockTime);
    expect(action).not.toHaveBeenCalled();

    scheduler.reset();
    expect(scheduler.getTasks()).toHaveLength(0);
    expect(scheduler.getCurrentTime()).toBe(0);
  });

  it('should handle task errors gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
    const errorAction = () => {
      throw new Error('Test error');
    };

    scheduler.addTask(1000, errorAction);
    scheduler.start();

    mockTime = 1000;
    tickCallback?.(mockTime);

    expect(consoleSpy).toHaveBeenCalled();
    expect(consoleSpy.mock.calls[0]![0]).toContain('Error executing task');

    consoleSpy.mockRestore();
  });
});

describe('SchedulerManager', () => {
  afterEach(() => {
    SchedulerManager.clear();
  });

  it('should get or create scheduler instances', () => {
    const scheduler1 = SchedulerManager.getScheduler();
    const scheduler2 = SchedulerManager.getScheduler();
    const scheduler3 = SchedulerManager.getScheduler('custom');

    expect(scheduler1).toBeInstanceOf(TimeScheduler);
    expect(scheduler1).toBe(scheduler2);
    expect(scheduler1).not.toBe(scheduler3);
  });

  it('should remove scheduler instances', () => {
    const scheduler1 = SchedulerManager.getScheduler();
    const scheduler2 = SchedulerManager.getScheduler('custom');

    expect(SchedulerManager.removeScheduler('custom')).toBe(true);

    const newScheduler = SchedulerManager.getScheduler('custom');
    expect(newScheduler).not.toBe(scheduler2);
    expect(newScheduler).not.toBe(scheduler1);

    expect(SchedulerManager.removeScheduler('non-existent')).toBe(false);
  });

  it('should clear all scheduler instances', () => {
    const scheduler1 = SchedulerManager.getScheduler();
    const scheduler2 = SchedulerManager.getScheduler('custom');

    SchedulerManager.clear();

    const newScheduler1 = SchedulerManager.getScheduler();
    const newScheduler2 = SchedulerManager.getScheduler('custom');

    expect(newScheduler1).not.toBe(scheduler1);
    expect(newScheduler2).not.toBe(scheduler2);
  });
});
