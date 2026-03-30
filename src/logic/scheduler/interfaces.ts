/**
 * 时间调度器接口
 */
export interface TimeSchedulerInterface {
  /**
   * 添加定时任务
   * @param time 执行时间（毫秒）
   * @param action 执行的操作
   * @param id 任务ID（可选）
   * @param once 是否只执行一次（默认true）
   * @returns 任务ID
   */
  addTask(time: number, action: () => void, id?: string, once?: boolean): string;

  /**
   * 移除任务
   * @param id 任务ID
   * @returns 是否移除成功
   */
  removeTask(id: string): boolean;

  /**
   * 启动调度器
   */
  start(): void;

  /**
   * 暂停调度器
   */
  pause(): void;

  /**
   * 恢复调度器
   */
  resume(): void;

  /**
   * 停止调度器
   */
  stop(): void;

  /**
   * 重置调度器
   */
  reset(): void;

  /**
   * 检查是否正在运行
   * @returns 是否正在运行
   */
  getIsRunning(): boolean;

  /**
   * 检查是否已暂停
   * @returns 是否已暂停
   */
  getIsPaused(): boolean;

  /**
   * 获取当前运行时间
   * @returns 当前运行时间（毫秒）
   */
  getCurrentTime(): number;

  /**
   * 获取所有任务
   * @returns 任务数组
   */
  getTasks(): Array<{
    id: string;
    time: number;
    action: () => void;
    once: boolean;
  }>;
}

/**
 * 任务接口
 */
export interface TaskInterface {
  id: string;
  time: number;
  action: () => void;
  once: boolean;
}

/**
 * 时间提供者接口
 */
export interface TimeProviderInterface {
  (): number;
}

/**
 * 动画帧函数接口
 */
export interface AnimationFrameFunctionInterface {
  (callback: (time: number) => void): any;
}

/**
 * 取消动画帧函数接口
 */
export interface CancelAnimationFrameFunctionInterface {
  (id: any): void;
}

/**
 * 调度器选项接口
 */
export interface SchedulerOptionsInterface {
  timeProvider?: TimeProviderInterface;
  requestAnimationFrame?: AnimationFrameFunctionInterface;
  cancelAnimationFrame?: CancelAnimationFrameFunctionInterface;
}