# graphic-logic

一个专注于图形化逻辑探讨和学习的 TypeScript 库，提供丰富的几何计算、逻辑门操作和动画生成功能。

## 📦 安装

### 使用 npm
```bash
npm install graphic-logic
```

### 使用 yarn
```bash
yarn add graphic-logic
```

### 使用 pnpm
```bash
pnpm add graphic-logic
```

##  文档

详细使用文档请查看 [docs](./docs/) 目录：

- [时间调度器](./docs/time-scheduler.md) - 按时按顺序执行步骤
- [状态机](./docs/state-machine.md) - 状态管理和状态转换
- [几何模块](./docs/geometry.md) - 基础几何操作
- [逻辑模块](./docs/logic.md) - 逻辑门操作
- [动画模块](./docs/animation.md) - 动画生成和变换

## 🚀 快速开始

详细使用文档请查看 [docs](./docs/) 目录。

### 基础示例

```typescript
import { Point, Line, Rectangle, Circle } from 'graphic-logic';

// 创建点
const point = new Point(10, 20);
console.log(point.toString()); // Point(10, 20)

// 计算距离
const point2 = new Point(40, 60);
const distance = point.distanceTo(point2);
console.log(distance); // 50

// 创建线段
const line = new Line(point, point2);
console.log(line.length); // 50

// 创建矩形
const rectangle = new Rectangle(0, 0, 100, 200);
console.log(rectangle.contains(point)); // true

// 创建圆形
const circle = new Circle(new Point(50, 50), 30);
console.log(circle.contains(point)); // false
```

### 逻辑门操作

```typescript
import { LogicGate } from 'graphic-logic';

// 创建 AND 门
const andGate = new LogicGate('AND');
andGate.setInput(0, true);
andGate.setInput(1, true);
console.log(andGate.getOutput()); // true

// 创建 OR 门
const orGate = new LogicGate('OR');
orGate.setInput(0, false);
orGate.setInput(1, true);
console.log(orGate.getOutput()); // true

// 创建 NOT 门
const notGate = new LogicGate('NOT', 1);
notGate.setInput(0, true);
console.log(notGate.getOutput()); // false

// 连接门
andGate.connectTo(orGate, 0, 0);
```

## 🛠️ 开发指南

### 环境设置

```bash
# 克隆仓库
git clone <repository-url>
cd graphic-logic

# 安装依赖
pnpm install

# 构建项目
pnpm build

# 运行测试
pnpm test

# 类型检查
pnpm typecheck
```

### 项目结构

```
graphic-logic/
├── src/
│   ├── geometry/          # 几何类实现
│   │   ├── Point.ts
│   │   ├── Line.ts
│   │   ├── Rectangle.ts
│   │   └── Circle.ts
│   ├── logic/            # 逻辑模块
│   │   └── LogicGate.ts
│   ├── animation/        # 动画模块
│   │   ├── interfaces.ts
│   │   ├── generators/   # 图形生成器
│   │   ├── transformations/ # 变换实现
│   │   └── AnimationGenerator.ts
│   ├── utils/            # 工具函数
│   │   └── math.ts
│   ├── types.ts          # 类型定义
│   └── index.ts          # 主入口
├── examples/             # 示例应用
│   ├── graph-demo/       # 图形演示（交互式图形展示）
│   └── performance-test/ # 性能测试（测试图形生成器性能表现）
├── test/                # 测试文件
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── README.md
```

## 📄 许可证

LGPL-3.0 License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📧 联系方式

如有问题或建议，请通过 Issue 联系。
