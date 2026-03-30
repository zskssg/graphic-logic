# 时间调度器 (TimeScheduler)

时间调度器用于按时按顺序执行步骤，支持在Web和Cocos等不同平台使用。

## 安装

```bash
pnpm add graphic-logic
```

## 基本用法

### 创建调度器

```typescript
import { TimeScheduler } from 'graphic-logic';

// 创建调度器实例
const scheduler = new TimeScheduler();
```

### 添加任务

```typescript
// 在1秒后执行任务
scheduler.addTask(1000, () => {
  console.log('1秒后执行');
});

// 在5秒后执行任务，指定任务ID
scheduler.addTask(5000, () => {
  console.log('5秒后执行');
}, 'task2');

// 添加重复执行的任务
scheduler.addTask(1000, () => {
  console.log('每秒执行一次');
}, 'repeat-task', false);
```

### 启动调度器

```typescript
scheduler.start();
```

### 停止调度器

```typescript
scheduler.stop();
```

### 暂停调度器

```typescript
scheduler.pause();
```

### 恢复调度器

```typescript
scheduler.resume();
```

### 重置调度器

```typescript
scheduler.reset();
```

### 删除任务

```typescript
const taskId = scheduler.addTask(1000, () => {});
scheduler.removeTask(taskId);
```

## 高级用法

### 获取当前状态

```typescript
console.log('是否运行中:', scheduler.getIsRunning());
console.log('是否已暂停:', scheduler.getIsPaused());
console.log('当前时间:', scheduler.getCurrentTime());
console.log('任务列表:', scheduler.getTasks());
```

### 使用自定义时间源

```typescript
const scheduler = new TimeScheduler({
  timeProvider: () => Date.now(), // 默认值
});
```

### 使用自定义定时器

```typescript
const scheduler = new TimeScheduler({
  requestAnimationFrame: (callback) => {
    return requestAnimationFrame(callback);
  },
  cancelAnimationFrame: (id) => {
    cancelAnimationFrame(id);
  },
});
```

## 在Cocos中使用

```typescript
import { CocosTimeScheduler } from 'graphic-logic';
import { _decorator, Component } from 'cc';

@_decorator.ccclass('GameController')
export class GameController extends Component {
    private scheduler: CocosTimeScheduler = null;
    
    onLoad() {
        this.scheduler = new CocosTimeScheduler(this);
        this.scheduler.addTask(1000, () => {
            console.log('1秒后执行');
        });
        this.scheduler.start();
    }
    
    onDestroy() {
        if (this.scheduler) {
            this.scheduler.stop();
        }
    }
}
```

## 使用调度器管理器

```typescript
import { SchedulerManager } from 'graphic-logic';

// 获取默认调度器
const defaultScheduler = SchedulerManager.getScheduler();

// 获取命名调度器
const gameScheduler = SchedulerManager.getScheduler('game');

// 删除调度器
SchedulerManager.removeScheduler('game');

// 清除所有调度器
SchedulerManager.clear();
```

## 完整示例

### 基本示例

```typescript
import { TimeScheduler } from 'graphic-logic';

const scheduler = new TimeScheduler();

// 添加多个任务
scheduler.addTask(1000, () => console.log('1秒后执行'));
scheduler.addTask(3000, () => console.log('3秒后执行'));
scheduler.addTask(5000, () => console.log('5秒后执行'));

// 启动调度器
scheduler.start();

// 5秒后停止调度器
setTimeout(() => {
    scheduler.stop();
    console.log('调度器已停止');
}, 6000);
```

### 暂停和继续示例

```typescript
import { TimeScheduler } from 'graphic-logic';

const scheduler = new TimeScheduler();

// 添加任务
scheduler.addTask(2000, () => console.log('任务1：2秒后执行'));
scheduler.addTask(5000, () => console.log('任务2：5秒后执行'));
scheduler.addTask(8000, () => console.log('任务3：8秒后执行'));

// 启动调度器
scheduler.start();
console.log('调度器已启动');

// 3秒后暂停
setTimeout(() => {
    scheduler.pause();
    console.log('调度器已暂停，当前时间:', scheduler.getCurrentTime());
}, 3000);

// 暂停2秒后恢复
setTimeout(() => {
    scheduler.resume();
    console.log('调度器已恢复');
}, 5000);

// 10秒后停止
setTimeout(() => {
    scheduler.stop();
    console.log('调度器已停止');
}, 10000);
```

