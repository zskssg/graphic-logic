# 状态机使用指南

状态机模块提供了强大的状态管理功能，支持基础状态机、分层状态机和下推状态机三种模式。

## 基础状态机

基础状态机是最常用的状态管理模式，支持状态转换、条件判断和生命周期管理。

### 基本用法

```typescript
import { 
  BaseStateMachine, 
  StateInterface,
  AlwaysTrueCondition,
  TimeCondition
} from 'graphic-logic';

// 定义状态类
class GameState implements StateInterface {
  constructor(public name: string) {}
  
  enter(context: any) {
    console.log(`进入${this.name}状态`);
  }
  
  update(context: any, deltaTime: number) {
    console.log(`更新${this.name}状态`);
  }
  
  exit(context: any) {
    console.log(`退出${this.name}状态`);
  }
}

// 创建状态机
const stateMachine = new BaseStateMachine({ gameScore: 0 });

// 添加状态
stateMachine.addState(new GameState('Idle'));
stateMachine.addState(new GameState('Running'));
stateMachine.addState(new GameState('Jumping'));

// 添加转换
stateMachine.addTransition({
  from: 'Idle',
  to: 'Running',
  condition: new AlwaysTrueCondition(),
  action: (context) => console.log('开始奔跑！')
});

stateMachine.addTransition({
  from: 'Running',
  to: 'Jumping',
  condition: new TimeCondition(2000), // 2秒后自动跳
  action: (context) => console.log('跳跃！')
});

// 初始化和更新
stateMachine.initialize('Idle');
stateMachine.update(0.016); // 更新状态机
```

### 条件类型

状态机提供了多种条件类型：

```typescript
import {
  AlwaysTrueCondition,
  AlwaysFalseCondition,
  TimeCondition,
  PropertyCondition,
  AndCondition,
  OrCondition,
  NotCondition
} from 'graphic-logic';

// 基于属性值的条件
const scoreCondition = new PropertyCondition('gameScore', 100);

// 复合条件
const complexCondition = new AndCondition(
  scoreCondition,
  new TimeCondition(5000)
);
```

## 分层状态机

分层状态机支持状态嵌套和继承关系，适用于复杂的状态管理场景。

### 基本用法

```typescript
import { 
  HierarchicalStateMachine, 
  HierarchicalStateInterface
} from 'graphic-logic';

// 定义分层状态
class PlayerState implements HierarchicalStateInterface {
  public children: string[] = [];
  
  constructor(
    public name: string,
    public parent?: string,
    public defaultChild?: string
  ) {}
  
  enter(context: any) {
    console.log(`进入${this.name}状态`);
  }
  
  update(context: any, deltaTime: number) {
    console.log(`更新${this.name}状态`);
  }
  
  exit(context: any) {
    console.log(`退出${this.name}状态`);
  }
}

// 创建分层状态机
const stateMachine = new HierarchicalStateMachine();

// 添加分层状态
stateMachine.addState(new PlayerState('Player'));
stateMachine.addState(new PlayerState('Grounded', 'Player'));
stateMachine.addState(new PlayerState('Idle', 'Grounded'));
stateMachine.addState(new PlayerState('Walking', 'Grounded'));
stateMachine.addState(new PlayerState('Jumping', 'Player'));

// 初始化到子状态
stateMachine.initialize('Idle');
// 活动状态路径: ['Player', 'Grounded', 'Idle']

// 检查状态层级
if (stateMachine.isInStateOrSubstate('Grounded')) {
  console.log('玩家在地面上');
}
```

### 状态路径管理

```typescript
// 获取当前活动的所有状态
const activeStates = stateMachine.getActiveStates();
console.log('活动状态路径:', activeStates);

// 切换状态会自动处理父状态的进入/退出
stateMachine.changeState('Jumping');
// 会退出: Idle -> Grounded
// 会进入: Jumping
```

## 下推状态机

下推状态机支持状态栈操作，类似于调用栈的行为，适用于需要保存状态上下文的场景。

### 基本用法

