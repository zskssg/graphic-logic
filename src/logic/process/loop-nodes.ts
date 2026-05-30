import { BaseProcessNode } from './nodes';

/**
 * 循环节点类
 * 支持条件循环执行
 */
export class LoopNode extends BaseProcessNode {
  /**
   * 构造函数
   * @param id 节点ID
   * @param name 节点名称
   * @param condition 循环条件函数
   * @param bodyNodeId 循环体节点ID
   * @param exitNodeId 退出节点ID
   */
  constructor(
    id: string,
    name: string,
    private condition: (context: any) => boolean,
    private bodyNodeId: string,
    private exitNodeId: string
  ) {
    super(id, name, 'task');
  }

  /**
   * 执行节点
   * @param _context 流程上下文（未使用）
   * @returns 执行结果
   */
  public execute(_context: any): any {
    // 循环节点本身不执行具体操作，
    // 循环逻辑在ProcessInstance中处理
    return { loop: 'evaluated' };
  }

  /**
   * 获取下一个节点ID
   * @param context 流程上下文
   * @param _result 执行结果（未使用）
   * @returns 下一个节点ID
   */
  public getNextNodeId(context: any, _result?: any): string {
    return this.condition(context) ? this.bodyNodeId : this.exitNodeId;
  }
}

/**
 * 循环继续节点类
 * 用于循环体结束后回到循环条件判断
 */
export class ContinueNode extends BaseProcessNode {
  /**
   * 构造函数
   * @param id 节点ID
   * @param name 节点名称
   * @param loopNodeId 循环节点ID
   */
  constructor(
    id: string,
    name: string,
    private loopNodeId: string
  ) {
    super(id, name, 'task');
  }

  /**
   * 执行节点
   * @param _context 流程上下文（未使用）
   * @returns 执行结果
   */
  public execute(_context: any): any {
    return { continue: 'loop' };
  }

  /**
   * 获取下一个节点ID
   * @param _context 流程上下文（未使用）
   * @param _result 执行结果（未使用）
   * @returns 循环节点ID
   */
  public getNextNodeId(_context: any, _result?: any): string {
    return this.loopNodeId;
  }
}

/**
 * ForEach节点类
 * 支持集合遍历
 */
export class ForEachNode extends BaseProcessNode {
  /** 当前迭代索引 */
  private currentIndex: number = 0;

  /**
   * 构造函数
   * @param id 节点ID
   * @param name 节点名称
   * @param collectionKey 上下文中集合的键名
   * @param itemKey 上下文中当前项的键名
   * @param bodyNodeId 循环体节点ID
   * @param exitNodeId 退出节点ID
   */
  constructor(
    id: string,
    name: string,
    private collectionKey: string,
    private itemKey: string,
    private bodyNodeId: string,
    private exitNodeId: string
  ) {
    super(id, name, 'task');
  }

  /**
   * 执行节点
   * @param context 流程上下文
   * @returns 执行结果
   */
  public execute(context: any): any {
    const collection = context[this.collectionKey] || [];
    
    if (this.currentIndex< collection.length) {
      context[this.itemKey] = collection[this.currentIndex];
      context['forEachIndex'] = this.currentIndex;
      context['forEachTotal'] = collection.length;
    }
    
    return {
      forEach: 'evaluated',
      index: this.currentIndex,
      total: collection.length
    };
  }

  /**
   * 获取下一个节点ID
   * @param context 流程上下文
   * @param _result 执行结果（未使用）
   * @returns 下一个节点ID
   */
  public getNextNodeId(context: any, _result?: any): string {
    const collection = context[this.collectionKey] || [];
    return this.currentIndex< collection.length ? this.bodyNodeId : this.exitNodeId;
  }

  /**
   * 递增迭代索引
   */
  public incrementIndex(): void {
    this.currentIndex++;
  }

  /**
   * 重置迭代索引
   */
  public resetIndex(): void {
    this.currentIndex = 0;
  }
}

/**
 * ForEach继续节点类
 * 用于ForEach循环体结束后继续下一次迭代
 */
export class ForEachContinueNode extends BaseProcessNode {
  /**
   * 构造函数
   * @param id 节点ID
   * @param name 节点名称
   * @param forEachNodeId ForEach节点ID
   */
  constructor(
    id: string,
    name: string,
    private forEachNodeId: string
  ) {
    super(id, name, 'task');
  }

  /**
   * 执行节点
   * @param _context 流程上下文（未使用）
   * @returns 执行结果
   */
  public execute(_context: any): any {
    return { forEachContinue: true };
  }

  /**
   * 获取下一个节点ID
   * @param _context 流程上下文（未使用）
   * @param _result 执行结果（未使用）
   * @returns ForEach节点ID
   */
  public getNextNodeId(_context: any, _result?: any): string {
    return this.forEachNodeId;
  }
}