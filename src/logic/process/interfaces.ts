/**
 * 流程节点接口
 */
export interface ProcessNodeInterface {
  /**
   * 节点唯一标识符
   */
  id: string;

  /**
   * 节点名称
   */
  name: string;

  /**
   * 节点类型
   */
  type: 'task' | 'decision' | 'start' | 'end' | 'parallel' | 'subprocess';

  /**
   * 执行节点
   * @param context 流程上下文
   * @returns 执行结果
   */
  execute(context: any): Promise<any> | any;

  /**
   * 获取下一个节点ID
   * @param context 流程上下文
   * @param result 执行结果
   * @returns 下一个节点ID或ID数组（并行节点）
   */
  getNextNodeId(context: any, result?: any): string | string[] | null;
}

/**
 * 任务节点接口
 */
export interface TaskNodeInterface extends ProcessNodeInterface {
  /**
   * 任务执行函数
   */
  task: (context: any) => Promise<any> | any;
}

/**
 * 决策节点接口
 */
export interface DecisionNodeInterface extends ProcessNodeInterface {
  /**
   * 决策条件函数
   */
  condition: (context: any) => string | string[];
}

/**
 * 并行节点接口
 */
export interface ParallelNodeInterface extends ProcessNodeInterface {
  /**
   * 并行分支节点ID
   */
  branches: string[];

  /**
   * 合并节点ID
   */
  mergeNodeId: string;
}

/**
 * 子流程节点接口
 */
export interface SubprocessNodeInterface extends ProcessNodeInterface {
  /**
   * 子流程定义
   */
  subprocess: ProcessDefinitionInterface;
}

/**
 * 流程定义接口
 */
export interface ProcessDefinitionInterface {
  /**
   * 流程ID
   */
  id: string;

  /**
   * 流程名称
   */
  name: string;

  /**
   * 开始节点ID
   */
  startNodeId: string;

  /**
   * 节点集合
   */
  nodes: Map<string, ProcessNodeInterface>;

  /**
   * 获取节点
   * @param nodeId 节点ID
   * @returns 节点对象
   */
  getNode(nodeId: string): ProcessNodeInterface | undefined;

  /**
   * 添加节点
   * @param node 节点对象
   */
  addNode(node: ProcessNodeInterface): void;

  /**
   * 验证流程定义
   * @returns 验证结果
   */
  validate(): boolean;
}

/**
 * 流程实例接口
 */
export interface ProcessInstanceInterface {
  /**
   * 实例ID
   */
  id: string;

  /**
   * 流程定义
   */
  definition: ProcessDefinitionInterface;

  /**
   * 当前节点ID
   */
  currentNodeId: string | null;

  /**
   * 流程上下文
   */
  context: any;

  /**
   * 流程状态
   */
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

  /**
   * 执行流程
   * @returns 执行结果
   */
  execute(): Promise<any>;

  /**
   * 取消流程
   */
  cancel(): void;

  /**
   * 获取流程历史
   * @returns 历史记录
   */
  getHistory(): ProcessHistoryItem[];
}

/**
 * 流程历史项接口
 */
export interface ProcessHistoryItem {
  /**
   * 时间戳
   */
  timestamp: number;

  /**
   * 节点ID
   */
  nodeId: string;

  /**
   * 节点名称
   */
  nodeName: string;

  /**
   * 事件类型
   */
  event: 'enter' | 'exit' | 'error';

  /**
   * 数据
   */
  data?: any;
}

/**
 * 流程引擎接口
 */
export interface ProcessEngineInterface {
  /**
   * 注册流程定义
   * @param definition 流程定义
   */
  registerProcess(definition: ProcessDefinitionInterface): void;

  /**
   * 创建流程实例
   * @param processId 流程ID
   * @param context 初始上下文
   * @returns 流程实例
   */
  createInstance(processId: string, context?: any): ProcessInstanceInterface;

  /**
   * 执行流程
   * @param processId 流程ID
   * @param context 初始上下文
   * @returns 执行结果
   */
  executeProcess(processId: string, context?: any): Promise<any>;
}