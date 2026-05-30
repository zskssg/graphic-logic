import { BehaviorNodeStatus } from './interfaces';
import { LeafNode } from './nodes';

/**
 * 异步节点
 * 支持异步操作（Promise）
 */
export class AsyncNode extends LeafNode {
  private asyncAction: (context: any) => Promise<BehaviorNodeStatus>;
  private pendingPromise: Promise<BehaviorNodeStatus>| null = null;
  private result: BehaviorNodeStatus | null = null;

  constructor(id: string, asyncAction: (context: any) => Promise<BehaviorNodeStatus>, name: string = 'Async') {
    super(id, name);
    this.asyncAction = asyncAction;
  }

  public override execute(context: any): BehaviorNodeStatus {
    // 如果已经有结果，直接返回
    if (this.result !== null) {
      const status = this.result;
      this.result = null;
      this.pendingPromise = null;
      this.setStatus(status);
      return status;
    }

    // 如果没有挂起的Promise，创建一个
    if (!this.pendingPromise) {
      this.pendingPromise = this.asyncAction(context).then((status) => {
        this.result = status;
        return status;
      }).catch(() => {
        this.result = BehaviorNodeStatus.ERROR;
        return BehaviorNodeStatus.ERROR;
      });
    }

    // 返回RUNNING状态，等待异步操作完成
    this.setStatus(BehaviorNodeStatus.RUNNING);
    return BehaviorNodeStatus.RUNNING;
  }

  public override reset(): void {
    super.reset();
    this.pendingPromise = null;
    this.result = null;
  }
}

/**
 * 协程节点
 * 支持Generator函数
 */
export class CoroutineNode extends LeafNode {
  private coroutine: (context: any) => Generator<BehaviorNodeStatus, BehaviorNodeStatus, void>;
  private generator: Generator<BehaviorNodeStatus, BehaviorNodeStatus, void> | null = null;

  constructor(id: string, coroutine: (context: any) => Generator<BehaviorNodeStatus, BehaviorNodeStatus, void>, name: string = 'Coroutine') {
    super(id, name);
    this.coroutine = coroutine;
  }

  public override execute(context: any): BehaviorNodeStatus {
    // 如果没有生成器，创建一个
    if (!this.generator) {
      this.generator = this.coroutine(context);
    }

    try {
      const result = this.generator.next();
      
      if (result.done) {
        const status = result.value;
        this.generator = null;
        this.setStatus(status);
        return status;
      } else {
        const status = result.value;
        this.setStatus(status);
        return status;
      }
    } catch (error) {
      this.generator = null;
      this.setStatus(BehaviorNodeStatus.ERROR);
      return BehaviorNodeStatus.ERROR;
    }
  }

  public override reset(): void {
    super.reset();
    this.generator = null;
  }
}

/**
 * 事件节点
 * 响应外部事件触发
 */
export class EventNode extends LeafNode {
  private eventName: string;
  private eventData: any = null;
  private eventReceived: boolean = false;

  constructor(id: string, eventName: string, name: string = 'Event') {
    super(id, name);
    this.eventName = eventName;
  }

  /**
   * 触发事件
   * @param data 事件数据
   */
  public trigger(data?: any): void {
    this.eventData = data;
    this.eventReceived = true;
  }

  public override execute(context: any): BehaviorNodeStatus {
    if (this.eventReceived) {
      // 将事件数据保存到上下文中
      context.event = {
        name: this.eventName,
        data: this.eventData
      };
      
      this.eventReceived = false;
      this.eventData = null;
      this.setStatus(BehaviorNodeStatus.SUCCESS);
      return BehaviorNodeStatus.SUCCESS;
    }

    this.setStatus(BehaviorNodeStatus.RUNNING);
    return BehaviorNodeStatus.RUNNING;
  }

  public override reset(): void {
    super.reset();
    this.eventReceived = false;
    this.eventData = null;
  }
}

/**
 * 参数化动作节点
 * 支持动态参数配置
 */
export class ParameterizedActionNode extends LeafNode {
  private action: (context: any, params: any) => BehaviorNodeStatus;
  private params: any;

  constructor(id: string, action: (context: any, params: any) => BehaviorNodeStatus, params: any = {}, name: string = 'ParameterizedAction') {
    super(id, name);
    this.action = action;
    this.params = params;
  }

  /**
   * 更新参数
   * @param params 新的参数对象
   */
  public updateParams(params: any): void {
    this.params = { ...this.params, ...params };
  }

  public override execute(context: any): BehaviorNodeStatus {
    const status = this.action(context, this.params);
    this.setStatus(status);
    return status;
  }
}

/**
 * 动态条件节点
 * 支持动态条件配置
 */
export class DynamicConditionNode extends LeafNode {
  private condition: (context: any, params: any) => boolean;
  private params: any;

  constructor(id: string, condition: (context: any, params: any) => boolean, params: any = {}, name: string = 'DynamicCondition') {
    super(id, name);
    this.condition = condition;
    this.params = params;
  }

  /**
   * 更新参数
   * @param params 新的参数对象
   */
  public updateParams(params: any): void {
    this.params = { ...this.params, ...params };
  }

  public override execute(context: any): BehaviorNodeStatus {
    const result = this.condition(context, this.params);
    const status = result ? BehaviorNodeStatus.SUCCESS : BehaviorNodeStatus.FAILURE;
    this.setStatus(status);
    return status;
  }
}
