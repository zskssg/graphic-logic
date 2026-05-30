import { ProcessDefinition } from './ProcessDefinition';

/**
 * 流程模板接口
 */
export interface ProcessTemplateInterface {
  /**
   * 模板ID
   */
  id: string;

  /**
   * 模板名称
   */
  name: string;

  /**
   * 模板描述
   */
  description: string;

  /**
   * 创建流程实例
   * @param parameters 模板参数
   * @returns 流程定义
   */
  createProcess(parameters?: Record<string, any>): any;
}

/**
 * 流程模板类
 * 支持流程模板定义和实例化
 */
export class ProcessTemplate implements ProcessTemplateInterface {
  /** 模板参数默认值 */
  private defaultParameters: Record<string, any> = {};

  /**
   * 构造函数
   * @param id 模板ID
   * @param name 模板名称
   * @param templateFunction 模板函数
   * @param description 模板描述
   */
  constructor(
    public id: string,
    public name: string,
    private templateFunction: (parameters: Record<string, any>) => any,
    public description: string = ''
  ) {}

  /**
   * 设置默认参数
   * @param parameters 默认参数
   */
  public setDefaultParameters(parameters: Record<string, any>): void {
    this.defaultParameters = { ...this.defaultParameters, ...parameters };
  }

  /**
   * 创建流程实例
   * @param parameters 模板参数
   * @returns 流程定义
   */
  public createProcess(parameters: Record<string, any> = {}): any {
    const mergedParameters = { ...this.defaultParameters, ...parameters };
    return this.templateFunction(mergedParameters);
  }
}

/**
 * 流程模板管理器类
 * 管理流程模板的注册和使用
 */
export class ProcessTemplateManager {
  /** 模板集合 */
  private templates: Map<string, ProcessTemplateInterface> = new Map();

  /**
   * 注册模板
   * @param template 模板对象
   */
  public registerTemplate(template: ProcessTemplateInterface): void {
    this.templates.set(template.id, template);
  }

  /**
   * 获取模板
   * @param templateId 模板ID
   * @returns 模板对象
   */
  public getTemplate(templateId: string): ProcessTemplateInterface | undefined {
    return this.templates.get(templateId);
  }

  /**
   * 创建流程实例
   * @param templateId 模板ID
   * @param parameters 模板参数
   * @returns 流程定义
   */
  public createProcess(templateId: string, parameters?: Record<string, any>): any {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template "${templateId}" not found`);
    }
    return template.createProcess(parameters);
  }

  /**
   * 获取所有模板
   * @returns 模板数组
   */
  public getTemplates(): ProcessTemplateInterface[] {
    return Array.from(this.templates.values());
  }

  /**
   * 移除模板
   * @param templateId 模板ID
   */
  public removeTemplate(templateId: string): void {
    this.templates.delete(templateId);
  }

  /**
   * 清除所有模板
   */
  public clear(): void {
    this.templates.clear();
  }
}

import { StartNode, EndNode, TaskNode } from './nodes';
import { DelayNode } from './timer-nodes';
import { LoopNode, ContinueNode } from './loop-nodes';

/**
 * 预定义流程模板
 */
export const PREDEFINED_TEMPLATES = {
  /**
   * 创建延迟流程模板
   */
  createDelayTemplate(): ProcessTemplateInterface {
    return new ProcessTemplate(
      'delay-template',
      '延迟流程模板',
      (parameters) => {
        const { delay = 1000, processId = 'delay-process' } = parameters;
        
        const process = new ProcessDefinition(processId, '延迟流程', 'start');
        process.addNode(new StartNode('start', '开始', 'delay'));
        process.addNode(new DelayNode('delay', '延迟', delay, 'end'));
        process.addNode(new EndNode('end', '结束'));
        
        return process;
      },
      '创建包含延迟节点的流程'
    );
  },

  /**
   * 创建循环流程模板
   */
  createLoopTemplate(): ProcessTemplateInterface {
    return new ProcessTemplate(
      'loop-template',
      '循环流程模板',
      (parameters) => {
        const { iterations = 3, processId = 'loop-process' } = parameters;
        
        const process = new ProcessDefinition(processId, '循环流程', 'start');
        process.addNode(new StartNode('start', '开始', 'loop'));
        
        // 创建循环节点
        process.addNode(new LoopNode(
          'loop',
          '循环',
          (context: any) => (context.counter || 0)< iterations,
          'body',
          'end'
        ));
        
        // 循环体
        process.addNode(new TaskNode(
          'body',
          '循环体',
          (context: any) =>{
            context.counter = (context.counter || 0) + 1;
            return { counter: context.counter };
          },
          'continue'
        ));
        
        // 继续节点
        process.addNode(new ContinueNode('continue', '继续', 'loop'));
        process.addNode(new EndNode('end', '结束'));
        
        return process;
      },
      '创建包含循环节点的流程'
    );
  }
};