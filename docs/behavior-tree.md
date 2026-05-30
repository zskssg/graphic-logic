# 行为树模块

行为树模块提供了强大的AI决策系统，支持多种节点类型和复杂的行为组合。

## 安装

```bash
pnpm add graphic-logic
```

## 核心概念

### 节点类型
- **组合节点**：包含多个子节点，控制子节点的执行逻辑
- **装饰节点**：修饰单个子节点的行为
- **叶子节点**：执行具体的动作或条件检查

### 节点状态
- `SUCCESS` - 节点执行成功
- `FAILURE` - 节点执行失败  
- `RUNNING` - 节点正在执行
- `ERROR` - 节点执行出错

## 基础用法

### 创建简单行为树

```typescript
import { 
  BehaviorTree,
  SequenceNode,
  ActionNode,
  ConditionNode,
  BehaviorNodeStatus
} from 'graphic-logic';

// 创建行为树
const behaviorTree = new BehaviorTree('simple-tree', 'Simple Behavior Tree');

// 创建节点
const sequence = new SequenceNode('main-sequence');
const checkCondition = new ConditionNode('check-condition', (context) => {
  return context.health > 0;
});
const attack = new ActionNode('attack', (context) => {
  console.log('Attacking!');
  return BehaviorNodeStatus.SUCCESS;
});

// 构建行为树
sequence.addChild(checkCondition);
sequence.addChild(attack);
behaviorTree.setRoot(sequence);

// 执行行为树
const result = behaviorTree.execute({ health: 100 });
console.log('Behavior tree result:', result);
```

### 使用组合节点

#### 序列节点（Sequence）

```typescript
import { SequenceNode, ActionNode, BehaviorNodeStatus } from 'graphic-logic';

const sequence = new SequenceNode('sequence');
sequence.addChild(new ActionNode('action1', () => BehaviorNodeStatus.SUCCESS));
sequence.addChild(new ActionNode('action2', () => BehaviorNodeStatus.SUCCESS));
sequence.addChild(new ActionNode('action3', () => BehaviorNodeStatus.SUCCESS));
```

#### 选择节点（Selector）

```typescript
import { SelectorNode, ActionNode, BehaviorNodeStatus } from 'graphic-logic';

const selector = new SelectorNode('selector');
selector.addChild(new ActionNode('action1', () => BehaviorNodeStatus.FAILURE));
selector.addChild(new ActionNode('action2', () => BehaviorNodeStatus.SUCCESS));
selector.addChild(new ActionNode('action3', () => BehaviorNodeStatus.FAILURE));
```

#### 并行节点（BehaviorParallel）

```typescript
import { BehaviorParallelNode, ActionNode, BehaviorNodeStatus } from 'graphic-logic';

const parallel = new BehaviorParallelNode('parallel', 2); // 需要2个节点成功
parallel.addChild(new ActionNode('action1', () => BehaviorNodeStatus.SUCCESS));
parallel.addChild(new ActionNode('action2', () => BehaviorNodeStatus.SUCCESS));
parallel.addChild(new ActionNode('action3', () => BehaviorNodeStatus.FAILURE));
```

#### 随机节点（Random）

```typescript
import { RandomNode, ActionNode, BehaviorNodeStatus } from 'graphic-logic';

const random = new RandomNode('random');
random.addChild(new ActionNode('action1', () => BehaviorNodeStatus.SUCCESS));
random.addChild(new ActionNode('action2', () => BehaviorNodeStatus.SUCCESS));
random.addChild(new ActionNode('action3', () => BehaviorNodeStatus.SUCCESS));
```

#### 优先级节点（Priority）

```typescript
import { PriorityNode, ActionNode, BehaviorNodeStatus } from 'graphic-logic';

const priority = new PriorityNode('priority');
priority.addChild(new ActionNode('high-priority', () => BehaviorNodeStatus.FAILURE));
priority.addChild(new ActionNode('medium-priority', () => BehaviorNodeStatus.SUCCESS));
priority.addChild(new ActionNode('low-priority', () => BehaviorNodeStatus.SUCCESS));
```

#### 加权并行节点（WeightedParallel）

```typescript
import { WeightedParallelNode, ActionNode, BehaviorNodeStatus } from 'graphic-logic';

const weightedParallel = new WeightedParallelNode('weighted-parallel', 5); // 需要总权重达到5
const action1 = new ActionNode('action1', () => BehaviorNodeStatus.SUCCESS);
const action2 = new ActionNode('action2', () => BehaviorNodeStatus.SUCCESS);
const action3 = new ActionNode('action3', () => BehaviorNodeStatus.FAILURE);

weightedParallel.addChild(action1);
weightedParallel.addChild(action2);
weightedParallel.addChild(action3);

// 设置权重
weightedParallel.setChildWeight('action1', 3);
weightedParallel.setChildWeight('action2', 2);
weightedParallel.setChildWeight('action3', 1);
```

#### 条件并行节点（ConditionalParallel）

```typescript
import { ConditionalParallelNode, ActionNode, BehaviorNodeStatus } from 'graphic-logic';

const conditionalParallel = new ConditionalParallelNode('conditional-parallel');
const attackAction = new ActionNode('attack', () => BehaviorNodeStatus.SUCCESS);
const defendAction = new ActionNode('defend', () => BehaviorNodeStatus.SUCCESS);
const retreatAction = new ActionNode('retreat', () => BehaviorNodeStatus.SUCCESS);

conditionalParallel.addChild(attackAction);
conditionalParallel.addChild(defendAction);
conditionalParallel.addChild(retreatAction);

// 设置条件
conditionalParallel.setChildCondition('attack', (ctx) => ctx.hasTarget && ctx.distance < 5);
conditionalParallel.setChildCondition('defend', (ctx) => ctx.health < 30);
conditionalParallel.setChildCondition('retreat', (ctx) => ctx.health < 10);
```

