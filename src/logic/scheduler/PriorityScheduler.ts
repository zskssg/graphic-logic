import { BaseScheduler } from './BaseScheduler';
import { TaskInterface } from './interfaces';

/**
 * 带优先级的任务接口
 */
export interface PriorityTaskInterface extends TaskInterface {
  priority: number; // 优先级，数字越大优先级越高
}

/**
 * 带优先级的调度器类
 * 支持任务优先级排序和执行
 */
export class PriorityScheduler extends BaseScheduler {
  protected override tasks: PriorityTaskInterface[] = [];

  /**
   * 添加带优先级的定时任务
   * @param time 执行时间（毫秒）
   * @param action 执行的操作
   * @param id 任务ID（可选）
   * @param once 是否只执行一次（默认true）
   * @param priority 优先级（默认0，数字越大优先级越高）
   * @returns 任务ID
   */
  public override addTask(
    time: number, 
    action: () => void, 
    id?: string, 
    once: boolean = true,
    priority: number = 0
  ): string {
    const taskId = id || `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const task: PriorityTaskInterface = {
      id: taskId,
      time: time,
      action: action,
      once: once,
      priority: priority
    };

    this.tasks.push(task);
    this.sortTasks();
    
    return taskId;
  }

  /**
   * 按时间和优先级排序任务
   * 先按时间排序，时间相同时按优先级排序
   */
  protected override sortTasks(): void {
    this.tasks.sort((a, b) => {
      if (a.time !== b.time) {
        return a.time - b.time;
      }
      return b.priority - a.priority; // 优先级高的先执行
    });
  }

  /**
   * 获取所有任务
   * @returns 任务数组
   */
  public override getTasks(): PriorityTaskInterface[] {
    return [...this.tasks];
  }
}