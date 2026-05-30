/**
 * 行为树接口定义
 */

/**
 * 行为树节点状态
 */
export enum BehaviorNodeStatus {
  /** 成功 */
  SUCCESS = 'success',
  /** 失败 */
  FAILURE = 'failure',
  /** 运行中 */
  RUNNING = 'running',
  /** 错误 */
  ERROR = 'error'
}

/**
 * 行为树节点接口
 */
export interface BehaviorNodeInterface {
  /** 节点ID */
  id: string;
  /** 节点名称 */
  name: string;
  /** 节点类型 */
  type: string;
  
  /**
   * 执行节点
   * @param context 行为树上下文
   * @returns 执行状态
   */
  execute(context: any): BehaviorNodeStatus;
  
  /**
   * 重置节点状态
   */
  reset(): void;
  
  /**
   * 获取节点状态
   * @returns 当前状态
   */
  getStatus(): BehaviorNodeStatus;
  
  /**
   * 设置节点状态
   * @param status 新状态
   */
  setStatus(status: BehaviorNodeStatus): void;
}

/**
 * 组合节点接口
 */
export interface CompositeNodeInterface extends BehaviorNodeInterface {
  /**
   * 添加子节点
   * @param child 子节点
   */
  addChild(child: BehaviorNodeInterface): void;
  
  /**
   * 获取子节点列表
   * @returns 子节点列表
   */
  getChildren(): BehaviorNodeInterface[];
  
  /**
   * 移除子节点
   * @param child 要移除的子节点
   */
  removeChild(child: BehaviorNodeInterface): void;
  
  /**
   * 清空子节点
   */
  clearChildren(): void;
}

/**
 * 装饰节点接口
 */
export interface DecoratorNodeInterface extends BehaviorNodeInterface {
  /**
   * 设置子节点
   * @param child 子节点
   */
  setChild(child: BehaviorNodeInterface): void;
  
  /**
   * 获取子节点
   * @returns 子节点
   */
  getChild(): BehaviorNodeInterface | null;
}

/**
 * 行为树接口
 */
export interface BehaviorTreeInterface {
  /** 行为树ID */
  id: string;
  /** 行为树名称 */
  name: string;
  /** 根节点 */
  root: BehaviorNodeInterface;
  
  /**
   * 设置根节点
   * @param root 根节点
   */
  setRoot(root: BehaviorNodeInterface): void;
  
  /**
   * 获取根节点
   * @returns 根节点
   */
  getRoot(): BehaviorNodeInterface;
  
  /**
   * 执行行为树
   * @param context 行为树上下文
   * @returns 执行结果
   */
  execute(context: any): BehaviorNodeStatus;
  
  /**
   * 重置行为树
   */
  reset(): void;
  
  /**
   * 获取当前状态
   * @returns 当前状态
   */
  getStatus(): BehaviorNodeStatus;
}