#### 随机权重节点（RandomWeighted）

```typescript
import { RandomWeightedNode, ActionNode, BehaviorNodeStatus } from 'graphic-logic';

const randomWeighted = new RandomWeightedNode('random-weighted');
const attack = new ActionNode('attack', () => BehaviorNodeStatus.SUCCESS);
const defend = new ActionNode('defend', () => BehaviorNodeStatus.SUCCESS);
const patrol = new ActionNode('patrol', () => BehaviorNodeStatus.SUCCESS);

randomWeighted.addChild(attack);
randomWeighted.addChild(defend);
randomWeighted.addChild(patrol);

// 设置权重（攻击概率60%，防御20%，巡逻20%）
randomWeighted.setChildWeight('attack', 6);
randomWeighted.setChildWeight('defend', 2);
randomWeighted.setChildWeight('patrol', 2);
```

### 使用装饰节点

#### 反转节点（Inverter）

```typescript
import { InverterNode, ActionNode, BehaviorNodeStatus } from 'graphic-logic';

const inverter = new InverterNode('inverter');
const action = new ActionNode('action', () => BehaviorNodeStatus.FAILURE);
inverter.setChild(action);
```

#### 重复节点（Repeater）

```typescript
import { RepeaterNode, ActionNode, BehaviorNodeStatus } from 'graphic-logic';

const repeater = new RepeaterNode('repeater', 3); // 重复3次
const action = new ActionNode('action', () => BehaviorNodeStatus.SUCCESS);
repeater.setChild(action);
```

#### 条件装饰节点（ConditionDecorator）

```typescript
import { ConditionDecoratorNode, ActionNode, BehaviorNodeStatus } from 'graphic-logic';

const conditionDecorator = new ConditionDecoratorNode('condition', (context) => {
  return context.hasAmmo;
});
const action = new ActionNode('shoot', () => {
  console.log('Shooting!');
  return BehaviorNodeStatus.SUCCESS;
});
conditionDecorator.setChild(action);
```

#### 超时节点（Timeout）

```typescript
import { TimeoutNode, ActionNode, BehaviorNodeStatus } from 'graphic-logic';

const timeout = new TimeoutNode('timeout', 5000); // 5秒超时
const action = new ActionNode('long-action', () => BehaviorNodeStatus.RUNNING);
timeout.setChild(action);
```

#### 重试节点（Retry）

```typescript
import { RetryNode, ActionNode, BehaviorNodeStatus } from 'graphic-logic';

const retry = new RetryNode('retry', 3); // 最多重试3次
const action = new ActionNode('action', () => {
  // 模拟失败后成功
  static let attempts = 0;
  attempts++;
  return attempts <= 2 ? BehaviorNodeStatus.FAILURE : BehaviorNodeStatus.SUCCESS;
});
retry.setChild(action);
```

#### 限速节点（RateLimiter）

```typescript
import { RateLimiterNode, ActionNode, BehaviorNodeStatus } from 'graphic-logic';

const rateLimiter = new RateLimiterNode('rate-limiter', 1000); // 每秒最多执行1次
const action = new ActionNode('action', () => {
  console.log('Action executed');
  return BehaviorNodeStatus.SUCCESS;
});
rateLimiter.setChild(action);
```

#### 断路器节点（CircuitBreaker）

```typescript
import { CircuitBreakerNode, ActionNode, BehaviorNodeStatus } from 'graphic-logic';

const circuitBreaker = new CircuitBreakerNode('circuit-breaker', 3, 5000); // 3次失败后断路，5秒后尝试恢复
const action = new ActionNode('action', () => {
  // 模拟服务故障
  return Math.random() > 0.7 ? BehaviorNodeStatus.FAILURE : BehaviorNodeStatus.SUCCESS;
});
circuitBreaker.setChild(action);
```

#### 延迟重试节点（DelayedRetry）

```typescript
import { DelayedRetryNode, ActionNode, BehaviorNodeStatus } from 'graphic-logic';

const delayedRetry = new DelayedRetryNode('delayed-retry', 3, 1000); // 重试3次，每次间隔1秒
const action = new ActionNode('action', () => {
  // 模拟网络请求
  return Math.random() > 0.5 ? BehaviorNodeStatus.FAILURE : BehaviorNodeStatus.SUCCESS;
});
delayedRetry.setChild(action);
```

#### 计数器节点（Counter）

```typescript
import { CounterNode, ActionNode, BehaviorNodeStatus } from 'graphic-logic';

const counter = new CounterNode('counter');
const action = new ActionNode('action', () => BehaviorNodeStatus.SUCCESS);
counter.setChild(action);

// 使用计数器
const tree = new BehaviorTree('counter-test', 'Counter Test', counter);
const context = {};

for (let i = 0; i< 5; i++) {
  tree.execute(context);
}

console.log('Execution count:', context._counters.counter); // 输出：5
```

### 使用叶子节点

#### 动作节点（Action）

