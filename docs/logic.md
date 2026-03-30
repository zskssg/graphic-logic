# 逻辑模块

逻辑模块提供了逻辑门操作功能，支持多种逻辑门类型和门之间的连接。

## 安装

```bash
pnpm add graphic-logic
```

## 核心类

### LogicGate - 逻辑门

提供多种逻辑门类型，支持多输入输出和门之间的连接。

## 支持的逻辑门类型

- **AND** - 与门
- **OR** - 或门
- **NOT** - 非门
- **NAND** - 与非门
- **NOR** - 或非门
- **XOR** - 异或门
- **XNOR** - 同或门

## 基本用法

### 创建逻辑门

```typescript
import { LogicGate } from 'graphic-logic';

// 创建 AND 门（默认2个输入）
const andGate = new LogicGate('AND');

// 创建 OR 门（默认2个输入）
const orGate = new LogicGate('OR');

// 创建 NOT 门（1个输入）
const notGate = new LogicGate('NOT', 1);

// 创建具有多个输入的门
const multiInputGate = new LogicGate('AND', 4);
```

### 设置输入

```typescript
// 设置输入值（布尔值）
andGate.setInput(0, true);
andGate.setInput(1, true);

// 获取输出
console.log(andGate.getOutput()); // true

// 更新输出（当输入变化时）
andGate.updateOutput();
```

### 连接门

```typescript
import { LogicGate } from 'graphic-logic';

// 创建门
const andGate = new LogicGate('AND');
const orGate = new LogicGate('OR');
const notGate = new LogicGate('NOT');

// 设置输入
andGate.setInput(0, true);
andGate.setInput(1, false);
console.log(andGate.getOutput()); // false

// 连接门：将andGate的输出连接到orGate的输入0
andGate.connectTo(orGate, 0, 0);

// 将notGate的输出连接到orGate的输入1
notGate.connectTo(orGate, 0, 1);

// 更新输出
orGate.updateOutput();
console.log(orGate.getOutput()); // 根据连接的门输出计算
```

### 获取信息

```typescript
// 获取门类型
console.log(andGate.getType()); // 'AND'

// 获取输入数量
console.log(andGate.getInputCount()); // 2

// 获取输出数量
console.log(andGate.getOutputCount()); // 1

// 获取连接信息
const connections = andGate.getConnections();
console.log(connections);
```

## 完整示例

```typescript
import { LogicGate } from 'graphic-logic';

// 创建逻辑门
const andGate = new LogicGate('AND');
const orGate = new LogicGate('OR');
const notGate = new LogicGate('NOT');

// 设置输入
andGate.setInput(0, true);
andGate.setInput(1, false);
console.log(andGate.getOutput()); // false

// 连接门
andGate.connectTo(orGate, 0, 0);
notGate.connectTo(orGate, 0, 1);

// 更新输出
orGate.updateOutput();
console.log(orGate.getOutput()); // 根据连接的门输出计算
```

## 高级用法

### 复杂逻辑电路

```typescript
import { LogicGate } from 'graphic-logic';

// 创建一个半加器
const xorGate = new LogicGate('XOR');
const andGate = new LogicGate('AND');

// 设置输入
xorGate.setInput(0, true);
xorGate.setInput(1, false);
andGate.setInput(0, true);
andGate.setInput(1, false);

// 获取和（XOR输出）
const sum = xorGate.getOutput();

// 获取进位（AND输出）
const carry = andGate.getOutput();

console.log('Sum:', sum);
console.log('Carry:', carry);
```

### 动态修改连接

```typescript
import { LogicGate } from 'graphic-logic';

const gate1 = new LogicGate('AND');
const gate2 = new LogicGate('OR');
const gate3 = new LogicGate('NOT');

// 初始连接
gate1.connectTo(gate2, 0, 0);

// 移除连接
gate1.disconnectFrom(gate2, 0, 0);

// 重新连接到其他门
gate3.connectTo(gate2, 0, 0);
```

## 注意事项

1. 逻辑门的输入值必须是布尔值（true/false）
2. 连接门时，输出索引必须有效（通常为0）
3. 输入索引必须在有效范围内
4. 当连接关系变化时，需要调用`updateOutput()`更新输出
5. NOT门只能有一个输入