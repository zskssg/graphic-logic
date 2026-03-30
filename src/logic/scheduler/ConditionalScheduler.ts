import { BaseScheduler } from './BaseScheduler';
import { TaskInterface } from './interfaces';

/**
 * 条件函数类型
 */
export type ConditionFunction = () => boolean;

/**
 * 带条件的任务接口
 */
export interface ConditionalTaskInterface extends TaskInterface {
  condition: ConditionFunction | null; // 执行条件，返回true时执行任务
}

/**
 * 带条件的调度器类
 * 支持基于条件的任务执行
 */
export class ConditionalScheduler extends BaseScheduler {
  protected override tasks: ConditionalTaskInterface[] = [];

  /**
   * 添加带条件的定时任务
   * @param time 执行时间（毫秒）
   * @param action 执行的操作
   * @param id 任务ID（可选）
   * @param once 是否只执行一次（默认true）
   * @param condition 执行条件（可选，返回true时执行任务）
   * @returns 任务ID
   */
  public override addTask(
    time: number, 
    action: () => void, 
    id?: string, 
    once: boolean = true,
    condition?: ConditionFunction
  ): string {
    const taskId = id || `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const task: ConditionalTaskInterface = {
      id: taskId,
      time: time,
      action: action,
      once: once,
      condition: condition || null
    };

    this.tasks.push(task);
    this.sortTasks();
    
    return taskId;
  }

  /**
   * 动画循环
   * @param _currentTime 当前时间（未使用）
   */
  protected override tick(_currentTime: number): void {
    if (!this.isRunning || this.isPaused) return;

    const elapsedTime = this.timeProvider() - this.startTime - this.pausedElapsed;

    // 执行到时间且满足条件的任务
    for (const task of this.tasks) {
      if (elapsedTime >= task.time && !this.completedTasks.has(task.id)) {
        // 检查条件是否满足
        const shouldExecute = !task.condition || task.condition();
        
        if (shouldExecute) {
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
    }

    // 继续循环
    this.animationId = this.requestAnimationFrameFn((time) => this.tick(time));
  }

  /**
   * 获取所有任务
   * @returns 任务数组
   */
  public override getTasks(): ConditionalTaskInterface[] {
    return [...this.tasks];
  }
}