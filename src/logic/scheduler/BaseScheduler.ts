import {
  TimeSchedulerInterface,
  TaskInterface,
  SchedulerOptionsInterface
} from './interfaces';

/**
 * 基础调度器类
 * 提供时间调度器的核心功能
 */
export class BaseScheduler implements TimeSchedulerInterface {
  protected tasks: TaskInterface[] = [];
  protected isRunning: boolean = false;
  protected isPaused: boolean = false;
  protected startTime: number = 0;
  protected pausedTime: number = 0;
  protected pausedElapsed: number = 0;
  protected animationId: any = null;
  protected completedTasks: Set<string>= new Set();
  protected timeProvider: () => number;
  protected requestAnimationFrameFn: (callback: (time: number) => void) => any;
  protected cancelAnimationFrameFn: (id: any) => void;

  /**
   * 构造函数
   * @param options 配置选项
   */
  constructor(options?: SchedulerOptionsInterface) {
    // 使用Date.now()作为默认时间源，确保平台无关
    this.timeProvider = options?.timeProvider || (() => Date.now());
    
    // 使用setTimeout作为默认动画帧函数，确保平台无关
    this.requestAnimationFrameFn = options?.requestAnimationFrame || ((callback) => {
      return setTimeout(() => callback(Date.now()), 16); // 约60fps
    });
    
    this.cancelAnimationFrameFn = options?.cancelAnimationFrame || ((id) => {
      clearTimeout(id);
    });
  }

  /**
   * 添加定时任务
   * @param time 执行时间（毫秒）
   * @param action 执行的操作
   * @param id 任务ID（可选）
   * @param once 是否只执行一次（默认true）
   * @returns 任务ID
   */
  public addTask(time: number, action: () => void, id?: string, once: boolean = true): string {
    const taskId = id || `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const task: TaskInterface = {
      id: taskId,
      time: time,
      action: action,
      once: once
    };

    this.tasks.push(task);
    this.sortTasks();
    
    return taskId;
  }

  /**
   * 移除任务
   * @param id 任务ID
   * @returns 是否移除成功
   */
  public removeTask(id: string): boolean {
    const initialLength = this.tasks.length;
    this.tasks = this.tasks.filter(task => task.id !== id);
    this.completedTasks.delete(id);
    return this.tasks.length< initialLength;
  }

  /**
   * 启动调度器
   */
  public start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.isPaused = false;
    this.startTime = this.timeProvider();
    this.pausedTime = 0;
    this.pausedElapsed = 0;
    this.completedTasks.clear();
    this.animationId = this.requestAnimationFrameFn((time) => this.tick(time));
  }

  /**
   * 暂停调度器
   */
  public pause(): void {
    if (!this.isRunning || this.isPaused) return;
    
    this.isPaused = true;
    this.pausedTime = this.timeProvider();
    if (this.animationId !== null) {
      this.cancelAnimationFrameFn(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * 恢复调度器
   */
  public resume(): void {
    if (!this.isRunning || !this.isPaused) return;
    
    this.isPaused = false;
    this.pausedElapsed += this.timeProvider() - this.pausedTime;
    this.pausedTime = 0;
    this.animationId = this.requestAnimationFrameFn((time) => this.tick(time));
  }

  /**
   * 停止调度器
   */
  public stop(): void {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    this.isPaused = false;
    this.pausedTime = 0;
    this.pausedElapsed = 0;
    if (this.animationId !== null) {
      this.cancelAnimationFrameFn(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * 重置调度器
   */
  public reset(): void {
    this.stop();
    this.tasks = [];
    this.completedTasks.clear();
    this.startTime = 0;
  }

  /**
   * 检查是否正在运行
   * @returns 是否正在运行
   */
  public getIsRunning(): boolean {
    return this.isRunning;
  }

  /**
   * 检查是否已暂停
   * @returns 是否已暂停
   */
  public getIsPaused(): boolean {
    return this.isPaused;
  }

  /**
   * 获取当前运行时间
   * @returns 当前运行时间（毫秒）
   */
  public getCurrentTime(): number {
    if (!this.isRunning) return 0;
    
    let elapsedTime = this.timeProvider() - this.startTime;
    
    if (this.isPaused) {
      elapsedTime -= this.timeProvider() - this.pausedTime;
    }
    
    return elapsedTime - this.pausedElapsed;
  }

  /**
   * 获取所有任务
   * @returns 任务数组
   */
  public getTasks(): TaskInterface[] {
    return [...this.tasks];
  }

  /**
   * 按时间排序任务
   */
  protected sortTasks(): void {
    this.tasks.sort((a, b) => a.time - b.time);
  }

  /**
   * 动画循环
   * @param _currentTime 当前时间（未使用）
   */
  protected tick(_currentTime: number): void {
    if (!this.isRunning || this.isPaused) return;

    const elapsedTime = this.timeProvider() - this.startTime - this.pausedElapsed;

    // 执行到时间的任务
    for (const task of this.tasks) {
      if (elapsedTime >= task.time && !this.completedTasks.has(task.id)) {
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
}