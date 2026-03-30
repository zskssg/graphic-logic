import { BaseScheduler } from './BaseScheduler';
import { TaskInterface } from './interfaces';

/**
 * 队列任务接口
 */
export interface QueueTaskInterface extends TaskInterface {
  queue: string; // 队列名称
  position: number; // 在队列中的位置
}

/**
 * 任务队列类
 */
export class TaskQueue {
  private tasks: QueueTaskInterface[] = [];
  private isProcessing: boolean = false;

  constructor(public name: string) {}

  /**
   * 添加任务到队列
   * @param task 任务对象
   */
  public addTask(task: QueueTaskInterface): void {
    this.tasks.push(task);
    this.tasks.sort((a, b) => a.position - b.position);
  }

  /**
   * 移除任务
   * @param id 任务ID
   */
  public removeTask(id: string): void {
    this.tasks = this.tasks.filter(task => task.id !== id);
  }

  /**
   * 获取队列中的所有任务
   * @returns 任务数组
   */
  public getTasks(): QueueTaskInterface[] {
    return [...this.tasks];
  }

  /**
   * 处理队列中的任务
   * @param completedTasks 已完成任务集合
   */
  public processTasks(completedTasks: Set<string>): void {
    if (this.isProcessing) return;

    this.isProcessing = true;

    // 查找第一个未完成的任务
    const nextTask = this.tasks.find(task => !completedTasks.has(task.id));
    
    if (nextTask) {
      try {
        nextTask.action();
        completedTasks.add(nextTask.id);
      } catch (error) {
        console.error(`Error executing task ${nextTask.id}:`, error);
      }
    }

    this.isProcessing = false;
  }
}

/**
 * 队列调度器类
 * 支持任务队列管理和顺序执行
 */
export class QueueScheduler extends BaseScheduler {
  protected override tasks: QueueTaskInterface[] = [];
  private queues: Map<string, TaskQueue>= new Map();

  /**
   * 添加队列任务
   * @param queue 队列名称
   * @param action 执行的操作
   * @param id 任务ID（可选）
   * @param position 在队列中的位置（默认按添加顺序）
   * @returns 任务ID
   */
  public addQueueTask(
    queue: string, 
    action: () => void, 
    id?: string,
    position: number = Date.now()
  ): string {
    const taskId = id || `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const task: QueueTaskInterface = {
      id: taskId,
      time: 0, // 队列任务忽略时间，按顺序执行
      action: action,
      once: true, // 队列任务只执行一次
      queue: queue,
      position: position
    };

    this.tasks.push(task);
    
    // 获取或创建队列
    if (!this.queues.has(queue)) {
      this.queues.set(queue, new TaskQueue(queue));
    }
    
    this.queues.get(queue)!.addTask(task);
    
    return taskId;
  }

  /**
   * 处理指定队列
   * @param queue 队列名称
   */
  public processQueue(queue: string): void {
    const taskQueue = this.queues.get(queue);
    if (taskQueue) {
      taskQueue.processTasks(this.completedTasks);
    }
  }

  /**
   * 处理所有队列
   */
  public processAllQueues(): void {
    this.queues.forEach(queue => {
      queue.processTasks(this.completedTasks);
    });
  }

  /**
   * 获取所有队列名称
   * @returns 队列名称数组
   */
  public getQueues(): string[] {
    return Array.from(this.queues.keys());
  }

  /**
   * 获取指定队列的任务
   * @param queue 队列名称
   * @returns 任务数组
   */
  public getQueueTasks(queue: string): QueueTaskInterface[] {
    return this.tasks.filter(task => task.queue === queue);
  }

  /**
   * 移除队列
   * @param queue 队列名称
   */
  public removeQueue(queue: string): void {
    this.tasks = this.tasks.filter(task => task.queue !== queue);
    this.queues.delete(queue);
  }

  /**
   * 动画循环
   * @param _currentTime 当前时间（未使用）
   */
  protected override tick(_currentTime: number): void {
    if (!this.isRunning || this.isPaused) return;

    // 处理基于时间的任务
    const elapsedTime = this.timeProvider() - this.startTime - this.pausedElapsed;

    for (const task of this.tasks) {
      if (task.time > 0 && elapsedTime >= task.time && !this.completedTasks.has(task.id)) {
        try {
          task.action();
          if (task.once) {
            this.completedTasks.add(task.id);
          }
        } catch (error) {
          console.error(`Error executing task ${task.id}:`, error);
        }
      }
    }

    // 继续循环
    this.animationId = this.requestAnimationFrameFn((time) => this.tick(time));
  }

  /**
   * 获取所有任务
   * @returns 任务数组
   */
  public override getTasks(): QueueTaskInterface[] {
    return [...this.tasks];
  }
}