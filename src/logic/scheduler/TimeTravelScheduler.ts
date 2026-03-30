import { BaseScheduler } from './BaseScheduler';

/**
 * 时间状态接口
 */
export interface TimeState {
  time: number;
  completedTasks: Set<string>;
  pausedElapsed: number;
}

/**
 * 时间旅行调度器类
 * 支持时间回溯、前进和状态保存
 */
export class TimeTravelScheduler extends BaseScheduler {
  private timeStates: TimeState[] = [];
  private maxStates: number = 100; // 最大保存状态数
  private currentStateIndex: number = -1;

  /**
   * 构造函数
   * @param options 配置选项
   * @param maxStates 最大保存状态数（默认100）
   */
  constructor(options?: any, maxStates: number = 100) {
    super(options);
    this.maxStates = maxStates;
  }

  /**
   * 保存当前时间状态
   */
  public saveState(): void {
    const state: TimeState = {
      time: this.getCurrentTime(),
      completedTasks: new Set(this.completedTasks),
      pausedElapsed: this.pausedElapsed
    };

    // 如果当前不是最新状态，删除后面的状态
    if (this.currentStateIndex< this.timeStates.length - 1) {
      this.timeStates = this.timeStates.slice(0, this.currentStateIndex + 1);
    }

    this.timeStates.push(state);

    // 限制状态数量
    if (this.timeStates.length >this.maxStates) {
      this.timeStates.shift();
      this.currentStateIndex--;
    } else {
      this.currentStateIndex++;
    }
  }

  /**
   * 回溯到上一个状态
   * @returns 是否成功回溯
   */
  public undo(): boolean {
    if (this.currentStateIndex<= 0) return false;

    this.currentStateIndex--;
    const state = this.timeStates[this.currentStateIndex];
    if (state) {
      this.restoreState(state);
    }
    return true;
  }

  /**
   * 前进到下一个状态
   * @returns 是否成功前进
   */
  public redo(): boolean {
    if (this.currentStateIndex >= this.timeStates.length - 1) return false;

    this.currentStateIndex++;
    const state = this.timeStates[this.currentStateIndex];
    if (state) {
      this.restoreState(state);
    }
    return true;
  }

  /**
   * 跳转到指定状态
   * @param index 状态索引
   * @returns 是否成功跳转
   */
  public gotoState(index: number): boolean {
    if (index< 0 || index >= this.timeStates.length) return false;

    this.currentStateIndex = index;
    const state = this.timeStates[this.currentStateIndex];
    if (state) {
      this.restoreState(state);
    }
    return true;
  }

  /**
   * 清除所有时间状态
   */
  public clearStates(): void {
    this.timeStates = [];
    this.currentStateIndex = -1;
  }

  /**
   * 获取所有保存的状态
   * @returns 状态数组
   */
  public getStates(): TimeState[] {
    return [...this.timeStates];
  }

  /**
   * 获取当前状态索引
   * @returns 当前状态索引
   */
  public getCurrentStateIndex(): number {
    return this.currentStateIndex;
  }

  /**
   * 恢复状态
   * @param state 要恢复的状态
   */
  private restoreState(state: TimeState): void {
    // 计算时间差
    const timeDiff = state.time - this.getCurrentTime();
    
    // 调整暂停时间
    this.pausedElapsed += timeDiff;
    
    // 恢复已完成任务
    this.completedTasks = new Set(state.completedTasks);
  }

  /**
   * 动画循环
   * @param _currentTime 当前时间（未使用）
   */
  protected override tick(_currentTime: number): void {
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

  /**
   * 启动调度器
   */
  public override start(): void {
    super.start();
    this.saveState(); // 保存初始状态
  }

  /**
   * 停止调度器
   */
  public override stop(): void {
    super.stop();
    this.clearStates(); // 清除所有状态
  }

  /**
   * 重置调度器
   */
  public override reset(): void {
    super.reset();
    this.clearStates(); // 清除所有状态
  }
}