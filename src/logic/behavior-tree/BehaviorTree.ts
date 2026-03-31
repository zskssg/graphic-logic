/**
 * 行为树实现
 */

import { BehaviorTreeInterface, BehaviorNodeInterface, BehaviorNodeStatus } from './interfaces';
import { SuccessNode } from './leaf-nodes';

/**
 * 行为树类
 * 管理行为树的执行和状态
 */
export class BehaviorTree implements BehaviorTreeInterface {
  /** 行为树状态 */
  private status: BehaviorNodeStatus = BehaviorNodeStatus.SUCCESS;
  /** 根节点 */
  public root: BehaviorNodeInterface;

  /**
   * 构造函数
   * @param id 行为树ID
   * @param name 行为树名称
   * @param root 根节点（可选）
   */
  constructor(
    public id: string,
    public name: string,
    root?: BehaviorNodeInterface
  ) {
    this.root = root || new SuccessNode('default-root');
  }

  /**
   * 设置根节点
   * @param root 根节点
   */
  public setRoot(root: BehaviorNodeInterface): void {
    this.root = root;
  }

  /**
   * 获取根节点
   * @returns 根节点
   */
  public getRoot(): BehaviorNodeInterface {
    return this.root;
  }

  /**
   * 执行行为树
   * @param context 行为树上下文
   * @returns 执行结果
   */
  public execute(context: any): BehaviorNodeStatus {
    if (!this.root) {
      this.status = BehaviorNodeStatus.ERROR;
      return BehaviorNodeStatus.ERROR;
    }

    try {
      this.status = this.root.execute(context);
      return this.status;
    } catch (error) {
      console.error('Behavior tree execution error:', error);
      this.status = BehaviorNodeStatus.ERROR;
      return BehaviorNodeStatus.ERROR;
    }
  }

  /**
   * 重置行为树
   */
  public reset(): void {
    if (this.root) {
      this.root.reset();
    }
    this.status = BehaviorNodeStatus.SUCCESS;
  }

  /**
   * 获取当前状态
   * @returns 当前状态
   */
  public getStatus(): BehaviorNodeStatus {
    return this.status;
  }

  /**
   * 设置行为树状态
   * @param status 新状态
   */
  public setStatus(status: BehaviorNodeStatus): void {
    this.status = status;
  }

  /**
   * 获取行为树信息
   * @returns 行为树信息对象
   */
  public getInfo(): {
    id: string;
    name: string;
    status: BehaviorNodeStatus;
    hasRoot: boolean;
  } {
    return {
      id: this.id,
      name: this.name,
      status: this.status,
      hasRoot: this.root !== null
    };
  }

  /**
   * 检查行为树是否有效
   * @returns 是否有效
   */
  public isValid(): boolean {
    return this.root !== undefined;
  }

  /**
   * 序列化行为树
   * @returns 序列化后的行为树数据
   */
  public serialize(): any {
    const serializeNode = (node: BehaviorNodeInterface): any => {
      const data: any = {
        id: node.id,
        name: node.name,
        type: node.type,
        status: node.getStatus()
      };

      // 处理组合节点
      if ('getChildren' in node && typeof node.getChildren === 'function') {
        data.children = node.getChildren().map(serializeNode);
      }

      // 处理装饰节点
      if ('getChild' in node && typeof node.getChild === 'function' && node.getChild()) {
        data.child = serializeNode(node.getChild());
      }

      return data;
    };

    return {
      id: this.id,
      name: this.name,
      status: this.status,
      root: serializeNode(this.root)
    };
  }

  /**
   * 打印行为树结构
   * @param _indent 缩进级别
   */
  public printTree(_indent: number = 0): void {
    const printNode = (node: BehaviorNodeInterface, level: number): void => {
      const indentStr = '  '.repeat(level);
      console.log(`${indentStr}- ${node.name} (${node.type}) [${node.getStatus()}]`);

      // 打印子节点
      if ('getChildren' in node && typeof node.getChildren === 'function') {
        node.getChildren().forEach((child: BehaviorNodeInterface) => printNode(child, level + 1));
      }

      // 打印装饰节点的子节点
      if ('getChild' in node && typeof node.getChild === 'function') {
        const child = node.getChild();
        if (child) {
          printNode(child, level + 1);
        }
      }
    };

    console.log(`Behavior Tree: ${this.name}`);
    console.log(`ID: ${this.id}`);
    console.log(`Status: ${this.status}`);
    
    printNode(this.root, 0);
  }
}