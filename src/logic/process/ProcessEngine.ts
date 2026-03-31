import {
  ProcessEngineInterface,
  ProcessDefinitionInterface,
  ProcessInstanceInterface
} from './interfaces';
import { ProcessInstance } from './ProcessInstance';

/**
 * 流程引擎类
 */
export class ProcessEngine implements ProcessEngineInterface {
  /**
   * 流程定义集合
   */
  private processes: Map<string, ProcessDefinitionInterface> = new Map();

  /**
   * 流程实例集合
   */
  private instances: Map<string, ProcessInstanceInterface> = new Map();

  /**
   * 实例计数器
   */
  private instanceCounter: number = 0;

  /**
   * 注册流程定义
   * @param definition 流程定义
   */
  public registerProcess(definition: ProcessDefinitionInterface): void {
    // 验证流程定义
    definition.validate();
    
    // 注册流程
    this.processes.set(definition.id, definition);
  }

  /**
   * 创建流程实例
   * @param processId 流程ID
   * @param context 初始上下文
   * @returns 流程实例
   */
  public createInstance(processId: string, context: any = {}): ProcessInstanceInterface {
    const definition = this.processes.get(processId);
    if (!definition) {
      throw new Error(`Process "${processId}" not found`);
    }

    const instanceId = `instance_${processId}_${++this.instanceCounter}`;
    const instance = new ProcessInstance(instanceId, definition, context);
    
    this.instances.set(instanceId, instance);
    return instance;
  }

  /**
   * 执行流程
   * @param processId 流程ID
   * @param context 初始上下文
   * @returns 执行结果
   */
  public async executeProcess(processId: string, context: any = {}): Promise<any> {
    const instance = this.createInstance(processId, context);
    return instance.execute();
  }

  /**
   * 获取流程定义
   * @param processId 流程ID
   * @returns 流程定义
   */
  public getProcess(processId: string): ProcessDefinitionInterface | undefined {
    return this.processes.get(processId);
  }

  /**
   * 获取流程实例
   * @param instanceId 实例ID
   * @returns 流程实例
   */
  public getInstance(instanceId: string): ProcessInstanceInterface | undefined {
    return this.instances.get(instanceId);
  }

  /**
   * 获取所有流程定义
   * @returns 流程定义数组
   */
  public getProcesses(): ProcessDefinitionInterface[] {
    return Array.from(this.processes.values());
  }

  /**
   * 获取所有流程实例
   * @returns 流程实例数组
   */
  public getInstances(): ProcessInstanceInterface[] {
    return Array.from(this.instances.values());
  }

  /**
   * 移除流程定义
   * @param processId 流程ID
   */
  public removeProcess(processId: string): void {
    this.processes.delete(processId);
    
    // 移除相关的实例
    this.instances.forEach((instance, instanceId) => {
      if (instance.definition.id === processId) {
        this.instances.delete(instanceId);
      }
    });
  }

  /**
   * 移除流程实例
   * @param instanceId 实例ID
   */
  public removeInstance(instanceId: string): void {
    this.instances.delete(instanceId);
  }

  /**
   * 清除所有流程定义和实例
   */
  public clear(): void {
    this.processes.clear();
    this.instances.clear();
    this.instanceCounter = 0;
  }
}