import { BaseScheduler } from './BaseScheduler';
import { TaskInterface } from './interfaces';

/**
 * 带分组的任务接口
 */
export interface GroupTaskInterface extends TaskInterface {
  group: string; // 任务分组名称
}

/**
 * 带分组的调度器类
 * 支持任务分组管理和批量操作
 */
export class GroupScheduler extends BaseScheduler {
  protected override tasks: GroupTaskInterface[] = [];

  /**
   * 添加带分组的定时任务
   * @param time 执行时间（毫秒）
   * @param action 执行的操作
   * @param id 任务ID（可选）
   * @param once 是否只执行一次（默认true）
   * @param group 任务分组名称（默认'default'）
   * @returns 任务ID
   */
  public override addTask(
    time: number, 
    action: () => void, 
    id?: string, 
    once: boolean = true,
    group: string = 'default'
  ): string {
    const taskId = id || `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const task: GroupTaskInterface = {
      id: taskId,
      time: time,
      action: action,
      once: once,
      group: group
    };

    this.tasks.push(task);
    this.sortTasks();
    
    return taskId;
  }

  /**
   * 移除指定分组的所有任务
   * @param group 分组名称
   * @returns 移除的任务数量
   */
  public removeGroup(group: string): number {
    const initialLength = this.tasks.length;
    this.tasks = this.tasks.filter(task => task.group !== group);
    
    // 同时从已完成任务中移除
    this.tasks.forEach(task => {
      if (task.group === group) {
        this.completedTasks.delete(task.id);
      }
    });
    
    return initialLength - this.tasks.length;
  }

  /**
   * 获取指定分组的所有任务
   * @param group 分组名称
   * @returns 任务数组
   */
  public getGroupTasks(group: string): GroupTaskInterface[] {
    return this.tasks.filter(task => task.group === group);
  }

  /**
   * 获取所有分组名称
   * @returns 分组名称数组
   */
  public getGroups(): string[] {
    const groups = new Set<string>();
    this.tasks.forEach(task => groups.add(task.group));
    return Array.from(groups);
  }

  /**
   * 获取所有任务
   * @returns 任务数组
   */
  public override getTasks(): GroupTaskInterface[] {
    return [...this.tasks];
  }
}