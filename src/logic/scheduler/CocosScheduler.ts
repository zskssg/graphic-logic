import { BaseScheduler } from './BaseScheduler';

/**
 * Cocos适配器类
 * 用于在Cocos引擎中使用时间调度器
 */
export class CocosScheduler extends BaseScheduler {
  /**
   * 构造函数
   * @param component Cocos组件实例
   */
  constructor(component: any) {
    super({
      timeProvider: () => Date.now(),
      requestAnimationFrame: (callback) => {
        return component.scheduleOnce(() => callback(Date.now()), 0);
      },
      cancelAnimationFrame: (id) => {
        component.unschedule(id);
      }
    });
  }
}