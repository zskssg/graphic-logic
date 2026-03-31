import { describe, it, expect, beforeEach } from 'vitest';
import {
  ProcessEngine,
  ProcessDefinition,
  StartNode,
  EndNode,
  TaskNode,
  TimerNode,
  DelayNode,
  CronNode,
  LoopNode,
  ContinueNode,
  ForEachNode,
  ForEachContinueNode,
  ProcessTemplateManager,
  ProcessTemplate,
  PREDEFINED_TEMPLATES
} from '../../../src/logic/process';

describe('Extended Process Features', () => {
  let processEngine: ProcessEngine;

  beforeEach(() => {
    processEngine = new ProcessEngine();
  });

  describe('Timer and Delay Nodes', () => {
    it('should execute TimerNode with delay', async () => {
      // 创建流程定义
      const process = new ProcessDefinition('timer-process', 'Timer Process', 'start');
      
      // 添加节点
      process.addNode(new StartNode('start', 'Start', 'timer'));
      process.addNode(new TimerNode('timer', 'Timer', 100, 'end'));
      process.addNode(new EndNode('end', 'End'));

      // 注册流程
      processEngine.registerProcess(process);

      // 执行流程
      const result = await processEngine.executeProcess('timer-process');

      expect(result).toBeDefined();
    });

    it('should execute DelayNode with specified duration', async () => {
      // 创建流程定义
      const process = new ProcessDefinition('delay-process', 'Delay Process', 'start');
      
      // 添加节点
      process.addNode(new StartNode('start', 'Start', 'delay'));
      process.addNode(new DelayNode('delay', 'Delay', 50, 'end'));
      process.addNode(new EndNode('end', 'End'));

      // 注册流程
      processEngine.registerProcess(process);

      // 执行流程
      const result = await processEngine.executeProcess('delay-process');

      expect(result).toBeDefined();
    });

    it('should execute CronNode', async () => {
      // 创建流程定义
      const process = new ProcessDefinition('cron-process', 'Cron Process', 'start');
      
      // 添加节点
      process.addNode(new StartNode('start', 'Start', 'cron'));
      process.addNode(new CronNode('cron', 'Cron', '0 * * * *', 'end'));
      process.addNode(new EndNode('end', 'End'));

      // 注册流程
      processEngine.registerProcess(process);

      // 执行流程
      const result = await processEngine.executeProcess('cron-process');

      expect(result).toBeDefined();
    });
  });

  describe('Loop and Iteration', () => {
    it('should execute LoopNode with condition', async () => {
      // 创建流程定义
      const process = new ProcessDefinition('loop-process', 'Loop Process', 'start');
      
      // 添加节点
      process.addNode(new StartNode('start', 'Start', 'loop'));
      
      // 创建循环节点
      process.addNode(new LoopNode(
        'loop',
        'Loop',
        (context) => (context.counter || 0)< 3,
        'body',
        'end'
      ));
      
      // 循环体
      process.addNode(new TaskNode(
        'body',
        'Loop Body',
        (context) =>{
          context.counter = (context.counter || 0) + 1;
          return { counter: context.counter };
        },
        'continue'
      ));
      
      // 继续节点
      process.addNode(new ContinueNode('continue', 'Continue', 'loop'));
      process.addNode(new EndNode('end', 'End'));

      // 注册流程
      processEngine.registerProcess(process);

      // 执行流程
      const result = await processEngine.executeProcess('loop-process');

      expect(result.counter).toBe(3);
    });

    it('should execute ForEachNode to iterate collection', async () => {
      // 创建流程定义
      const process = new ProcessDefinition('foreach-process', 'ForEach Process', 'start');
      
      // 添加节点
      process.addNode(new StartNode('start', 'Start', 'foreach'));
      
      // 创建ForEach节点
      process.addNode(new ForEachNode(
        'foreach',
        'ForEach',
        'items',
        'currentItem',
        'body',
        'end'
      ));
      
      // 循环体
      process.addNode(new TaskNode(
        'body',
        'ForEach Body',
        (context) => {
          if (!context.processedItems) {
            context.processedItems = [];
          }
          context.processedItems.push(context.currentItem);
          return { item: context.currentItem };
        },
        'continue'
      ));
      
      // ForEach继续节点
      process.addNode(new ForEachContinueNode('continue', 'ForEach Continue', 'foreach'));
      process.addNode(new EndNode('end', 'End'));

      // 注册流程
      processEngine.registerProcess(process);

      // 执行流程
      const result = await processEngine.executeProcess('foreach-process', {
        items: ['item1', 'item2', 'item3']
      });

      expect(result.processedItems).toEqual(['item1', 'item2', 'item3']);
    });

    it('should handle empty collection in ForEachNode', async () => {
      // 创建流程定义
      const process = new ProcessDefinition('empty-foreach-process', 'Empty ForEach Process', 'start');
      
      // 添加节点
      process.addNode(new StartNode('start', 'Start', 'foreach'));
      process.addNode(new ForEachNode('foreach', 'ForEach', 'items', 'currentItem', 'body', 'end'));
      process.addNode(new TaskNode('body', 'Body', () => {}, 'continue'));
      process.addNode(new ForEachContinueNode('continue', 'Continue', 'foreach'));
      process.addNode(new EndNode('end', 'End'));

      // 注册流程
      processEngine.registerProcess(process);

      // 执行流程（空集合）
      const result = await processEngine.executeProcess('empty-foreach-process', {
        items: []
      });

      expect(result.processedItems).toBeUndefined();
    });
  });

  describe('Process Templates', () => {
    let templateManager: ProcessTemplateManager;

    beforeEach(() => {
      templateManager = new ProcessTemplateManager();
    });

    it('should create process from template', () => {
      // 创建自定义模板
      const template = new ProcessTemplate(
        'custom-template',
        'Custom Template',
        (parameters) => {
          const { name = 'Default Process', delay = 1000 } = parameters;
          
          const process = new ProcessDefinition(`process-${Date.now()}`, name, 'start');
          process.addNode(new StartNode('start', 'Start', 'task'));
          process.addNode(new TaskNode('task', 'Task', () => ({ delay }), 'end'));
          process.addNode(new EndNode('end', 'End'));
          
          return process;
        },
        'A custom process template'
      );

      // 注册模板
      templateManager.registerTemplate(template);

      // 创建流程实例
      const process = templateManager.createProcess('custom-template', {
        name: 'My Custom Process',
        delay: 500
      });

      expect(process.name).toBe('My Custom Process');
      expect(process.id).toMatch(/^process-/);
    });

    it('should use default parameters when none provided', () => {
      // 创建带默认参数的模板
      const template = new ProcessTemplate(
        'default-template',
        'Default Template',
        (parameters) => {
          const { count = 5, message = 'Hello' } = parameters;
          
          const process = new ProcessDefinition('default-process', 'Default Process', 'start');
          process.addNode(new StartNode('start', 'Start', 'task'));
          process.addNode(new TaskNode('task', 'Task', () => ({ count, message }), 'end'));
          process.addNode(new EndNode('end', 'End'));
          
          return process;
        },
        'Template with default parameters'
      );

      // 设置默认参数
      template.setDefaultParameters({ count: 10 });

      // 注册模板
      templateManager.registerTemplate(template);

      // 创建流程实例（不提供参数）
      const process = templateManager.createProcess('default-template');

      // 执行流程
      processEngine.registerProcess(process);
      const result = processEngine.executeProcess(process.id);

      expect(result).resolves.toBeDefined();
    });

    it('should use predefined templates', () => {
      // 获取预定义模板
      const delayTemplate = PREDEFINED_TEMPLATES.createDelayTemplate();
      const loopTemplate = PREDEFINED_TEMPLATES.createLoopTemplate();

      // 注册预定义模板
      templateManager.registerTemplate(delayTemplate);
      templateManager.registerTemplate(loopTemplate);

      // 创建流程实例
      const delayProcess = templateManager.createProcess('delay-template', { delay: 2000 });
      const loopProcess = templateManager.createProcess('loop-template', { iterations: 5 });

      expect(delayProcess.name).toBe('延迟流程');
      expect(loopProcess.name).toBe('循环流程');
    });

    it('should manage templates', () => {
      // 创建模板
      const template1 = new ProcessTemplate('template1', 'Template 1', () => {
        const process = new ProcessDefinition('process1', 'Process 1', 'start');
        process.addNode(new StartNode('start', 'Start', 'end'));
        process.addNode(new EndNode('end', 'End'));
        return process;
      }, '');

      const template2 = new ProcessTemplate('template2', 'Template 2', () => {
        const process = new ProcessDefinition('process2', 'Process 2', 'start');
        process.addNode(new StartNode('start', 'Start', 'end'));
        process.addNode(new EndNode('end', 'End'));
        return process;
      }, '');

      // 注册模板
      templateManager.registerTemplate(template1);
      templateManager.registerTemplate(template2);

      // 验证模板注册
      expect(templateManager.getTemplates()).toHaveLength(2);
      expect(templateManager.getTemplate('template1')).toBe(template1);
      expect(templateManager.getTemplate('template2')).toBe(template2);

      // 移除模板
      templateManager.removeTemplate('template1');
      expect(templateManager.getTemplates()).toHaveLength(1);
      expect(templateManager.getTemplate('template1')).toBeUndefined();

      // 清除所有模板
      templateManager.clear();
      expect(templateManager.getTemplates()).toHaveLength(0);
    });

    it('should throw error when template not found', () => {
      expect(() => templateManager.createProcess('non-existent-template')).toThrowError();
    });
  });

  describe('Combined Features', () => {
    it('should combine timer and loop', async () => {
      // 创建流程定义
      const process = new ProcessDefinition('timer-loop-process', 'Timer Loop Process', 'start');
      
      // 添加节点
      process.addNode(new StartNode('start', 'Start', 'loop'));
      
      // 创建循环节点
      process.addNode(new LoopNode(
        'loop',
        'Loop',
        (context: any) => (context.counter || 0)< 2,
        'timer',
        'end'
      ));
      
      // 定时器节点
      process.addNode(new TimerNode('timer', 'Timer', 10, 'increment'));
      
      // 递增计数器
      process.addNode(new TaskNode(
        'increment',
        'Increment',
        (context: any) =>{
          context.counter = (context.counter || 0) + 1;
          return { counter: context.counter };
        },
        'continue'
      ));
      
      // 继续节点
      process.addNode(new ContinueNode('continue', 'Continue', 'loop'));
      process.addNode(new EndNode('end', 'End'));

      // 注册流程
      processEngine.registerProcess(process);

      // 执行流程
      const result = await processEngine.executeProcess('timer-loop-process');

      expect(result.counter).toBe(2);
    });

    it('should combine ForEach and delay', async () => {
      // 创建流程定义
      const process = new ProcessDefinition('foreach-delay-process', 'ForEach Delay Process', 'start');
      
      // 添加节点
      process.addNode(new StartNode('start', 'Start', 'foreach'));
      
      // 创建ForEach节点
      process.addNode(new ForEachNode(
        'foreach',
        'ForEach',
        'items',
        'currentItem',
        'delay',
        'end'
      ));
      
      // 延迟节点
      process.addNode(new DelayNode('delay', 'Delay', 5, 'process'));
      
      // 处理项
      process.addNode(new TaskNode(
        'process',
        'Process Item',
        (context: any) => {
          if (!context.results) {
            context.results = [];
          }
          context.results.push(context.currentItem.toUpperCase());
          return { processed: context.currentItem };
        },
        'continue'
      ));
      
      // ForEach继续节点
      process.addNode(new ForEachContinueNode('continue', 'Continue', 'foreach'));
      process.addNode(new EndNode('end', 'End'));

      // 注册流程
      processEngine.registerProcess(process);

      // 执行流程
      const result = await processEngine.executeProcess('foreach-delay-process', {
        items: ['a', 'b', 'c']
      });

      expect(result.results).toEqual(['A', 'B', 'C']);
    });
  });
});