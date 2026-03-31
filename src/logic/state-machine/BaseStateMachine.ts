import {
  StateInterface,
  TransitionInterface,
  StateMachineInterface
} from './interfaces';

/**
 * 基础状态机类
 * 提供状态机的核心功能实现
 */
export class BaseStateMachine implements StateMachineInterface {
  /** 当前状态名称 */
  public currentState: string = '';

  /** 状态集合 */
  protected states: Map<string, StateInterface>= new Map();

  /** 转换集合，按源状态分组 */
  protected transitions: Map<string, TransitionInterface[]>= new Map();

  /** 状态机上下文 */
  protected context: any;

  /**
   * 构造函数
   * @param context 状态机上下文
   */
  constructor(context: any = {}) {
    this.context = context;
  }

  /**
   * 初始化状态机
   * @param initialStateName 初始状态名称
   */
  public initialize(initialStateName: string): void {
    if (!this.states.has(initialStateName)) {
      throw new Error(`State "${initialStateName}" not found`);
    }

    this.currentState = initialStateName;
    const initialState = this.states.get(initialStateName);
    if (initialState) {
      initialState.enter(this.context);
    }
  }

  /**
   * 更新状态机
   * @param deltaTime 时间增量
   */
  public update(deltaTime: number): void {
    if (!this.currentState) {
      throw new Error('State machine not initialized');
    }

    const currentState = this.states.get(this.currentState);
    if (!currentState) {
      throw new Error(`Current state "${this.currentState}" not found`);
    }

    // 更新当前状态
    currentState.update(this.context, deltaTime);

    // 检查是否有可以触发的转换
    this.checkTransitions();
  }

  /**
   * 添加状态
   * @param state 状态对象
   */
  public addState(state: StateInterface): void {
    this.states.set(state.name, state);
  }

  /**
   * 添加转换
   * @param transition 转换对象
   */
  public addTransition(transition: TransitionInterface): void {
    if (!this.transitions.has(transition.from)) {
      this.transitions.set(transition.from, []);
    }
    this.transitions.get(transition.from)!.push(transition);
  }

  /**
   * 手动切换状态
   * @param stateName 目标状态名称
   */
  public changeState(stateName: string): void {
    if (!this.states.has(stateName)) {
      throw new Error(`State "${stateName}" not found`);
    }

    if (this.currentState === stateName) {
      return; // 已经是目标状态，无需切换
    }

    // 退出当前状态
    const currentState = this.states.get(this.currentState);
    if (currentState) {
      currentState.exit(this.context);
    }

    // 切换到新状态
    this.currentState = stateName;

    // 进入新状态
    const newState = this.states.get(stateName);
    if (newState) {
      newState.enter(this.context);
    }
  }

  /**
   * 检查是否处于指定状态
   * @param stateName 状态名称
   * @returns 是否处于该状态
   */
  public isInState(stateName: string): boolean {
    return this.currentState === stateName;
  }

  /**
   * 获取所有状态名称
   * @returns 状态名称数组
   */
  public getStates(): string[] {
    return Array.from(this.states.keys());
  }

  /**
   * 获取从当前状态出发的所有转换
   * @returns 转换数组
   */
  public getTransitions(): TransitionInterface[] {
    return this.transitions.get(this.currentState) || [];
  }

  /**
   * 检查转换条件并执行转换
   */
  protected checkTransitions(): void {
    const stateTransitions = this.transitions.get(this.currentState);
    if (!stateTransitions) {
      return;
    }

    for (const transition of stateTransitions) {
      if (transition.condition.canTransition(this.context)) {
        // 执行转换动作（如果有）
        if (transition.action) {
          transition.action(this.context);
        }

        // 切换状态
        this.changeState(transition.to);
        break; // 一次只执行一个转换
      }
    }
  }

  /**
   * 设置状态机上下文
   * @param context 上下文对象
   */
  public setContext(context: any): void {
    this.context = context;
  }

  /**
   * 获取状态机上下文
   * @returns 上下文对象
   */
  public getContext(): any {
    return this.context;
  }
}