```typescript
import { ActionNode, BehaviorNodeStatus } from 'graphic-logic';

const moveAction = new ActionNode('move', (context) => {
  console.log(`Moving to ${context.target}`);
  context.position = context.target;
  return BehaviorNodeStatus.SUCCESS;
});
```

#### 条件节点（Condition）

```typescript
import { ConditionNode } from 'graphic-logic';

const checkHealth = new ConditionNode('check-health', (context) => {
  return context.health > 20;
});
```

#### 等待节点（Wait）

```typescript
import { WaitNode } from 'graphic-logic';

const waitNode = new WaitNode('wait', 1000); // 等待1秒
```

#### 日志节点（Log）

```typescript
import { LogNode } from 'graphic-logic';

const logNode = new LogNode('log', 'Current position: {position}', 'info');
```

#### 异步节点（Async）

```typescript
import { AsyncNode, BehaviorNodeStatus } from 'graphic-logic';

const asyncNode = new AsyncNode('async', async (context) => {
  // 模拟异步操作
  await new Promise(resolve => setTimeout(resolve, 1000));
  context.data = 'async completed';
  return BehaviorNodeStatus.SUCCESS;
});

// 使用异步节点
const tree = new BehaviorTree('async-test', 'Async Test', asyncNode);

// 第一次执行返回RUNNING
let result = tree.execute({});
console.log(result); // RUNNING

// 等待异步操作完成后再次执行
setTimeout(() => {
  result = tree.execute({});
  console.log(result); // SUCCESS
}, 1500);
```

#### 协程节点（Coroutine）

```typescript
import { CoroutineNode, BehaviorNodeStatus } from 'graphic-logic';

function* coroutineFunction(context: any) {
  context.phase = 'starting';
  yield BehaviorNodeStatus.RUNNING;
  
  context.phase = 'processing';
  yield BehaviorNodeStatus.RUNNING;
  
  context.phase = 'completed';
  return BehaviorNodeStatus.SUCCESS;
}

const coroutineNode = new CoroutineNode('coroutine', coroutineFunction);

// 使用协程节点
const tree = new BehaviorTree('coroutine-test', 'Coroutine Test', coroutineNode);
const context = {};

// 第一次执行
tree.execute(context);
console.log(context.phase); // starting

// 第二次执行
tree.execute(context);
console.log(context.phase); // processing

// 第三次执行
tree.execute(context);
console.log(context.phase); // completed
```

#### 事件节点（Event）

```typescript
import { EventNode } from 'graphic-logic';

const eventNode = new EventNode('event', 'user-click');

// 使用事件节点
const tree = new BehaviorTree('event-test', 'Event Test', eventNode);

// 第一次执行返回RUNNING（等待事件）
let result = tree.execute({});
console.log(result); // RUNNING

// 触发事件
eventNode.trigger({ x: 100, y: 200 });

// 再次执行返回SUCCESS
result = tree.execute({});
console.log(result); // SUCCESS
console.log(context.event); // { name: 'user-click', data: { x: 100, y: 200 } }
```

#### 参数化动作节点（ParameterizedAction）

```typescript
import { ParameterizedActionNode, BehaviorNodeStatus } from 'graphic-logic';

const parameterizedAction = new ParameterizedActionNode(
  'parameterized',
  (context, params) => {
    context.result = params.value * params.multiplier;
    return BehaviorNodeStatus.SUCCESS;
  },
  { value: 10, multiplier: 2 }
);

// 更新参数
parameterizedAction.updateParams({ multiplier: 3 });

// 执行节点
const tree = new BehaviorTree('parameterized-test', 'Parameterized Test', parameterizedAction);
const context = {};
tree.execute(context);
console.log(context.result); // 30
```

#### 动态条件节点（DynamicCondition）

```typescript
import { DynamicConditionNode } from 'graphic-logic';

const dynamicCondition = new DynamicConditionNode(
  'dynamic-condition',
  (context, params) => {
    return context.value > params.threshold;
  },
  { threshold: 100 }
);

// 更新参数
dynamicCondition.updateParams({ threshold: 200 });

// 执行节点
const tree = new BehaviorTree('dynamic-condition-test', 'Dynamic Condition Test', dynamicCondition);

let result = tree.execute({ value: 150 });
console.log(result); // FAILURE (150 < 200)

result = tree.execute({ value: 250 });
console.log(result); // SUCCESS (250 > 200)
```

## 高级用法

### 动态行为树

#### 运行时修改节点

```typescript
import { 
  BehaviorTree,
  SequenceNode,
  ActionNode,
  BehaviorNodeStatus
} from 'graphic-logic';

// 创建动态行为树
const dynamicTree = new BehaviorTree('dynamic', 'Dynamic Behavior Tree');
const root = new SequenceNode('root');

// 动态添加节点
function addDynamicActions(sequence, actions) {
  actions.forEach((action, index) => {
    sequence.addChild(new ActionNode(`action-${index}`, action));
  });
}

// 添加动态动作
addDynamicActions(root, [
  () => { console.log('Action 1'); return BehaviorNodeStatus.SUCCESS; },
  () => { console.log('Action 2'); return BehaviorNodeStatus.SUCCESS; },
  () => { console.log('Action 3'); return BehaviorNodeStatus.SUCCESS; }
]);

dynamicTree.setRoot(root);
dynamicTree.execute({});
```

#### 行为树模板

