/**
 * 状态接口
 */
export interface StateInterface {
  /**
   * 状态名称
   */
  name: string;

  /**
   * 进入状态时调用
   * @param context 状态机上下文
   */
  enter(context: any): void;

  /**
   * 更新状态时调用
   * @param context 状态机上下文
   * @param deltaTime 时间增量
   */
  update(context: any, deltaTime: number): void;

  /**
   * 退出状态时调用
   * @param context 状态机上下文
   */
  exit(context: any): void;
}

/**
 * 分层状态接口
 * 支持状态嵌套和继承
 */
export interface HierarchicalStateInterface extends StateInterface {
  /**
   * 父状态名称
   */
  parent?: string;

  /**
   * 子状态列表
   */
  children: string[];

  /**
   * 默认子状态名称
   */
  defaultChild?: string;
}

/**
 * 转换条件接口
 */
export interface TransitionConditionInterface {
  /**
   * 检查是否可以转换到目标状态
   * @param context 状态机上下文
   * @returns 是否可以转换
   */
  canTransition(context: any): boolean;
}

/**
 * 转换接口
 */
export interface TransitionInterface {
  /**
   * 源状态名称
   */
  from: string;

  /**
   * 目标状态名称
   */
  to: string;

  /**
   * 转换条件
   */
  condition: TransitionConditionInterface;

  /**
   * 转换动作（可选）
   * @param context 状态机上下文
   */
  action?: (context: any) => void;
}

/**
 * 状态机接口
 */
export interface StateMachineInterface {
  /**
   * 当前状态名称
   */
  currentState: string;

  /**
   * 初始化状态机
   * @param initialStateName 初始状态名称
   */
  initialize(initialStateName: string): void;

  /**
   * 更新状态机
   * @param deltaTime 时间增量
   */
  update(deltaTime: number): void;

  /**
   * 添加状态
   * @param state 状态对象
   */
  addState(state: StateInterface): void;

  /**
   * 添加转换
   * @param transition 转换对象
   */
  addTransition(transition: TransitionInterface): void;

  /**
   * 手动切换状态
   * @param stateName 目标状态名称
   */
  changeState(stateName: string): void;

  /**
   * 检查是否处于指定状态
   * @param stateName 状态名称
   * @returns 是否处于该状态
   */
  isInState(stateName: string): boolean;

  /**
   * 获取所有状态名称
   * @returns 状态名称数组
   */
  getStates(): string[];

  /**
   * 获取从当前状态出发的所有转换
   * @returns 转换数组
   */
  getTransitions(): TransitionInterface[];
}