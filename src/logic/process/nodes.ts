import {
  ProcessNodeInterface,
  TaskNodeInterface,
  DecisionNodeInterface,
  ParallelNodeInterface,
  SubprocessNodeInterface,
  ProcessDefinitionInterface
} from './interfaces';
import { ProcessEngine } from './ProcessEngine';

/**
 * 基础流程节点类
 */
export abstract class BaseProcessNode implements ProcessNodeInterface {
  /**
   * 构造函数
   * @param id 节点ID
   * @param name 节点名称
   * @param type 节点类型
   */
  constructor(
    public id: string,
    public name: string,
    public type: 'task' | 'decision' | 'start' | 'end' | 'parallel' | 'subprocess'
  ) {}

  /**
   * 执行节点
   * @param context 流程上下文
   * @returns 执行结果
   */
  public abstract execute(context: any): Promise<any> | any;

  /**
   * 获取下一个节点ID
   * @param context 流程上下文
   * @param result 执行结果
   * @returns 下一个节点ID或ID数组（并行节点）
   */
  public abstract getNextNodeId(context: any, result?: any): string | string[] | null;
}

/**
 * 开始节点类
 */
export class StartNode extends BaseProcessNode {
  private nextNodeId: string;

  /**
   * 构造函数
   * @param id 节点ID
   * @param name 节点名称
   * @param nextNodeId 下一个节点ID
   */
  constructor(id: string, name: string, nextNodeId: string) {
    super(id, name, 'start');
    this.nextNodeId = nextNodeId;
  }

  /**
   * 执行节点
   * @param _context 流程上下文（未使用）
   * @returns 执行结果
   */
  public execute(_context: any): any {
    return { status: 'started' };
  }

  /**
   * 获取下一个节点ID
   * @param _context 流程上下文（未使用）
   * @param _result 执行结果（未使用）
   * @returns 下一个节点ID
   */
  public getNextNodeId(_context: any, _result?: any): string {
    return this.nextNodeId;
  }
}

/**
 * 结束节点类
 */
export class EndNode extends BaseProcessNode {
  /**
   * 构造函数
   * @param id 节点ID
   * @param name 节点名称
   */
  constructor(id: string, name: string) {
    super(id, name, 'end');
  }

  /**
   * 执行节点
   * @param _context 流程上下文（未使用）
   * @returns 执行结果
   */
  public execute(_context: any): any {
    return { status: 'completed' };
  }

  /**
   * 获取下一个节点ID
   * @param _context 流程上下文（未使用）
   * @param _result 执行结果（未使用）
   * @returns null（结束节点没有下一个节点）
   */
  public getNextNodeId(_context: any, _result?: any): null {
    return null;
  }
}

/**
 * 任务节点类
 */
export class TaskNode extends BaseProcessNode implements TaskNodeInterface {
  /**
   * 构造函数
   * @param id 节点ID
   * @param name 节点名称
   * @param task 任务执行函数
   * @param nextNodeId 下一个节点ID
   */
  constructor(
    id: string,
    name: string,
    public task: (context: any) => Promise<any> | any,
    private nextNodeId: string
  ) {
    super(id, name, 'task');
  }

  /**
   * 执行节点
   * @param context 流程上下文
   * @returns 执行结果
   */
  public execute(context: any): Promise<any> | any {
    return this.task(context);
  }

  /**
   * 获取下一个节点ID
   * @param _context 流程上下文（未使用）
   * @param _result 执行结果（未使用）
   * @returns 下一个节点ID
   */
  public getNextNodeId(_context: any, _result?: any): string {
    return this.nextNodeId;
  }
}

/**
 * 决策节点类
 */
export class DecisionNode extends BaseProcessNode implements DecisionNodeInterface {
  /**
   * 构造函数
   * @param id 节点ID
   * @param name 节点名称
   * @param condition 决策条件函数
   */
  constructor(
    id: string,
    name: string,
    public condition: (context: any) => string | string[]
  ) {
    super(id, name, 'decision');
  }

  /**
   * 执行节点
   * @param context 流程上下文
   * @returns 执行结果
   */
  public execute(context: any): any {
    return { decision: this.condition(context) };
  }

  /**
   * 获取下一个节点ID
   * @param context 流程上下文
   * @param _result 执行结果（未使用）
   * @returns 下一个节点ID或ID数组
   */
  public getNextNodeId(context: any, _result?: any): string | string[] {
    return this.condition(context);
  }
}

/**
 * 并行节点类
 */
export class ParallelNode extends BaseProcessNode implements ParallelNodeInterface {
  /**
   * 构造函数
   * @param id 节点ID
   * @param name 节点名称
   * @param branches 并行分支节点ID
   * @param mergeNodeId 合并节点ID
   */
  constructor(
    id: string,
    name: string,
    public branches: string[],
    public mergeNodeId: string
  ) {
    super(id, name, 'parallel');
  }

  /**
   * 执行节点
   * @param _context 流程上下文（未使用）
   * @returns 执行结果
   */
  public execute(_context: any): any {
    return { branches: this.branches };
  }

  /**
   * 获取下一个节点ID
   * @param _context 流程上下文（未使用）
   * @param _result 执行结果（未使用）
   * @returns 并行分支节点ID数组
   */
  public getNextNodeId(_context: any, _result?: any): string[] {
    return this.branches;
  }
}

/**
 * 子流程节点类
 */
export class SubprocessNode extends BaseProcessNode implements SubprocessNodeInterface {
  /**
   * 构造函数
   * @param id 节点ID
   * @param name 节点名称
   * @param subprocess 子流程定义
   * @param nextNodeId 下一个节点ID
   */
  constructor(
    id: string,
    name: string,
    public subprocess: ProcessDefinitionInterface,
    private nextNodeId: string
  ) {
    super(id, name, 'subprocess');
  }

  /**
   * 执行节点
   * @param context 流程上下文
   * @returns 执行结果
   */
  public async execute(context: any): Promise<any> {
    // 创建子流程实例并执行
    const subprocessEngine = new ProcessEngine();
    subprocessEngine.registerProcess(this.subprocess);
    await subprocessEngine.executeProcess(this.subprocess.id, context);
    return { subprocess: this.subprocess.name };
  }

  /**
   * 获取下一个节点ID
   * @param _context 流程上下文（未使用）
   * @param _result 执行结果（未使用）
   * @returns 下一个节点ID
   */
  public getNextNodeId(_context: any, _result?: any): string {
    return this.nextNodeId;
  }
}