```typescript
import { 
  BehaviorTree,
  SequenceNode,
  ActionNode,
  ConditionNode,
  BehaviorNodeStatus
} from 'graphic-logic';

// 创建行为树模板工厂
function createAttackBehavior(targetType: string) {
  const attackSequence = new SequenceNode(`attack-${targetType}`);
  
  // 根据目标类型添加不同的条件和动作
  if (targetType === 'melee') {
    attackSequence.addChild(new ConditionNode('in-range', (ctx) => ctx.distance< 2));
    attackSequence.addChild(new ActionNode('melee-attack', (ctx) =>{
      console.log('Performing melee attack!');
      ctx.target.health -= 20;
      return BehaviorNodeStatus.SUCCESS;
    }));
  } else {
    attackSequence.addChild(new ConditionNode('in-range', (ctx) =>ctx.distance< 10));
    attackSequence.addChild(new ActionNode('ranged-attack', (ctx) => {
      console.log('Performing ranged attack!');
      ctx.target.health -= 15;
      ctx.ammo -= 1;
      return BehaviorNodeStatus.SUCCESS;
    }));
  }
  
  return attackSequence;
}

// 使用模板创建不同的攻击行为
const meleeAttack = createAttackBehavior('melee');
const rangedAttack = createAttackBehavior('ranged');

// 组装到主行为树
const mainSelector = new SelectorNode('main');
mainSelector.addChild(meleeAttack);
mainSelector.addChild(rangedAttack);

const tree = new BehaviorTree('combat-ai', 'Combat AI', mainSelector);
```

#### 参数化节点

```typescript
import { 
  BehaviorTree,
  SequenceNode,
  ParameterizedActionNode,
  DynamicConditionNode,
  BehaviorNodeStatus
} from 'graphic-logic';

// 创建参数化行为树
const parameterizedTree = new BehaviorTree('parameterized', 'Parameterized Behavior Tree');
const root = new SequenceNode('root');

// 创建参数化节点
const moveAction = new ParameterizedActionNode(
  'move',
  (context, params) => {
    console.log(`Moving to ${params.target} at speed ${params.speed}`);
    context.position = params.target;
    return BehaviorNodeStatus.SUCCESS;
  },
  { target: { x: 100, y: 200 }, speed: 5 }
);

const healthCondition = new DynamicConditionNode(
  'check-health',
  (context, params) => context.health > params.minHealth,
  { minHealth: 30 }
);

// 组装行为树
root.addChild(healthCondition);
root.addChild(moveAction);
parameterizedTree.setRoot(root);

// 执行时动态更新参数
const context = { health: 50 };
moveAction.updateParams({ target: { x: 150, y: 250 } });
healthCondition.updateParams({ minHealth: 20 });

parameterizedTree.execute(context);
```

#### 动态条件分支

```typescript
import { 
  BehaviorTree,
  SelectorNode,
  SequenceNode,
  ConditionalParallelNode,
  ActionNode,
  ConditionNode,
  BehaviorNodeStatus
} from 'graphic-logic';

// 创建动态条件分支行为树
const dynamicBranchTree = new BehaviorTree('dynamic-branch', 'Dynamic Branch Tree');
const mainSelector = new SelectorNode('main');

// 创建条件并行节点
const conditionalParallel = new ConditionalParallelNode('conditional-parallel');

// 创建各种行为节点
const attackAction = new ActionNode('attack', () => {
  console.log('Attacking!');
  return BehaviorNodeStatus.SUCCESS;
});

const defendAction = new ActionNode('defend', () => {
  console.log('Defending!');
  return BehaviorNodeStatus.SUCCESS;
});

const retreatAction = new ActionNode('retreat', () => {
  console.log('Retreating!');
  return BehaviorNodeStatus.SUCCESS;
});

// 添加节点到条件并行节点
conditionalParallel.addChild(attackAction);
conditionalParallel.addChild(defendAction);
conditionalParallel.addChild(retreatAction);

// 动态设置条件
function updateConditions(context) {
  conditionalParallel.setChildCondition('attack', (ctx) => ctx.hasTarget && ctx.distance< 5);
  conditionalParallel.setChildCondition('defend', (ctx) =>ctx.health< 30);
  conditionalParallel.setChildCondition('retreat', (ctx) =>ctx.health< 10);
}

// 组装行为树
mainSelector.addChild(conditionalParallel);
dynamicBranchTree.setRoot(mainSelector);

// 使用动态条件分支
const gameContext = {
  hasTarget: true,
  distance: 3,
  health: 40
};

// 更新条件并执行
updateConditions(gameContext);
dynamicBranchTree.execute(gameContext); // 执行攻击

// 改变状态
gameContext.health = 25;
updateConditions(gameContext);
dynamicBranchTree.execute(gameContext); // 执行防御

// 再次改变状态
gameContext.health = 5;
updateConditions(gameContext);
dynamicBranchTree.execute(gameContext); // 执行撤退
```

### 复杂行为树示例