## 扩展功能

### 任务优先级

```typescript
import { PriorityScheduler } from 'graphic-logic';

const scheduler = new PriorityScheduler();

// 添加不同优先级的任务（数字越大优先级越高）
scheduler.addTask(1000, () => console.log('低优先级任务'), 'low', true, 1);
scheduler.addTask(1000, () => console.log('高优先级任务'), 'high', true, 10);
scheduler.addTask(1000, () => console.log('中优先级任务'), 'medium', true, 5);

scheduler.start();
// 输出顺序：高优先级任务 -> 中优先级任务 -> 低优先级任务
```

### 任务分组

```typescript
import { GroupScheduler } from 'graphic-logic';

const scheduler = new GroupScheduler();

// 添加到不同分组
scheduler.addTask(1000, () => console.log('分组1任务1'), 'task1', true, 'group1');
scheduler.addTask(2000, () => console.log('分组2任务'), 'task2', true, 'group2');
scheduler.addTask(3000, () => console.log('分组1任务2'), 'task3', true, 'group1');

// 获取分组信息
console.log('所有分组:', scheduler.getGroups());
console.log('分组1的任务:', scheduler.getGroupTasks('group1'));

// 移除整个分组
scheduler.removeGroup('group1');
```

### 条件任务

```typescript
import { ConditionalScheduler } from 'graphic-logic';

let shouldExecute = false;
const scheduler = new ConditionalScheduler();

// 添加带条件的任务
scheduler.addTask(1000, () => console.log('条件满足时执行'), 'conditional', true, () => shouldExecute);

scheduler.start();

// 条件不满足，任务不执行
setTimeout(() => {
    shouldExecute = true; // 条件变为满足
}, 1500);
```

### 动态任务

```typescript
import { DynamicScheduler } from 'graphic-logic';

const scheduler = new DynamicScheduler();

// 添加任务
const taskId = scheduler.addTask(1000, () => console.log('原始任务'));

// 动态更新任务属性
scheduler.updateTask(taskId, {
    time: 2000,
    action: () => console.log('更新后的任务')
});

// 禁用任务
scheduler.disableTask(taskId);

// 启用任务
scheduler.enableTask(taskId);
```

### 任务队列

```typescript
import { QueueScheduler } from 'graphic-logic';

const scheduler = new QueueScheduler();

// 添加队列任务（按位置顺序执行）
scheduler.addQueueTask('queue1', () => console.log('队列任务1'), 'task1', 1);
scheduler.addQueueTask('queue1', () => console.log('队列任务2'), 'task2', 2);
scheduler.addQueueTask('queue2', () => console.log('队列任务3'), 'task3', 1);

// 处理队列（按顺序执行任务）
scheduler.processQueue('queue1'); // 执行任务1
scheduler.processQueue('queue1'); // 执行任务2
scheduler.processQueue('queue2'); // 执行任务3

// 处理所有队列
scheduler.processAllQueues();
```

### 时间旅行

```typescript
import { TimeTravelScheduler } from 'graphic-logic';

const scheduler = new TimeTravelScheduler();

scheduler.start();

// 执行任务
scheduler.addTask(1000, () => console.log('任务1'));
scheduler.addTask(2000, () => console.log('任务2'));

// 保存状态
scheduler.saveState();

// 继续执行
setTimeout(() => {
    // 回溯到上一个状态
    scheduler.undo();
    
    // 前进到下一个状态
    scheduler.redo();
}, 3000);
```

## 注意事项

1. 任务按时间顺序执行
2. 重复任务会持续执行，直到被删除或调度器停止
3. 任务执行出错不会影响其他任务的执行
4. 调度器停止后，所有未执行的任务将不会执行
5. 重置调度器会清除所有任务并重置时间
6. 暂停时会保存当前进度，恢复后继续从暂停时的状态执行
7. 暂停期间不会执行任何任务，时间计算会排除暂停的时间段