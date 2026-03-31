# 流程编排模块

流程编排模块提供了强大的流程定义和执行功能，支持多种节点类型、定时器、循环和模板复用机制。

## 安装

```bash
pnpm add graphic-logic
```

## 核心组件

### 流程定义（ProcessDefinition）
用于定义流程的结构和节点。

### 流程实例（ProcessInstance）
流程的运行时实例，保存流程状态。

### 流程引擎（ProcessEngine）
执行流程的核心引擎，负责节点的调度和执行。

### 节点类型
- **基础节点**：StartNode、EndNode、TaskNode
- **定时器节点**：TimerNode、DelayNode、CronNode
- **循环节点**：LoopNode、ContinueNode、ForEachNode、ForEachContinueNode

### 流程模板
- **ProcessTemplate**：参数化的流程模板
- **ProcessTemplateManager**：模板管理器

## 基本用法

### 创建简单流程

```typescript
import { 
  ProcessDefinition, 
  ProcessInstance, 
  ProcessEngine,
  StartNode,
  EndNode,
  TaskNode
} from 'graphic-logic';

// 创建流程定义
const processDefinition = new ProcessDefinition('simple-process', 'Simple Process', 'start');

// 添加节点
processDefinition.addNode(new StartNode('start', 'Start', 'task1'));
processDefinition.addNode(new TaskNode('task1', 'Task 1', 'end'));
processDefinition.addNode(new EndNode('end', 'End'));

// 创建流程实例
const processInstance = new ProcessInstance(processDefinition);

// 创建流程引擎
const engine = new ProcessEngine();

// 执行流程
const result = await engine.execute(processInstance);
console.log('流程执行结果:', result);
```

### 使用定时器节点

```typescript
import { 
  ProcessDefinition, 
  ProcessInstance, 
  ProcessEngine,
  StartNode,
  EndNode,
  TimerNode,
  DelayNode,
  CronNode
} from 'graphic-logic';

// 创建包含定时器的流程
const processDefinition = new ProcessDefinition('timer-process', 'Timer Process', 'start');

// 添加节点
processDefinition.addNode(new StartNode('start', 'Start', 'timer'));
processDefinition.addNode(new TimerNode('timer', 'Timer', 1000, 'delay'));
processDefinition.addNode(new DelayNode('delay', 'Delay', 2000, 'end'));
processDefinition.addNode(new EndNode('end', 'End'));

// 执行流程
const processInstance = new ProcessInstance(processDefinition);
const engine = new ProcessEngine();
await engine.execute(processInstance);
```

### 使用循环节点

```typescript
import { 
  ProcessDefinition, 
  ProcessInstance, 
  ProcessEngine,
  StartNode,
  EndNode,
  TaskNode,
  LoopNode,
  ContinueNode
} from 'graphic-logic';

// 创建循环流程
const processDefinition = new ProcessDefinition('loop-process', 'Loop Process', 'start');

// 添加节点
processDefinition.addNode(new StartNode('start', 'Start', 'loop'));
processDefinition.addNode(new LoopNode('loop', 'Loop', 'counter < 5', 'task', 'end'));
processDefinition.addNode(new TaskNode('task', 'Task', 'continue'));
processDefinition.addNode(new ContinueNode('continue', 'Continue', 'loop'));
processDefinition.addNode(new EndNode('end', 'End'));

// 执行流程
const processInstance = new ProcessInstance(processDefinition, { counter: 0 });
const engine = new ProcessEngine();
await engine.execute(processInstance);
```

### 使用ForEach节点

