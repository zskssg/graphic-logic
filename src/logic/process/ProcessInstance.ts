import {
  ProcessInstanceInterface,
  ProcessDefinitionInterface,
  ProcessHistoryItem
} from './interfaces';

/**
 * 流程实例类
 */
export class ProcessInstance implements ProcessInstanceInterface {
  /**
   * 当前节点ID
   */
  public currentNodeId: string | null = null;

  /**
   * 流程状态
   */
  public status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' = 'pending';

  /**
   * 流程历史记录
   */
  private history: ProcessHistoryItem[] = [];

  /**
   * 是否已取消
   */
  private cancelled: boolean = false;

  /**
   * 构造函数
   * @param id 实例ID
   * @param definition 流程定义
   * @param context 初始上下文
   */
  constructor(
    public id: string,
    public definition: ProcessDefinitionInterface,
    public context: any = {}
  ) {}

  /**
   * 执行流程
   * @returns 执行结果
   */
  public async execute(): Promise<any> {
    try {
      this.status = 'running';
      this.currentNodeId = this.definition.startNodeId;
      
      await this.executeNode(this.currentNodeId);
      
      return this.context;
    } catch (error) {
      this.status = 'failed';
      this.addHistory(this.currentNodeId || '', 'error', { error: error instanceof Error ? error.message : error });
      throw error;
    }
  }

  /**
   * 执行节点
   * @param nodeId 节点ID
   * @returns 执行结果
   */
  private async executeNode(nodeId: string): Promise<void> {
    if (this.cancelled) {
      this.status = 'cancelled';
      return;
    }

    const node = this.definition.getNode(nodeId);
    if (!node) {
      throw new Error(`Node "${nodeId}" not found`);
    }

    this.addHistory(nodeId, 'enter');

    try {
      // 执行节点
      const result = await node.execute(this.context);
      
      this.addHistory(nodeId, 'exit', { result });
      
      // 处理特殊节点类型
      if (node.type === 'task') {
        // 处理ForEachContinueNode
        if (node.constructor.name === 'ForEachContinueNode') {
          const forEachNode = this.definition.getNode((node as any).forEachNodeId);
          if (forEachNode && forEachNode.constructor.name === 'ForEachNode') {
            (forEachNode as any).incrementIndex();
          }
        }
      }
      
      // 获取下一个节点ID
      const nextNodeId = node.getNextNodeId(this.context, result);
      
      if (nextNodeId === null) {
        // 流程结束
        this.status = 'completed';
        this.currentNodeId = null;
        return;
      }

      if (Array.isArray(nextNodeId)) {
        // 并行执行多个节点
        await Promise.all(nextNodeId.map(id => this.executeNode(id)));
      } else {
        // 串行执行下一个节点
        this.currentNodeId = nextNodeId;
        await this.executeNode(nextNodeId);
      }
    } catch (error) {
      this.addHistory(nodeId, 'error', { error: error instanceof Error ? error.message : error });
      throw error;
    }
  }

  /**
   * 取消流程
   */
  public cancel(): void {
    this.cancelled = true;
    this.status = 'cancelled';
  }

  /**
   * 获取流程历史
   * @returns 历史记录
   */
  public getHistory(): ProcessHistoryItem[] {
    return [...this.history];
  }

  /**
   * 添加历史记录
   * @param nodeId 节点ID
   * @param event 事件类型
   * @param data 数据
   */
  private addHistory(nodeId: string, event: 'enter' | 'exit' | 'error', data?: any): void {
    const node = this.definition.getNode(nodeId);
    this.history.push({
      timestamp: Date.now(),
      nodeId,
      nodeName: node?.name || nodeId,
      event,
      data
    });
  }
}