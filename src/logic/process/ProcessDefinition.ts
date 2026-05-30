import {
  ProcessDefinitionInterface,
  ProcessNodeInterface
} from './interfaces';

/**
 * 流程定义类
 */
export class ProcessDefinition implements ProcessDefinitionInterface {
  /**
   * 节点集合
   */
  public nodes: Map<string, ProcessNodeInterface> = new Map();

  /**
   * 构造函数
   * @param id 流程ID
   * @param name 流程名称
   * @param startNodeId 开始节点ID
   */
  constructor(
    public id: string,
    public name: string,
    public startNodeId: string
  ) {}

  /**
   * 获取节点
   * @param nodeId 节点ID
   * @returns 节点对象
   */
  public getNode(nodeId: string): ProcessNodeInterface | undefined {
    return this.nodes.get(nodeId);
  }

  /**
   * 添加节点
   * @param node 节点对象
   */
  public addNode(node: ProcessNodeInterface): void {
    this.nodes.set(node.id, node);
  }

  /**
   * 验证流程定义
   * @returns 验证结果
   */
  public validate(): boolean {
    // 检查开始节点是否存在
    if (!this.nodes.has(this.startNodeId)) {
      throw new Error(`Start node "${this.startNodeId}" not found`);
    }

    // 检查所有节点ID是否唯一
    const nodeIds = Array.from(this.nodes.keys());
    const uniqueIds = new Set(nodeIds);
    if (nodeIds.length !== uniqueIds.size) {
      throw new Error('Duplicate node IDs found');
    }

    // 检查是否有结束节点
    const hasEndNode = Array.from(this.nodes.values()).some(node => node.type === 'end');
    if (!hasEndNode) {
      throw new Error('No end node found in process definition');
    }

    return true;
  }
}