```typescript
import { 
  ProcessDefinition, 
  ProcessInstance, 
  ProcessEngine,
  StartNode,
  EndNode,
  TaskNode,
  ForEachNode,
  ForEachContinueNode
} from 'graphic-logic';

// 创建ForEach流程
const processDefinition = new ProcessDefinition('foreach-process', 'ForEach Process', 'start');

// 添加节点
processDefinition.addNode(new StartNode('start', 'Start', 'foreach'));
processDefinition.addNode(new ForEachNode('foreach', 'ForEach', 'items', 'currentItem', 'task', 'end'));
processDefinition.addNode(new TaskNode('task', 'Process Item', 'continue'));
processDefinition.addNode(new ForEachContinueNode('continue', 'Continue', 'foreach'));
processDefinition.addNode(new EndNode('end', 'End'));

// 执行流程
const processInstance = new ProcessInstance(processDefinition, { 
  items: ['item1', 'item2', 'item3'] 
});
const engine = new ProcessEngine();
await engine.execute(processInstance);
```

## 流程模板

### 创建和使用模板

```typescript
import { 
  ProcessDefinition,
  ProcessTemplate,
  ProcessTemplateManager,
  StartNode,
  EndNode,
  TaskNode
} from 'graphic-logic';

// 创建模板
const template = new ProcessTemplate('hello-world', 'Hello World Template', (params) => {
  const process = new ProcessDefinition('hello-process', 'Hello Process', 'start');
  process.addNode(new StartNode('start', 'Start', 'greet'));
  process.addNode(new TaskNode('greet', `Greet ${params.name}`, 'end'));
  process.addNode(new EndNode('end', 'End'));
  return process;
}, 'A simple hello world template');

// 设置默认参数
template.setDefaultParameters({ name: 'World' });

// 创建模板管理器
const templateManager = new ProcessTemplateManager();
templateManager.registerTemplate(template);

// 使用模板创建流程
const processDefinition = templateManager.createProcess('hello-world', { name: 'User' });

// 执行流程
const processInstance = new ProcessInstance(processDefinition);
const engine = new ProcessEngine();
await engine.execute(processInstance);
```

### 模板管理

```typescript
import { ProcessTemplateManager } from 'graphic-logic';

const templateManager = new ProcessTemplateManager();

// 获取所有模板
const templates = templateManager.getTemplates();
console.log('Available templates:', templates.map(t => t.name));

// 获取特定模板
const template = templateManager.getTemplate('hello-world');

// 检查模板是否存在
const exists = templateManager.hasTemplate('hello-world');

// 卸载模板
templateManager.unregisterTemplate('hello-world');
```

## 高级用法

### 组合流程

```typescript
import { 
  ProcessDefinition, 
  ProcessInstance, 
  ProcessEngine,
  StartNode,
  EndNode,
  TaskNode,
  TimerNode,
  LoopNode,
  ContinueNode
} from 'graphic-logic';

// 创建复杂流程
const processDefinition = new ProcessDefinition('complex-process', 'Complex Process', 'start');

// 添加节点
processDefinition.addNode(new StartNode('start', 'Start', 'timer'));
processDefinition.addNode(new TimerNode('timer', 'Wait for 1 second', 1000, 'loop'));
processDefinition.addNode(new LoopNode('loop', 'Loop 3 times', 'count < 3', 'task', 'end'));
processDefinition.addNode(new TaskNode('task', 'Process task', 'continue'));
processDefinition.addNode(new ContinueNode('continue', 'Continue loop', 'loop'));
processDefinition.addNode(new EndNode('end', 'End'));

// 执行流程
const processInstance = new ProcessInstance(processDefinition, { count: 0 });
const engine = new ProcessEngine();
await engine.execute(processInstance);
```

### 上下文管理