```typescript
import { 
  BehaviorTree,
  SequenceNode,
  SelectorNode,
  BehaviorParallelNode,
  InverterNode,
  ConditionNode,
  ActionNode,
  WaitNode,
  BehaviorNodeStatus
} from 'graphic-logic';

// 创建行为树
const aiTree = new BehaviorTree('enemy-ai', 'Enemy AI Behavior');

// 创建主要决策分支
const mainSelector = new SelectorNode('main-selector');

// 攻击分支
const attackSequence = new SequenceNode('attack-sequence');
attackSequence.addChild(new ConditionNode('has-target', (ctx) => ctx.hasTarget));
attackSequence.addChild(new ConditionNode('in-range', (ctx) => ctx.distance< 10));
attackSequence.addChild(new ActionNode('attack', (ctx) =>{
  console.log('Attacking target!');
  ctx.target.health -= 10;
  return BehaviorNodeStatus.SUCCESS;
}));

// 追击分支
const chaseSequence = new SequenceNode('chase-sequence');
chaseSequence.addChild(new ConditionNode('has-target', (ctx) =>ctx.hasTarget));
chaseSequence.addChild(new ConditionNode('not-in-range', (ctx) => ctx.distance >= 10));
chaseSequence.addChild(new ActionNode('move', (ctx) => {
  console.log('Chasing target!');
  ctx.distance -= 1;
  return BehaviorNodeStatus.SUCCESS;
}));

// 巡逻分支
const patrolSequence = new SequenceNode('patrol-sequence');
patrolSequence.addChild(new InverterNode('no-target'));
patrolSequence.addChild(new ActionNode('patrol', (ctx) => {
  console.log('Patrolling area!');
  ctx.position = { x: Math.random() * 100, y: Math.random() * 100 };
  return BehaviorNodeStatus.SUCCESS;
}));
patrolSequence.getChild()?.setChild(new ConditionNode('check-target', (ctx) => !ctx.hasTarget));

// 组装行为树
mainSelector.addChild(attackSequence);
mainSelector.addChild(chaseSequence);
mainSelector.addChild(patrolSequence);

aiTree.setRoot(mainSelector);

// 执行行为树
const context = {
  hasTarget: true,
  distance: 15,
  target: { health: 100 },
  position: { x: 0, y: 0 }
};

const result = aiTree.execute(context);
console.log('AI behavior result:', result);
console.log('Updated context:', context);
```

### 动态行为树

```typescript
import { 
  BehaviorTree,
  SequenceNode,
  ActionNode,
  BehaviorNodeStatus
} from 'graphic-logic';

// 创建动态行为树
const dynamicTree = new BehaviorTree('dynamic', 'Dynamic Behavior Tree');
const root = new SequenceNode('root');

// 动态添加节点
function addDynamicActions(sequence, actions) {
  actions.forEach((action, index) => {
    sequence.addChild(new ActionNode(`action-${index}`, action));
  });
}

// 添加动态动作
addDynamicActions(root, [
  () => { console.log('Action 1'); return BehaviorNodeStatus.SUCCESS; },
  () => { console.log('Action 2'); return BehaviorNodeStatus.SUCCESS; },
  () => { console.log('Action 3'); return BehaviorNodeStatus.SUCCESS; }
]);

dynamicTree.setRoot(root);
dynamicTree.execute({});
```

### 行为树状态管理

```typescript
import { BehaviorTree, ActionNode, BehaviorNodeStatus } from 'graphic-logic';

// 创建行为树
const tree = new BehaviorTree('stateful', 'Stateful Behavior Tree');

// 创建状态节点
let executionCount = 0;
const statefulAction = new ActionNode('stateful-action', (context) => {
  executionCount++;
  context.executionCount = executionCount;
  
  if (executionCount < 3) {
    return BehaviorNodeStatus.RUNNING;
  } else {
    return BehaviorNodeStatus.SUCCESS;
  }
});

tree.setRoot(statefulAction);

// 多次执行
const context = {};
for (let i = 0; i < 5; i++) {
  const result = tree.execute(context);
  console.log(`Execution ${i + 1}:`, result);
}

console.log('Final execution count:', context.executionCount);
```

## 调试和可视化

### 打印行为树结构

```typescript
import { 
  BehaviorTree,
  SequenceNode,
  SelectorNode,
  ActionNode,
  BehaviorNodeStatus
} from 'graphic-logic';

const tree = new BehaviorTree('debug-tree', 'Debug Tree');
const root = new SequenceNode('root');
const selector = new SelectorNode('selector');
const action1 = new ActionNode('action1', () => BehaviorNodeStatus.FAILURE);
const action2 = new ActionNode('action2', () => BehaviorNodeStatus.SUCCESS);

selector.addChild(action1);
selector.addChild(action2);
root.addChild(selector);
tree.setRoot(root);

// 打印树结构
tree.printTree();
```

### 序列化行为树

```typescript
import { 
  BehaviorTree,
  SequenceNode,
  ActionNode,
  BehaviorNodeStatus
} from 'graphic-logic';

const tree = new BehaviorTree('serializable', 'Serializable Tree');
const root = new SequenceNode('root');
root.addChild(new ActionNode('action', () => BehaviorNodeStatus.SUCCESS));
tree.setRoot(root);

// 序列化
const serialized = tree.serialize();
console.log('Serialized tree:', JSON.stringify(serialized, null, 2));
```

## 扩展指南

### 创建自定义节点

```typescript
import { LeafNode, BehaviorNodeStatus } from 'graphic-logic';

/**
 * 自定义动作节点
 */
class CustomActionNode extends LeafNode {
  private customData: any;

  constructor(id: string, name: string, customData: any) {
    super(id, name);
    this.customData = customData;
  }

  public override execute(context: any): BehaviorNodeStatus {
    console.log(`Executing custom action with data:`, this.customData);
    context.customResult = this.customData.value * 2;
    return BehaviorNodeStatus.SUCCESS;
  }
}

// 使用自定义节点
const customAction = new CustomActionNode('custom', 'Custom Action', { value: 42 });
```

