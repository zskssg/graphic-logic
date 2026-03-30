import { BaseScheduler } from './BaseScheduler';
import { CocosScheduler } from './CocosScheduler';

/**
 * 时间调度器管理器
 * 用于创建和管理时间调度器实例
 */
export class SchedulerManager {
  private static instances: Map<string, BaseScheduler>= new Map();

  /**
   * 获取或创建调度器实例
   * @param name 调度器名称
   * @returns 调度器实例
   */
  public static getScheduler(name: string = 'default'): BaseScheduler {
    if (!this.instances.has(name)) {
      this.instances.set(name, new BaseScheduler());
    }
    return this.instances.get(name)!;
  }

  /**
   * 获取或创建Cocos调度器实例
   * @param component Cocos组件实例
   * @param name 调度器名称
   * @returns Cocos时间调度器实例
   */
  public static getCocosScheduler(component: any, name: string = 'cocos'): CocosScheduler {
    if (!this.instances.has(name)) {
      this.instances.set(name, new CocosScheduler(component));
    }
    return this.instances.get(name) as CocosScheduler;
  }

  /**
   * 移除调度器实例
   * @param name 调度器名称
   * @returns 是否移除成功
   */
  public static removeScheduler(name: string): boolean {
    const scheduler = this.instances.get(name);
    if (scheduler) {
      scheduler.stop();
    }
    return this.instances.delete(name);
  }

  /**
   * 清理所有调度器实例
   */
  public static clear(): void {
    this.instances.forEach(scheduler => scheduler.stop());
    this.instances.clear();
  }
}