```typescript
import { 
  ProcessDefinition, 
  ProcessInstance, 
  ProcessEngine,
  StartNode,
  EndNode,
  TaskNode
} from 'graphic-logic';

// 创建流程
const processDefinition = new ProcessDefinition('context-process', 'Context Process', 'start');
processDefinition.addNode(new StartNode('start', 'Start', 'task1'));
processDefinition.addNode(new TaskNode('task1', 'Task 1', 'task2'));
processDefinition.addNode(new TaskNode('task2', 'Task 2', 'end'));
processDefinition.addNode(new EndNode('end', 'End'));

// 自定义TaskNode实现
class CustomTaskNode extends TaskNode {
  public execute(context: any): any {
    // 修改上下文
    context[this.id] = 'completed';
    context.counter = (context.counter || 0) + 1;
    return { task: this.id, status: 'completed' };
  }
}

// 添加自定义节点
processDefinition.addNode(new CustomTaskNode('task1', 'Custom Task 1', 'task2'));
processDefinition.addNode(new CustomTaskNode('task2', 'Custom Task 2', 'end'));

// 执行流程
const processInstance = new ProcessInstance(processDefinition, { initial: 'value' });
const engine = new ProcessEngine();
const result = await engine.execute(processInstance);

console.log('Final context:', processInstance.getContext());
```

## 平台兼容性

流程编排模块是完全平台无关的，可以在以下环境中使用：

- ✅ **浏览器** - 原生支持
- ✅ **Node.js** - 原生支持
- ✅ **Cocos Creator** - 完全兼容
- ✅ **Unity** - 通过JavaScript支持
- ✅ **Web Worker** - 原生支持

## 注意事项

1. **异步执行** - 流程引擎支持异步节点执行，使用Promise处理
2. **错误处理** - 节点执行出错时会抛出异常，需要适当处理
3. **内存管理** - 长时间运行的流程需要注意内存使用
4. **定时器清理** - 使用定时器节点时，确保在不需要时清理定时器
5. **上下文隔离** - 每个流程实例有独立的上下文，不会相互影响

## 性能优化

1. **避免深度嵌套** - 过深的流程嵌套可能影响性能
2. **合理使用循环** - 避免无限循环，设置合理的循环条件
3. **复用模板** - 使用流程模板减少重复代码
4. **异步优化** - 异步节点执行时避免阻塞主线程

## 调试技巧

1. **查看流程状态** - 使用`processInstance.getStatus()`查看当前状态
2. **检查节点执行** - 监听节点执行事件（如果支持）
3. **日志记录** - 在关键节点添加日志记录
4. **上下文检查** - 定期检查流程上下文状态

## 扩展建议

1. **自定义节点** - 继承BaseProcessNode创建自定义节点类型
2. **事件系统** - 添加事件监听机制
3. **持久化** - 实现流程状态的持久化存储
4. **可视化** - 集成可视化工具展示流程执行状态

## 完整示例

```typescript
import { 
  ProcessDefinition, 
  ProcessInstance, 
  ProcessEngine,
  StartNode,
  EndNode,
  TaskNode,
  TimerNode,
  LoopNode,
  ContinueNode,
  ProcessTemplate,
  ProcessTemplateManager
} from 'graphic-logic';

// 创建流程模板
const template = new ProcessTemplate('workflow-template', 'Workflow Template', (params) => {
  const process = new ProcessDefinition('workflow', 'Workflow', 'start');
  
  process.addNode(new StartNode('start', 'Start', 'timer'));
  process.addNode(new TimerNode('timer', 'Wait', params.delay || 1000, 'loop'));
  process.addNode(new LoopNode('loop', 'Loop', `counter < ${params.iterations || 5}`, 'task', 'end'));
  process.addNode(new TaskNode('task', 'Process', 'continue'));
  process.addNode(new ContinueNode('continue', 'Continue', 'loop'));
  process.addNode(new EndNode('end', 'End'));
  
  return process;
});

// 使用模板
const templateManager = new ProcessTemplateManager();
templateManager.registerTemplate(template);

const processDefinition = templateManager.createProcess('workflow-template', {
  delay: 500,
  iterations: 3
});

// 执行流程
const processInstance = new ProcessInstance(processDefinition, { counter: 0 });
const engine = new ProcessEngine();

try {
  const result = await engine.execute(processInstance);
  console.log('流程执行成功:', result);
  console.log('最终上下文:', processInstance.getContext());
} catch (error) {
  console.error('流程执行失败:', error);
}
```