### 创建自定义组合节点

```typescript
import { CompositeNode, BehaviorNodeStatus } from 'graphic-logic';

/**
 * 自定义组合节点：优先级序列
 */
class PrioritySequenceNode extends CompositeNode {
  constructor(id: string, name: string = 'PrioritySequence') {
    super(id, name);
  }

  public override execute(context: any): BehaviorNodeStatus {
    for (const child of this.getChildren()) {
      const status = child.execute(context);
      
      if (status === BehaviorNodeStatus.FAILURE) {
        // 失败时立即返回，不继续执行
        this.setStatus(BehaviorNodeStatus.FAILURE);
        return BehaviorNodeStatus.FAILURE;
      }
      
      if (status === BehaviorNodeStatus.RUNNING) {
        this.setStatus(BehaviorNodeStatus.RUNNING);
        return BehaviorNodeStatus.RUNNING;
      }
    }
    
    this.setStatus(BehaviorNodeStatus.SUCCESS);
    return BehaviorNodeStatus.SUCCESS;
  }
}
```

## 性能优化

### 避免深度嵌套

```typescript
// 避免：过深的嵌套结构
// sequence
// ├── selector
// │   ├── sequence
// │   │   └── action
// │   └── action
// └── action

// 推荐：合理的层次结构
// main-sequence
// ├── pre-condition
// ├── behavior-selector
// │   ├── attack-behavior
// │   ├── defend-behavior
// │   └── patrol-behavior
// └── cleanup-action
```

### 使用节点复用

```typescript
import { ActionNode, BehaviorNodeStatus } from 'graphic-logic';

// 创建可复用的动作节点
const commonAction = new ActionNode('common', () => {
  console.log('Common action executed');
  return BehaviorNodeStatus.SUCCESS;
});

// 在多个地方使用同一个节点实例
sequence1.addChild(commonAction);
sequence2.addChild(commonAction);
```

### 优化条件检查

```typescript
import { ConditionNode } from 'graphic-logic';

// 优化前：每次都计算复杂条件
const expensiveCondition = new ConditionNode('expensive', (context) => {
  // 复杂的计算...
  return complexCalculation(context.data);
});

// 优化后：缓存计算结果
let cachedResult: boolean | null = null;
let lastData: any = null;

const optimizedCondition = new ConditionNode('optimized', (context) => {
  if (context.data !== lastData) {
    cachedResult = complexCalculation(context.data);
    lastData = context.data;
  }
  return cachedResult!;
});
```

## 最佳实践

### 1. 保持节点职责单一
每个节点应该只做一件事情，遵循单一职责原则。

### 2. 使用有意义的节点名称
使用描述性的名称，便于理解和调试。

### 3. 合理组织行为树结构
- 使用组合节点组织复杂行为
- 使用装饰节点修改节点行为
- 使用叶子节点执行具体操作

### 4. 维护上下文状态
通过上下文对象传递和共享状态。

### 5. 定期重置行为树
在适当的时候调用`reset()`方法重置节点状态。

### 6. 处理错误情况
在节点执行中添加错误处理逻辑。

## 示例场景

### 游戏AI示例

```typescript
import { 
  BehaviorTree,
  SelectorNode,
  SequenceNode,
  ConditionNode,
  ActionNode,
  WaitNode,
  BehaviorNodeStatus
} from 'graphic-logic';

// 创建游戏AI行为树
const aiTree = new BehaviorTree('game-ai', 'Game AI');

// 主要决策逻辑
const mainSelector = new SelectorNode('main-decision');

// 紧急情况处理
const emergencySequence = new SequenceNode('emergency');
emergencySequence.addChild(new ConditionNode('low-health', (ctx) => ctx.health < 20));
emergencySequence.addChild(new ActionNode('flee', (ctx) => {
  console.log('Fleeing to safety!');
  ctx.position = { x: 100, y: 100 };
  return BehaviorNodeStatus.SUCCESS;
}));

// 攻击逻辑
const attackSequence = new SequenceNode('attack');
attackSequence.addChild(new ConditionNode('has-target', (ctx) => ctx.target !== null));
attackSequence.addChild(new ConditionNode('in-range', (ctx) => ctx.distance < 5));
attackSequence.addChild(new ActionNode('melee-attack', (ctx) => {
  console.log('Performing melee attack!');
  ctx.target.health -= 20;
  return BehaviorNodeStatus.SUCCESS;
}));

// 追击逻辑
const chaseSequence = new SequenceNode('chase');
chaseSequence.addChild(new ConditionNode('has-target', (ctx) => ctx.target !== null));
chaseSequence.addChild(new ConditionNode('out-of-range', (ctx) => ctx.distance >= 5));
chaseSequence.addChild(new ActionNode('move-towards', (ctx) => {
  console.log('Moving towards target!');
  ctx.distance -= 1;
  return BehaviorNodeStatus.SUCCESS;
}));

// 巡逻逻辑
const patrolSequence = new SequenceNode('patrol');
patrolSequence.addChild(new ConditionNode('no-target', (ctx) => ctx.target === null));
patrolSequence.addChild(new ActionNode('patrol-area', (ctx) => {
  console.log('Patrolling area!');
  ctx.position = { 
    x: ctx.position.x + (Math.random() - 0.5) * 2,
    y: ctx.position.y + (Math.random() - 0.5) * 2
  };
  return BehaviorNodeStatus.SUCCESS;
}));
patrolSequence.addChild(new WaitNode('wait', 1000));

// 组装行为树
mainSelector.addChild(emergencySequence);
mainSelector.addChild(attackSequence);
mainSelector.addChild(chaseSequence);
mainSelector.addChild(patrolSequence);

aiTree.setRoot(mainSelector);

// 模拟游戏循环
const gameContext = {
  health: 50,
  position: { x: 0, y: 0 },
  target: { health: 100 },
  distance: 8
};

// 执行行为树
for (let frame = 0; frame < 10; frame++) {
  console.log(`\nFrame ${frame + 1}:`);
  const result = aiTree.execute(gameContext);
  console.log('AI Action:', result);
  console.log('Context:', gameContext);
  
  // 更新游戏状态
  gameContext.distance -= 0.5;
  if (gameContext.target.health <= 0) {
    gameContext.target = null;
  }
}
```

