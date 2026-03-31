import { describe, it, expect, beforeEach } from 'vitest';
import {
  ProcessEngine,
  ProcessDefinition,
  StartNode,
  EndNode,
  TaskNode,
  DecisionNode,
  ParallelNode,
  SubprocessNode
} from '../../../src/logic/process';

describe('Process Orchestration', () => {
  let processEngine: ProcessEngine;

  beforeEach(() => {
    processEngine = new ProcessEngine();
  });

  describe('Basic Process', () => {
    it('should execute a simple linear process', async () => {
      // 创建流程定义
      const process = new ProcessDefinition('simple-process', 'Simple Process', 'start');
      
      // 添加节点
      process.addNode(new StartNode('start', 'Start', 'task1'));
      process.addNode(new TaskNode('task1', 'Task 1', (context) => {
        context.result = 'task1 completed';
        return context.result;
      }, 'end'));
      process.addNode(new EndNode('end', 'End'));

      // 注册流程
      processEngine.registerProcess(process);

      // 执行流程
      const result = await processEngine.executeProcess('simple-process', { initial: 'value' });

      expect(result).toEqual({
        initial: 'value',
        result: 'task1 completed'
      });
    });

    it('should handle decision nodes', async () => {
      // 创建流程定义
      const process = new ProcessDefinition('decision-process', 'Decision Process', 'start');
      
      // 添加节点
      process.addNode(new StartNode('start', 'Start', 'decision'));
      process.addNode(new DecisionNode('decision', 'Decision', (context) => {
        return context.condition ? 'taskA' : 'taskB';
      }));
      process.addNode(new TaskNode('taskA', 'Task A', (context) => {
        context.path = 'A';
        return 'A';
      }, 'end'));
      process.addNode(new TaskNode('taskB', 'Task B', (context) => {
        context.path = 'B';
        return 'B';
      }, 'end'));
      process.addNode(new EndNode('end', 'End'));

      // 注册流程
      processEngine.registerProcess(process);

      // 测试条件为true的情况
      const resultA = await processEngine.executeProcess('decision-process', { condition: true });
      expect(resultA.path).toBe('A');

      // 测试条件为false的情况
      const resultB = await processEngine.executeProcess('decision-process', { condition: false });
      expect(resultB.path).toBe('B');
    });
  });

  describe('Parallel Process', () => {
    it('should execute parallel branches', async () => {
      // 创建流程定义
      const process = new ProcessDefinition('parallel-process', 'Parallel Process', 'start');
      
      // 添加节点
      process.addNode(new StartNode('start', 'Start', 'parallel'));
      process.addNode(new ParallelNode('parallel', 'Parallel', ['branch1', 'branch2'], 'merge'));
      process.addNode(new TaskNode('branch1', 'Branch 1', (context) => {
        context.branch1 = 'completed';
        return 'branch1';
      }, 'merge'));
      process.addNode(new TaskNode('branch2', 'Branch 2', (context) => {
        context.branch2 = 'completed';
        return 'branch2';
      }, 'merge'));
      process.addNode(new TaskNode('merge', 'Merge', (context) => {
        context.merged = true;
        return 'merged';
      }, 'end'));
      process.addNode(new EndNode('end', 'End'));

      // 注册流程
      processEngine.registerProcess(process);

      // 执行流程
      const result = await processEngine.executeProcess('parallel-process');

      expect(result.branch1).toBe('completed');
      expect(result.branch2).toBe('completed');
      expect(result.merged).toBe(true);
    });
  });

  describe('Subprocess', () => {
    it('should execute subprocess', async () => {
      // 创建子流程
      const subprocess = new ProcessDefinition('subprocess', 'Subprocess', 'sub-start');
      subprocess.addNode(new StartNode('sub-start', 'Sub Start', 'sub-task'));
      subprocess.addNode(new TaskNode('sub-task', 'Sub Task', (context) => {
        context.subprocessExecuted = true;
        return 'subprocess done';
      }, 'sub-end'));
      subprocess.addNode(new EndNode('sub-end', 'Sub End'));

      // 创建主流程
      const mainProcess = new ProcessDefinition('main-process', 'Main Process', 'main-start');
      mainProcess.addNode(new StartNode('main-start', 'Main Start', 'subprocess-node'));
      mainProcess.addNode(new SubprocessNode('subprocess-node', 'Subprocess Node', subprocess, 'main-end'));
      mainProcess.addNode(new EndNode('main-end', 'Main End'));

      // 注册流程
      processEngine.registerProcess(mainProcess);

      // 执行流程
      const result = await processEngine.executeProcess('main-process');

      expect(result.subprocessExecuted).toBe(true);
    });
  });

  describe('Process Instance', () => {
    it('should create and execute process instance', async () => {
      // 创建流程定义
      const process = new ProcessDefinition('instance-process', 'Instance Process', 'start');
      process.addNode(new StartNode('start', 'Start', 'task'));
      process.addNode(new TaskNode('task', 'Task', (context) => {
        context.instanceId = context.instanceId;
        return 'task done';
      }, 'end'));
      process.addNode(new EndNode('end', 'End'));

      // 注册流程
      processEngine.registerProcess(process);

      // 创建实例
      const instance = processEngine.createInstance('instance-process', { test: 'value' });
      
      // 执行实例
      const result = await instance.execute();

      expect(result.test).toBe('value');
      expect(instance.status).toBe('completed');
      expect(instance.getHistory()).toHaveLength(6); // start enter/exit, task enter/exit, end enter/exit
    });

    it('should cancel process execution', async () => {
      // 创建流程定义
      const process = new ProcessDefinition('cancel-process', 'Cancel Process', 'start');
      process.addNode(new StartNode('start', 'Start', 'task'));
      process.addNode(new TaskNode('task', 'Task', async (context) => {
        // 模拟长时间运行的任务
        await new Promise(resolve => setTimeout(resolve, 100));
        context.executed = true;
        return 'task done';
      }, 'end'));
      process.addNode(new EndNode('end', 'End'));

      // 注册流程
      processEngine.registerProcess(process);

      // 创建实例并开始执行
      const instance = processEngine.createInstance('cancel-process');
      const execution = instance.execute();

      // 立即取消
      instance.cancel();

      // 等待执行完成
      await execution.catch(() => {});

      expect(instance.status).toBe('cancelled');
    });
  });

  describe('Error Handling', () => {
    it('should handle task execution errors', async () => {
      // 创建流程定义
      const process = new ProcessDefinition('error-process', 'Error Process', 'start');
      process.addNode(new StartNode('start', 'Start', 'error-task'));
      process.addNode(new TaskNode('error-task', 'Error Task', () => {
        throw new Error('Task failed');
      }, 'end'));
      process.addNode(new EndNode('end', 'End'));

      // 注册流程
      processEngine.registerProcess(process);

      // 执行流程应该抛出错误
      await expect(processEngine.executeProcess('error-process')).rejects.toThrow('Task failed');
    });

    it('should validate process definition', () => {
      // 创建没有开始节点的流程
      const invalidProcess = new ProcessDefinition('invalid-process', 'Invalid Process', 'nonexistent');
      
      // 添加节点
      invalidProcess.addNode(new EndNode('end', 'End'));

      // 注册应该抛出错误
      expect(() => processEngine.registerProcess(invalidProcess)).toThrow('Start node "nonexistent" not found');
    });
  });

  describe('Process Engine Management', () => {
    it('should manage processes and instances', () => {
      // 创建流程定义
      const process1 = new ProcessDefinition('process1', 'Process 1', 'start1');
      process1.addNode(new StartNode('start1', 'Start 1', 'end1'));
      process1.addNode(new EndNode('end1', 'End 1'));

      const process2 = new ProcessDefinition('process2', 'Process 2', 'start2');
      process2.addNode(new StartNode('start2', 'Start 2', 'end2'));
      process2.addNode(new EndNode('end2', 'End 2'));

      // 注册流程
      processEngine.registerProcess(process1);
      processEngine.registerProcess(process2);

      // 验证流程注册
      expect(processEngine.getProcesses()).toHaveLength(2);
      expect(processEngine.getProcess('process1')).toBeDefined();
      expect(processEngine.getProcess('process2')).toBeDefined();

      // 创建实例
      const instance1 = processEngine.createInstance('process1');
      const instance2 = processEngine.createInstance('process2');

      // 验证实例创建
      expect(processEngine.getInstances()).toHaveLength(2);
      expect(processEngine.getInstance(instance1.id)).toBeDefined();
      expect(processEngine.getInstance(instance2.id)).toBeDefined();

      // 移除流程
      processEngine.removeProcess('process1');

      // 验证流程和实例移除
      expect(processEngine.getProcesses()).toHaveLength(1);
      expect(processEngine.getInstances()).toHaveLength(1);
      expect(processEngine.getProcess('process1')).toBeUndefined();
      expect(processEngine.getInstance(instance1.id)).toBeUndefined();
    });
  });
});