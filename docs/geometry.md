# 几何模块

几何模块提供了基础的几何计算功能，包括点、线、矩形和圆形的操作。

## 安装

```bash
pnpm add graphic-logic
```

## 核心类

### Point - 二维点

提供点的基本操作，包括距离计算、向量运算和坐标变换。

```typescript
import { Point } from 'graphic-logic';

// 创建点
const point = new Point(10, 20);
console.log(point.toString()); // Point(10, 20)

// 计算距离
const point2 = new Point(40, 60);
const distance = point.distanceTo(point2);
console.log(distance); // 50

// 向量运算
const vector = point.subtract(point2);
console.log(vector.toString()); // Point(-30, -40)

// 缩放
const scaled = point.multiply(2);
console.log(scaled.toString()); // Point(20, 40)

// 归一化
const normalized = point.normalize();
```

### Line - 线段

提供线段的长度计算、交点检测和点在线段上的投影计算。

```typescript
import { Line, Point } from 'graphic-logic';

// 创建线段
const point1 = new Point(0, 0);
const point2 = new Point(3, 4);
const line = new Line(point1, point2);

// 获取长度
console.log(line.length); // 5

// 获取中点
const midpoint = line.midpoint;
console.log(midpoint.toString()); // Point(1.5, 2)

// 计算点在线段上的投影
const point3 = new Point(1, 1);
const projection = line.projectPoint(point3);
```

### Rectangle - 矩形

提供矩形的包含检测、交集计算和边界计算。

```typescript
import { Rectangle, Point } from 'graphic-logic';

// 创建矩形
const rectangle = new Rectangle(0, 0, 100, 200);

// 检查点是否在矩形内
const point = new Point(50, 50);
console.log(rectangle.contains(point)); // true

// 获取中心点
const center = rectangle.center;
console.log(center.toString()); // Point(50, 100)

// 获取边界
const bounds = rectangle.getBounds();
```

### Circle - 圆形

提供圆形的包含检测、切线计算和面积周长计算。

```typescript
import { Circle, Point } from 'graphic-logic';

// 创建圆形
const circle = new Circle(new Point(50, 50), 30);

// 检查点是否在圆内
const point = new Point(50, 50);
console.log(circle.contains(point)); // true

// 获取面积和周长
console.log(circle.area); // 约2827.43
console.log(circle.circumference); // 约188.50

// 计算圆上的点
const pointOnCircle = circle.getPointAtAngle(Math.PI / 4);
```

## 实用工具函数

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

## 完整示例

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