## 平台兼容性

行为树模块是完全平台无关的，可以在以下环境中使用：

- ✅ **浏览器** - 原生支持
- ✅ **Node.js** - 原生支持
- ✅ **Cocos Creator** - 完全兼容
- ✅ **Unity** - 通过JavaScript支持
- ✅ **Web Worker** - 原生支持

## 注意事项

1. **异步执行** - 行为树节点默认是同步执行的，如需异步操作可以返回`RUNNING`状态
2. **状态管理** - 长时间运行的节点需要正确管理状态
3. **性能考虑** - 避免在节点执行中进行复杂计算
4. **错误处理** - 添加适当的错误处理逻辑
5. **内存管理** - 注意清理不再使用的节点

## 性能优化

行为树模块提供了专门的优化工具，可以显著提升性能和内存效率。

### 节点对象池

节点对象池可以直接搭配行为树使用，通过对象池管理节点的创建和复用，显著提升性能。

#### 基础用法

```typescript
import { NodePool } from 'graphic-logic';
import { ActionNode, BehaviorNodeStatus } from 'graphic-logic';

// 创建节点对象池
const actionPool = new NodePool(() => 
  new ActionNode('temp', () => BehaviorNodeStatus.SUCCESS)
);

// 获取节点
const actionNode = actionPool.acquire();

// 使用节点
// ...

// 释放节点回对象池
actionPool.release(actionNode);
```

#### 与行为树集成

```typescript
import { NodePool } from 'graphic-logic';
import { BehaviorTree, ActionNode, SequenceNode, BehaviorNodeStatus } from 'graphic-logic';

// 创建节点对象池
const actionPool = new NodePool(() => new ActionNode('action', () => BehaviorNodeStatus.SUCCESS));
const sequencePool = new NodePool(() => new SequenceNode('sequence'));

// 创建行为树
const tree = new BehaviorTree('optimized-tree', 'Optimized Tree');

// 从对象池获取节点
const sequence = sequencePool.acquire();
const action1 = actionPool.acquire();
const action2 = actionPool.acquire();

// 组装行为树
sequence.addChild(action1);
sequence.addChild(action2);
tree.setRoot(sequence);

// 执行行为树
const result = tree.execute({});

// 使用完毕后释放节点
actionPool.release(action1);
actionPool.release(action2);
sequencePool.release(sequence);
```

#### 高级集成模式

```typescript
import { NodePool } from 'graphic-logic';
import { BehaviorTree, ActionNode, ConditionNode, BehaviorNodeStatus } from 'graphic-logic';

// 创建不同类型节点的对象池
const actionPool = new NodePool(() => new ActionNode('action', () => BehaviorNodeStatus.SUCCESS));
const conditionPool = new NodePool(() => new ConditionNode('condition', () => true));

class OptimizedBehaviorTree extends BehaviorTree {
  private actionPool: NodePool<ActionNode>;
  private conditionPool: NodePool<ConditionNode>;
  
  constructor(id: string, name: string, actionPool: NodePool<ActionNode>, conditionPool: NodePool<ConditionNode>) {
    super(id, name);
    this.actionPool = actionPool;
    this.conditionPool = conditionPool;
  }
  
  // 创建优化的动作节点
  createActionNode(action: () => BehaviorNodeStatus): ActionNode {
    const node = this.actionPool.acquire();
    // 更新节点的动作函数
    // 注意：需要在ActionNode类中添加更新动作的方法
    return node;
  }
  
  // 创建优化的条件节点
  createConditionNode(condition: () => boolean): ConditionNode {
    const node = this.conditionPool.acquire();
    // 更新节点的条件函数
    // 注意：需要在ConditionNode类中添加更新条件的方法
    return node;
  }
  
  // 释放所有节点
  releaseAllNodes(): void {
    // 递归释放所有节点
    this.releaseNode(this.root);
  }
  
  private releaseNode(node: any): void {
    if (node instanceof ActionNode) {
      this.actionPool.release(node);
    } else if (node instanceof ConditionNode) {
      this.conditionPool.release(node);
    }
    
    // 递归处理子节点
    if (node.getChildren) {
      node.getChildren().forEach((child: any) => this.releaseNode(child));
    } else if (node.getChild) {
      const child = node.getChild();
      if (child) this.releaseNode(child);
    }
  }
}

// 使用示例
const optimizedTree = new OptimizedBehaviorTree(
  'optimized',
  'Optimized Tree',
  actionPool,
  conditionPool
);

const action = optimizedTree.createActionNode(() => BehaviorNodeStatus.SUCCESS);
optimizedTree.setRoot(action);

// 使用完毕后释放资源
optimizedTree.releaseAllNodes();
```

