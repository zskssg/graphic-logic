# 动画模块

动画模块提供了丰富的图形生成器和变换效果，用于创建各种动画效果。

## 安装

```bash
pnpm add graphic-logic
```

## 图形生成器

提供多种图形排列的点生成器，所有点都均匀分布在图形边界上。

### 基础图形

- `CircleShapeGenerator` - 圆形生成器
- `RectangleShapeGenerator` - 矩形生成器
- `StarShapeGenerator` - 星形生成器
- `SemiCircleShapeGenerator` - 半圆生成器
- `WaveShapeGenerator` - 波纹生成器

### 多边形

- `TriangleShapeGenerator` - 三角形生成器
- `ParallelogramShapeGenerator` - 平行四边形生成器
- `PolygonShapeGenerator` - 多边形生成器（支持正多边形和自定义顶点）

### 曲线图形

- `EllipseShapeGenerator` - 椭圆形生成器
- `SectorShapeGenerator` - 扇形生成器
- `RingShapeGenerator` - 圆环生成器
- `TruncatedConeShapeGenerator` - 圆台生成器

## 变换类型

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

## 动画生成

- `FrameByFrameAnimationGenerator` - 逐帧动画生成器
- 支持自定义帧数和缓动函数
- 支持按需生成和批量生成

## 基本用法

### 创建图形生成器

```typescript
import { 
  Point,
  CircleShapeGenerator,
  TriangleShapeGenerator,
  EllipseShapeGenerator
} from 'graphic-logic';

// 创建中心点
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

// 生成点
const circlePoints = circleGenerator.generatePoints();
const trianglePoints = triangleGenerator.generatePoints();
```

### 创建变换

```typescript
import { 
  RotateTransformation,
  WaveTransformation,
  TranslateTransformation,
  EasingFunction
} from 'graphic-logic';

// 创建基础变换
const rotate = new RotateTransformation(center, Math.PI * 2, EasingFunction.EASE_IN_OUT);
const wave = new WaveTransformation(20, 2, EasingFunction.LINEAR);
const translate = new TranslateTransformation(100, 50, EasingFunction.EASE_OUT);
```

### 创建错列变换

错列变换可以实现点按顺序依次变换的层次感效果：

```typescript
import { 
  RotateTransformation,
  TranslateTransformation,
  StaggerTransformation,
  EasingFunction
} from 'graphic-logic';

// 创建旋转基础变换
const rotate = new RotateTransformation(center, Math.PI * 2, EasingFunction.EASE_IN_OUT);

// 创建错列变换（延迟系数0.3，值越大延迟越明显）
const staggerRotate = new StaggerTransformation(
  rotate,     // 基础变换
  0.3,        // 错列延迟系数（0-1）
  EasingFunction.EASE_IN_OUT
);

// 创建带错列效果的平移变换
const translate = new TranslateTransformation(100, 50, EasingFunction.BOUNCE);
const staggerTranslate = new StaggerTransformation(
  translate,
  0.2,
  EasingFunction.BOUNCE
);
```

### 组合变换

```typescript
import { CompositeTransformation } from 'graphic-logic';

// 组合多个变换
const composite = new CompositeTransformation([staggerRotate, staggerTranslate]);
```

### 创建动画生成器

```typescript
import { FrameByFrameAnimationGenerator } from 'graphic-logic';

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
```

## 完整示例

```typescript
import { 
  Point,
  CircleShapeGenerator,
  RotateTransformation,
  StaggerTransformation,
  CompositeTransformation,
  FrameByFrameAnimationGenerator,
  EasingFunction
} from 'graphic-logic';

// 创建图形生成器
const center = new Point(200, 200);
const circleWithStagger = new CircleShapeGenerator(center, 40, 24);

// 创建旋转基础变换
const baseRotate = new RotateTransformation(center, Math.PI * 2);

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

## 缓动函数

支持多种缓动函数：

- `LINEAR` - 线性
- `EASE_IN` - 缓入
- `EASE_OUT` - 缓出
- `EASE_IN_OUT` - 缓入缓出
- `BOUNCE` - 弹跳
- `ELASTIC` - 弹性
- `BACK_IN` - 回退缓入
- `BACK_OUT` - 回退缓出
- `BACK_IN_OUT` - 回退缓入缓出

## 注意事项

1. 图形生成器生成的所有点都均匀分布在图形边界上
2. 变换可以组合使用，创建复杂的动画效果
3. 错列变换可以产生点按顺序依次变换的层次感
4. 动画生成器支持按需生成和批量生成
5. 缓动函数可以控制动画的速度变化曲线