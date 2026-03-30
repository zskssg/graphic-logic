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

## 🚀 快速开始

### 基础几何操作

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

## 📚 模块功能详解

### 1. 几何模块

#### 核心类

- **Point** - 二维点
  - 支持距离计算、向量运算
  - 提供坐标变换方法

- **Line** - 线段
  - 长度计算
  - 交点检测
  - 点在线段上的投影计算

- **Rectangle** - 矩形
  - 包含检测
  - 交集计算
  - 边界计算

- **Circle** - 圆形
  - 包含检测
  - 切线计算
  - 面积和周长计算

#### 使用示例

```typescript
import { Point, Line, Rectangle, Circle } from 'graphic-logic';

// 点操作
const p1 = new Point(0, 0);
const p2 = new Point(3, 4);
console.log(p1.distanceTo(p2)); // 5

// 线段操作
const line = new Line(p1, p2);
console.log(line.length); // 5

// 矩形操作
const rect = new Rectangle(0, 0, 10, 10);
console.log(rect.contains(new Point(5, 5))); // true

// 圆形操作
const circle = new Circle(new Point(5, 5), 5);
console.log(circle.contains(new Point(5, 5))); // true
```

### 2. 逻辑模块

#### 核心类

- **LogicGate** - 逻辑门
  - 支持多种逻辑门类型：AND、OR、NOT、NAND、NOR、XOR、XNOR
  - 支持多输入输出
  - 支持门之间的连接和信号传递

#### 使用示例

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

### 3. 动画模块

#### 图形生成器

提供多种图形排列的点生成器，所有点都均匀分布在图形边界上。

- **基础图形**
  - `CircleShapeGenerator` - 圆形生成器
  - `RectangleShapeGenerator` - 矩形生成器
  - `StarShapeGenerator` - 星形生成器
  - `SemiCircleShapeGenerator` - 半圆生成器
  - `WaveShapeGenerator` - 波纹生成器

- **多边形**
  - `TriangleShapeGenerator` - 三角形生成器
  - `ParallelogramShapeGenerator` - 平行四边形生成器
  - `PolygonShapeGenerator` - 多边形生成器（支持正多边形和自定义顶点）

- **曲线图形**
  - `EllipseShapeGenerator` - 椭圆形生成器
  - `SectorShapeGenerator` - 扇形生成器
  - `RingShapeGenerator` - 圆环生成器
  - `TruncatedConeShapeGenerator` - 圆台生成器

#### 变换类型

支持多种动画变换效果：

- `RotateTransformation` - 旋转变换
- `TranslateTransformation` - 平移变换
- `ScaleTransformation` - 缩放变换
- `WaveTransformation` - 波浪变换
- `BounceTransformation` - 弹跳变换
- `RadiusTransformation` - 半径变换
- `LinearTransformation` - 线性变换
- `WaveSpreadTransformation` - 水波扩散变换
- `StaggerTransformation` - 错列变换（实现点按顺序依次变换的层次感效果）
- `CompositeTransformation` - 组合变换

#### 动画生成

- `FrameByFrameAnimationGenerator` - 逐帧动画生成器
- 支持自定义帧数和缓动函数
- 支持按需生成和批量生成

#### 使用示例

```typescript
import { 
  Point,
  CircleShapeGenerator,
  TriangleShapeGenerator,
  EllipseShapeGenerator,
  RotateTransformation,
  WaveTransformation,
  StaggerTransformation,
  CompositeTransformation,
  FrameByFrameAnimationGenerator,
  EasingFunction
} from 'graphic-logic';

// 创建图形生成器
const center = new Point(100, 100);

// 圆形生成器
const circleGenerator = new CircleShapeGenerator(center, 50, 32);

// 三角形生成器
const triangleGenerator = new TriangleShapeGenerator(
  new Point(50, 50),
  new Point(150, 50),
  new Point(100, 150),
  15
);

// 椭圆形生成器
const ellipseGenerator = new EllipseShapeGenerator(
  center,
  60,
  30,
  64,
  0,
  2 * Math.PI,
  Math.PI / 4
);

// 创建基础变换
const rotate = new RotateTransformation(center, Math.PI * 2, EasingFunction.EASE_IN_OUT);
const wave = new WaveTransformation(20, 2, EasingFunction.LINEAR);
const translate = new TranslateTransformation(100, 50, EasingFunction.EASE_OUT);

// 创建错列变换（实现层次感效果）
const staggerRotate = new StaggerTransformation(
  rotate,     // 基础变换
  0.3,        // 错列延迟系数（0-1，值越大延迟越明显）
  EasingFunction.EASE_IN_OUT
);

// 创建带错列效果的平移变换
const staggerTranslate = new StaggerTransformation(
  translate,
  0.2,
  EasingFunction.BOUNCE
);

// 组合变换
const composite = new CompositeTransformation([staggerRotate, staggerTranslate]);

// 创建动画生成器
const animation = new FrameByFrameAnimationGenerator(
  circleGenerator,
  [composite]
);

// 生成64帧动画
const frames = animation.generateFrames(64);

// 使用生成的帧
frames.forEach((frame, index) => {
  console.log(`Frame ${index}:`, frame.map(p => p.toString()));
});

// === 错列变换效果示例 ===
// 创建一个带错列效果的圆形旋转动画
const circleWithStagger = new CircleShapeGenerator(new Point(200, 200), 40, 24);

// 创建旋转基础变换
const baseRotate = new RotateTransformation(new Point(200, 200), Math.PI * 2);

// 创建错列旋转变换（延迟系数0.4，产生明显的层次感）
const staggeredRotate = new StaggerTransformation(
  baseRotate,
  0.4,
  EasingFunction.EASE_IN_OUT
);

// 创建错列动画生成器
const staggerAnimation = new FrameByFrameAnimationGenerator(
  circleWithStagger,
  [staggeredRotate]
);

// 生成带错列效果的动画帧
const staggerFrames = staggerAnimation.generateFrames(32);
console.log('错列动画效果:', staggerFrames.length, 'frames');
```

### 4. 工具函数

#### 数学工具

```typescript
import { distance, clamp, lerp, degreesToRadians, radiansToDegrees } from 'graphic-logic';

// 距离计算
console.log(distance(0, 0, 3, 4)); // 5

// 值限制
console.log(clamp(5, 0, 10)); // 5

// 线性插值
console.log(lerp(0, 10, 0.5)); // 5

// 角度转换
console.log(degreesToRadians(180)); // Math.PI
console.log(radiansToDegrees(Math.PI)); // 180
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
