import { BaseStateMachine } from './BaseStateMachine';

/**
 * 下推状态机类
 * 支持状态栈，类似于调用栈的行为
 */
export class PushdownStateMachine extends BaseStateMachine {
  /** 状态栈 */
  private stateStack: string[] = [];

  /**
   * 初始化状态机
   * @param initialStateName 初始状态名称
   */
  public override initialize(initialStateName: string): void {
    if (!this.states.has(initialStateName)) {
      throw new Error(`State "${initialStateName}" not found`);
    }

    // 清空栈并添加初始状态
    this.stateStack = [initialStateName];
    
    // 进入初始状态
    const initialState = this.states.get(initialStateName);
    if (initialState) {
      initialState.enter(this.context);
    }

    this.currentState = initialStateName;
  }

  /**
   * 更新状态机
   * @param deltaTime 时间增量
   */
  public override update(deltaTime: number): void {
    if (this.stateStack.length === 0) {
      return;
    }

    // 更新栈顶状态
    const currentStateName = this.stateStack[this.stateStack.length - 1];
    if (currentStateName) {
      const currentState = this.states.get(currentStateName);
      if (currentState) {
        currentState.update(this.context, deltaTime);
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

    if (this.stateStack.length >0) {
      // 退出当前状态
      const currentStateName = this.stateStack.pop()!;
      const currentState = this.states.get(currentStateName);
      if (currentState) {
        currentState.exit(this.context);
      }
    }

    // 进入新状态
    this.stateStack.push(stateName);
    const newState = this.states.get(stateName);
    if (newState) {
      newState.enter(this.context);
    }

    this.currentState = stateName;
  }

  /**
   * 压入状态（保留当前状态）
   * @param stateName 要压入的状态名称
   */
  public pushState(stateName: string): void {
    if (!this.states.has(stateName)) {
      throw new Error(`State "${stateName}" not found`);
    }

    // 进入新状态
    const newState = this.states.get(stateName);
    if (newState) {
      newState.enter(this.context);
    }

    // 将新状态压入栈
    this.stateStack.push(stateName);
    this.currentState = stateName;
  }

  /**
   * 弹出状态（返回上一个状态）
   */
  public popState(): void {
    if (this.stateStack.length<= 1) {
      throw new Error('Cannot pop from empty state stack');
    }

    // 退出当前状态
    const currentStateName = this.stateStack.pop();
    if (currentStateName) {
      const currentState = this.states.get(currentStateName);
      if (currentState) {
        currentState.exit(this.context);
      }
    }

    // 恢复到上一个状态
    const previousStateName = this.stateStack[this.stateStack.length - 1];
    if (previousStateName) {
      this.currentState = previousStateName;
    }
  }

  /**
   * 获取状态栈
   * @returns 状态栈数组
   */
  public getStateStack(): string[] {
    return [...this.stateStack];
  }

  /**
   * 获取栈的深度
   * @returns 栈深度
   */
  public getStackDepth(): number {
    return this.stateStack.length;
  }

  /**
   * 检查栈是否为空
   * @returns 是否为空
   */
  public isStackEmpty(): boolean {
    return this.stateStack.length === 0;
  }

  /**
   * 清空状态栈
   */
  public clearStack(): void {
    // 清空状态栈
    for (let i = this.stateStack.length - 1; i >= 0; i--) {
      const stateName = this.stateStack[i];
      if (stateName) {
        const state = this.states.get(stateName);
        if (state) {
          state.exit(this.context);
        }
      }
    }

    this.stateStack = [];
    this.currentState = '';
  }
}