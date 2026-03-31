/**
 * 行为树节点实现
 */

import { BehaviorNodeInterface, BehaviorNodeStatus } from './interfaces';

/**
 * 基础行为树节点类
 */
export class BaseBehaviorNode implements BehaviorNodeInterface {
  /** 节点状态 */
  protected status: BehaviorNodeStatus = BehaviorNodeStatus.SUCCESS;

  /**
   * 构造函数
   * @param id 节点ID
   * @param name 节点名称
   * @param type 节点类型
   */
  constructor(
    public id: string,
    public name: string,
    public type: string
  ) {}

  /**
   * 执行节点
   * @param _context 行为树上下文
   * @returns 执行状态
   */
  public execute(_context: any): BehaviorNodeStatus {
    this.status = BehaviorNodeStatus.SUCCESS;
    return this.status;
  }

  /**
   * 重置节点状态
   */
  public reset(): void {
    this.status = BehaviorNodeStatus.SUCCESS;
  }

  /**
   * 获取节点状态
   * @returns 当前状态
   */
  public getStatus(): BehaviorNodeStatus {
    return this.status;
  }

  /**
   * 设置节点状态
   * @param status 新状态
   */
  public setStatus(status: BehaviorNodeStatus): void {
    this.status = status;
  }
}

/**
 * 组合节点基类
 */
export abstract class CompositeNode extends BaseBehaviorNode implements BehaviorNodeInterface {
  /** 子节点列表 */
  protected children: BehaviorNodeInterface[] = [];

  /**
   * 构造函数
   * @param id 节点ID
   * @param name 节点名称
   */
  constructor(id: string, name: string) {
    super(id, name, 'composite');
  }

  /**
   * 添加子节点
   * @param child 子节点
   */
  public addChild(child: BehaviorNodeInterface): void {
    this.children.push(child);
  }

  /**
   * 获取子节点列表
   * @returns 子节点列表
   */
  public getChildren(): BehaviorNodeInterface[] {
    return this.children;
  }

  /**
   * 移除子节点
   * @param child 要移除的子节点
   */
  public removeChild(child: BehaviorNodeInterface): void {
    const index = this.children.indexOf(child);
    if (index !== -1) {
      this.children.splice(index, 1);
    }
  }

  /**
   * 清空子节点
   */
  public clearChildren(): void {
    this.children = [];
  }

  /**
   * 重置节点状态
   */
  public override reset(): void {
    super.reset();
    this.children.forEach(child => child.reset());
  }
}

/**
 * 装饰节点基类
 */
export abstract class DecoratorNode extends BaseBehaviorNode implements BehaviorNodeInterface {
  /** 子节点 */
  protected child: BehaviorNodeInterface | null = null;

  /**
   * 构造函数
   * @param id 节点ID
   * @param name 节点名称
   */
  constructor(id: string, name: string) {
    super(id, name, 'decorator');
  }

  /**
   * 设置子节点
   * @param child 子节点
   */
  public setChild(child: BehaviorNodeInterface): void {
    this.child = child;
  }

  /**
   * 获取子节点
   * @returns 子节点
   */
  public getChild(): BehaviorNodeInterface | null {
    return this.child;
  }

  /**
   * 重置节点状态
   */
  public override reset(): void {
    super.reset();
    if (this.child) {
      this.child.reset();
    }
  }
}

/**
 * 叶子节点基类
 */
export abstract class LeafNode extends BaseBehaviorNode implements BehaviorNodeInterface {
  /**
   * 构造函数
   * @param id 节点ID
   * @param name 节点名称
   */
  constructor(id: string, name: string) {
    super(id, name, 'leaf');
  }
}