#### 对象池配置建议

**初始池大小**：根据预期的并发节点数量设置
**最大池大小**：防止内存过度占用
**超时清理**：定期清理长时间未使用的节点

```typescript
// 高级对象池配置（需要扩展NodePool类）
class AdvancedNodePool<T extends BaseBehaviorNode> extends NodePool<T> {
  constructor(factory: () => T, initialSize: number = 10, maxSize: number = 100) {
    super(factory);
    // 预创建初始节点
    for (let i = 0; i< initialSize; i++) {
      this.release(this.acquire());
    }
    this.maxSize = maxSize;
  }
  
  override release(node: T): void {
    if (this.getSize() >= this.maxSize) {
      // 超过最大大小，不回收
      return;
    }
    super.release(node);
  }
}
```

### 上下文对象复用

```typescript
import { ContextPool } from 'graphic-logic';

// 创建上下文对象池
const contextPool = new ContextPool();

// 获取上下文
const context = contextPool.acquire();

// 使用上下文
context.health = 100;
context.position = { x: 0, y: 0 };

// 释放上下文回对象池
contextPool.release(context);
```

### 带缓存的条件节点

```typescript
import { CachedConditionNode } from 'graphic-logic';

// 创建带缓存的条件节点
const cachedCondition = new CachedConditionNode(
  'health-check',
  (context) => context.health > 30,
  'health-cache'
);

// 第一次执行会计算条件
cachedCondition.execute({ health: 50 }); // SUCCESS

// 第二次执行相同上下文会使用缓存
cachedCondition.execute({ health: 50 }); // SUCCESS (使用缓存)
```

### 批处理执行器

```typescript
import { BehaviorTreeBatchExecutor } from 'graphic-logic';
import { BehaviorTree, ActionNode, BehaviorNodeStatus } from 'graphic-logic';

// 创建批处理执行器
const executor = new BehaviorTreeBatchExecutor();

// 创建多个行为树
const tree1 = new BehaviorTree('tree1', 'Tree 1');
const tree2 = new BehaviorTree('tree2', 'Tree 2');

const action1 = new ActionNode('action1', () => BehaviorNodeStatus.SUCCESS);
const action2 = new ActionNode('action2', () => BehaviorNodeStatus.FAILURE);

tree1.setRoot(action1);
tree2.setRoot(action2);

// 添加到执行器
executor.addTree(tree1, {});
executor.addTree(tree2, {});

// 批量执行所有行为树
const results = executor.executeAll();
console.log('Tree 1 result:', results.get(tree1));
console.log('Tree 2 result:', results.get(tree2));
```

### 带优先级的行为树

```typescript
import { PrioritizedBehaviorTree } from 'graphic-logic';
import { ActionNode, BehaviorNodeStatus } from 'graphic-logic';

// 创建带优先级的行为树
const tree = new PrioritizedBehaviorTree('prioritized', 'Prioritized Tree');

// 创建不同优先级的节点
const highPriorityAction = new ActionNode('high', () => BehaviorNodeStatus.SUCCESS);
const lowPriorityAction = new ActionNode('low', () => BehaviorNodeStatus.FAILURE);

// 设置节点优先级
tree.setNodePriority('high', 10);
tree.setNodePriority('low', 1);

// 添加节点到行为树
tree.setRoot(highPriorityAction);

// 执行行为树（会优先执行高优先级节点）
const result = tree.execute({});
```

### 性能监控

```typescript
import { PerformanceMonitor, BehaviorTreeOptimizer } from 'graphic-logic';
import { BehaviorTree, ActionNode, BehaviorNodeStatus } from 'graphic-logic';

// 创建性能监控器
const monitor = new PerformanceMonitor();

// 创建行为树
const tree = new BehaviorTree('monitored', 'Monitored Tree');
const action = new ActionNode('action', () => {
  // 模拟耗时操作
  let sum = 0;
  for (let i = 0; i< 1000; i++) {
    sum += i;
  }
  return BehaviorNodeStatus.SUCCESS;
});

tree.setRoot(action);

// 优化行为树（添加性能监控）
BehaviorTreeOptimizer.optimize(tree, monitor);

// 执行行为树
tree.execute({});

// 生成性能报告
const report = monitor.generateReport();
console.log('Performance Report:', report);
```

## 优化最佳实践

### 1. 对象池使用场景
- 频繁创建和销毁的节点类型
- 游戏循环中反复使用的临时节点
- 大量相似节点的场景

### 2. 缓存策略
- 条件计算成本高的场景
- 相同上下文频繁调用的场景
- 结果相对稳定的条件判断

### 3. 优先级设置
- 关键行为设置高优先级
- 资源密集型操作设置低优先级
- 根据业务重要性调整优先级

### 4. 性能监控
- 开发阶段监控性能瓶颈
- 生产环境选择性开启监控
- 定期分析性能报告优化热点

## 总结

行为树模块提供了灵活、可扩展的AI决策系统，适用于游戏AI、机器人控制、工作流管理等多种场景。通过组合不同类型的节点，可以构建复杂的行为逻辑，实现智能决策和行为控制。结合优化工具，可以在保持功能完整的同时显著提升性能和内存效率。