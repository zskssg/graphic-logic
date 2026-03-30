/**
 * 时间调度器导出文件
 * 保持向后兼容性，导入新的模块化实现
 */
export { BaseScheduler as TimeScheduler } from './scheduler/BaseScheduler';
export { CocosScheduler as CocosTimeScheduler } from './scheduler/CocosScheduler';
export { SchedulerManager } from './scheduler/SchedulerManager';
export * from './scheduler/interfaces';