```typescript
import { PushdownStateMachine } from 'graphic-logic';

// 创建下推状态机
const stateMachine = new PushdownStateMachine();

// 添加状态
stateMachine.addState(new GameState('MainMenu'));
stateMachine.addState(new GameState('Options'));
stateMachine.addState(new GameState('Gameplay'));

// 初始化
stateMachine.initialize('MainMenu');

// 压入状态（保留当前状态）
stateMachine.pushState('Options');
// 状态栈: ['MainMenu', 'Options']

// 弹出状态（返回上一个状态）
stateMachine.popState();
// 状态栈: ['MainMenu']

// 获取栈信息
console.log('栈深度:', stateMachine.getStackDepth());
console.log('状态栈:', stateMachine.getStateStack());
```

### 栈操作示例

```typescript
// 游戏场景切换示例
stateMachine.initialize('MainMenu');

// 开始游戏
stateMachine.changeState('Gameplay');

// 打开暂停菜单（保留游戏状态）
stateMachine.pushState('PauseMenu');

// 从暂停菜单返回游戏
stateMachine.popState();

// 退出游戏回到主菜单
stateMachine.changeState('MainMenu');
```

## 完整示例：游戏角色状态管理

```typescript
import { 
  HierarchicalStateMachine,
  HierarchicalStateInterface,
  PropertyCondition,
  TimeCondition
} from 'graphic-logic';

class PlayerState implements HierarchicalStateInterface {
  public children: string[] = [];
  
  constructor(
    public name: string,
    public parent?: string,
    public defaultChild?: string
  ) {}
  
  enter(context: any) {
    console.log(`角色进入${this.name}状态`);
  }
  
  update(context: any, deltaTime: number) {
    // 更新逻辑
  }
  
  exit(context: any) {
    console.log(`角色退出${this.name}状态`);
  }
}

// 创建状态机
const playerStateMachine = new HierarchicalStateMachine({
  isGrounded: true,
  velocity: 0,
  hasJumped: false
});

// 添加状态层次结构
playerStateMachine.addState(new PlayerState('Player'));
playerStateMachine.addState(new PlayerState('Grounded', 'Player'));
playerStateMachine.addState(new PlayerState('Idle', 'Grounded'));
playerStateMachine.addState(new PlayerState('Walking', 'Grounded'));
playerStateMachine.addState(new PlayerState('Running', 'Grounded'));
playerStateMachine.addState(new PlayerState('Airborne', 'Player'));
playerStateMachine.addState(new PlayerState('Jumping', 'Airborne'));
playerStateMachine.addState(new PlayerState('Falling', 'Airborne'));

// 添加转换规则
playerStateMachine.addTransition({
  from: 'Idle',
  to: 'Walking',
  condition: new PropertyCondition('velocity', 1, (v, t) => v >= t)
});

playerStateMachine.addTransition({
  from: 'Walking',
  to: 'Running',
  condition: new PropertyCondition('velocity', 5, (v, t) => v >= t)
});

playerStateMachine.addTransition({
  from: 'Grounded',
  to: 'Jumping',
  condition: new PropertyCondition('hasJumped', true)
});

playerStateMachine.addTransition({
  from: 'Airborne',
  to: 'Idle',
  condition: new PropertyCondition('isGrounded', true)
});

// 初始化和更新
playerStateMachine.initialize('Idle');

// 游戏循环中更新
function gameLoop(deltaTime: number) {
  playerStateMachine.update(deltaTime);
  // ... 其他游戏逻辑
}
```

## 高级特性

### 动态状态修改

```typescript
// 动态修改上下文
stateMachine.setContext({ 
  gameScore: 100,
  playerHealth: 50
});

// 获取当前上下文
const context = stateMachine.getContext();
```

### 状态查询

```typescript
// 检查当前状态
if (stateMachine.isInState('Running')) {
  console.log('角色正在奔跑');
}

// 获取所有状态
const allStates = stateMachine.getStates();

// 获取当前状态的转换
const transitions = stateMachine.getTransitions();
```

## 性能优化建议

1. **避免频繁状态切换** - 状态切换会触发enter/exit生命周期，频繁切换会影响性能
2. **合理设计状态层次** - 使用分层状态机减少状态数量
3. **复用条件对象** - 条件对象可以在多个转换中复用
4. **避免在状态中执行重计算** - 复杂计算应放在状态外部处理
```