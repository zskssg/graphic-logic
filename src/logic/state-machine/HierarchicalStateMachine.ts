import { BaseStateMachine } from './BaseStateMachine';
import { HierarchicalStateInterface } from './interfaces';

/**
 * 分层状态机类
 * 支持状态嵌套、继承和父子状态关系
 */
export class HierarchicalStateMachine extends BaseStateMachine {
  /** 当前活动的状态路径 */
  private activeStatePath: string[] = [];

  /**
   * 添加状态
   * @param state 状态对象
   */
  public override addState(state: HierarchicalStateInterface): void {
    super.addState(state);

    // 如果有父状态，将此状态添加到父状态的子列表中
    if (state.parent) {
      const parentState = this.states.get(state.parent);
      if (parentState) {
        (parentState as HierarchicalStateInterface).children.push(state.name);
      }
    }
  }

  /**
   * 初始化状态机
   * @param initialStateName 初始状态名称
   */
  public override initialize(initialStateName: string): void {
    const initialState = this.states.get(initialStateName);
    if (!initialState) {
      throw new Error(`State "${initialStateName}" not found`);
    }

    // 构建状态路径
    this.activeStatePath = this.buildStatePath(initialStateName);
    
    // 从根状态开始进入
    for (const stateName of this.activeStatePath) {
      const state = this.states.get(stateName);
      if (state) {
        state.enter(this.context);
      }
    }

    this.currentState = initialStateName;
  }

  /**
   * 更新状态机
   * @param deltaTime 时间增量
   */
  public override update(deltaTime: number): void {
    // 更新所有活动状态（从根到叶）
    for (const stateName of this.activeStatePath) {
      const state = this.states.get(stateName);
      if (state) {
        state.update(this.context, deltaTime);
      }
    }

    // 检查转换
    this.checkTransitions();
  }

  /**
   * 手动切换状态
   * @param stateName 目标状态名称
   */
  public override changeState(stateName: string): void {
    if (!this.states.has(stateName)) {
      throw new Error(`State "${stateName}" not found`);
    }

    if (this.currentState === stateName) {
      return;
    }

    const newStatePath = this.buildStatePath(stateName);
    const commonPrefix = this.findCommonPrefix(this.activeStatePath, newStatePath);

    // 退出不再活动的状态（从叶到公共前缀）
    for (let i = this.activeStatePath.length - 1; i >= commonPrefix; i--) {
      const stateName = this.activeStatePath[i];
      if (stateName) {
        const state = this.states.get(stateName);
        if (state) {
          state.exit(this.context);
        }
      }
    }

    // 进入新的状态（从公共前缀到新状态）
    for (let i = commonPrefix; i< newStatePath.length; i++) {
      const stateName = newStatePath[i];
      if (stateName) {
        const state = this.states.get(stateName);
        if (state) {
          state.enter(this.context);
        }
      }
    }

    this.activeStatePath = newStatePath;
    this.currentState = stateName;
  }

  /**
   * 获取当前活动的所有状态
   * @returns 活动状态名称数组
   */
  public getActiveStates(): string[] {
    return [...this.activeStatePath];
  }

  /**
   * 构建状态路径（从根到当前状态）
   * @param stateName 状态名称
   * @returns 状态路径数组
   */
  private buildStatePath(stateName: string): string[] {
    const path: string[] = [];
    let currentStateName = stateName;

    while (currentStateName) {
      path.unshift(currentStateName);
      const state = this.states.get(currentStateName);
      if (!state) break;
      
      const hierarchicalState = state as HierarchicalStateInterface;
      currentStateName = hierarchicalState.parent || '';
    }

    return path;
  }

  /**
   * 查找两个状态路径的公共前缀
   * @param path1 路径1
   * @param path2 路径2
   * @returns 公共前缀长度
   */
  private findCommonPrefix(path1: string[], path2: string[]): number {
    let length = 0;
    while (length< path1.length && length < path2.length && path1[length] === path2[length]) {
      length++;
    }
    return length;
  }

  /**
   * 检查是否处于指定状态或其子状态
   * @param stateName 状态名称
   * @returns 是否处于该状态或其子状态
   */
  public isInStateOrSubstate(stateName: string): boolean {
    return this.activeStatePath.includes(stateName);
  }
}