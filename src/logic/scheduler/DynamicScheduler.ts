import { BaseScheduler } from './BaseScheduler';
import { TaskInterface } from './interfaces';

/**
 * 动态任务接口
 */
export interface DynamicTaskInterface extends TaskInterface {
  enabled: boolean; // 是否启用任务
}

/**
 * 动态调度器类
 * 支持运行时动态修改任务属性
 */
export class DynamicScheduler extends BaseScheduler {
  protected override tasks: DynamicTaskInterface[] = [];

  /**
   * 添加动态定时任务
   * @param time 执行时间（毫秒）
   * @param action 执行的操作
   * @param id 任务ID（可选）
   * @param once 是否只执行一次（默认true）
   * @returns 任务ID
   */
  public override addTask(
    time: number, 
    action: () => void, 
    id?: string, 
    once: boolean = true
  ): string {
    const taskId = id || `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const task: DynamicTaskInterface = {
      id: taskId,
      time: time,
      action: action,
      once: once,
      enabled: true
    };

    this.tasks.push(task);
    this.sortTasks();
    
    return taskId;
  }

  /**
   * 更新任务属性
   * @param id 任务ID
   * @param updates 要更新的属性
   * @returns 是否更新成功
   */
  public updateTask(
    id: string, 
    updates: Partial<Pick<DynamicTaskInterface, 'time' | 'action' | 'once' | 'enabled'>>
  ): boolean {
    const task = this.tasks.find(task => task.id === id);
    if (!task) return false;

    // 更新属性
    if (updates.time !== undefined) {
      task.time = updates.time;
    }
    if (updates.action !== undefined) {
      task.action = updates.action;
    }
    if (updates.once !== undefined) {
      task.once = updates.once;
    }
    if (updates.enabled !== undefined) {
      task.enabled = updates.enabled;
    }

    // 如果时间改变，重新排序
    if (updates.time !== undefined) {
      this.sortTasks();
    }

    return true;
  }

  /**
   * 启用任务
   * @param id 任务ID
   * @returns 是否启用成功
   */
  public enableTask(id: string): boolean {
    return this.updateTask(id, { enabled: true });
  }

  /**
   * 禁用任务
   * @param id 任务ID
   * @returns 是否禁用成功
   */
  public disableTask(id: string): boolean {
    return this.updateTask(id, { enabled: false });
  }

  /**
   * 动画循环
   * @param _currentTime 当前时间（未使用）
   */
  protected override tick(_currentTime: number): void {
    if (!this.isRunning || this.isPaused) return;

    const elapsedTime = this.timeProvider() - this.startTime - this.pausedElapsed;

    // 执行到时间且启用的任务
    for (const task of this.tasks) {
      if (task.enabled && elapsedTime >= task.time && !this.completedTasks.has(task.id)) {
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
  public override getTasks(): DynamicTaskInterface[] {
    return [...this.tasks];
  }
}