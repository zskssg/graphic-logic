# 二维图形生成与动画变换系统设计

## 1. 系统架构设计

### 1.1 核心组件

#### 1.1.1 基础接口

```typescript
/** 点变换接口 */
export interface Transformation {
  apply(point: Point, frame: number, totalFrames: number): Point;
}

/** 图形生成器接口 */
export interface ShapeGenerator {
  generatePoints(): Point[];
  getBoundingBox(): Rectangle;
}

/** 动画生成器接口 */
export interface AnimationGenerator {
  generateFrames(totalFrames: number): Point[][];
}
```

#### 1.1.2 具体实现类

**图形生成器**：
- `CircleShapeGenerator` - 圆形排列
- `RectangleShapeGenerator` - 矩形排列
- `HexagonShapeGenerator` - 六边形排列
- `CustomShapeGenerator` - 自定义图形

**变换类型**：
- `TranslateTransformation` - 平移变换
- `ScaleTransformation` - 缩放变换
- `RotateTransformation` - 旋转变换
- `WaveTransformation` - 波浪变换
- `CustomTransformation` - 自定义变换

**动画生成器**：
- `FrameByFrameAnimationGenerator` - 逐帧生成动画

### 1.2 类图设计

```
┌────────────────┐      ┌─────────────────────┐
│  Point         │      │  Transformation     │
├────────────────┤      ├─────────────────────┤
│ - x: number    │      │ + apply(): Point    │
│ - y: number    │      └─────────────────────┘
└────────────────┘             ▲
         ▲                     │
         │                     │
┌────────────────┐      ┌─────────────────────┐
│  ShapeGenerator│      │  AnimationGenerator│
├────────────────┤      ├─────────────────────┤
│ + generatePoints()     │ + generateFrames() │
│ + getBoundingBox()     └─────────────────────┘
└────────────────┘
```

## 2. 核心实现

### 2.1 图形生成器实现

```typescript
import { Point, Rectangle } from './geometry';

/** 圆形图形生成器 */
export class CircleShapeGenerator implements ShapeGenerator {
  constructor(
    private center: Point,
    private radius: number,
    private pointCount: number
  ) {}

  public generatePoints(): Point[] {
    const points: Point[] = [];
    const angleStep = (2 * Math.PI) / this.pointCount;

    for (let i = 0; i< this.pointCount; i++) {
      const angle = i * angleStep;
      const x = this.center.x + this.radius * Math.cos(angle);
      const y = this.center.y + this.radius * Math.sin(angle);
      points.push(new Point(x, y));
    }

    return points;
  }

  public getBoundingBox(): Rectangle {
    return new Rectangle(
      this.center.x - this.radius,
      this.center.y - this.radius,
      this.radius * 2,
      this.radius * 2
    );
  }
}

/** 矩形图形生成器 */
export class RectangleShapeGenerator implements ShapeGenerator {
  constructor(
    private topLeft: Point,
    private width: number,
    private height: number,
    private pointCount: number
  ) {}

  public generatePoints(): Point[] {
    const points: Point[] = [];
    const edgePoints = Math.floor(this.pointCount / 4);
    
    // 上边
    for (let i = 0; i< edgePoints; i++) {
      const x = this.topLeft.x + (i / (edgePoints - 1)) * this.width;
      points.push(new Point(x, this.topLeft.y));
    }
    
    // 右边
    for (let i = 1; i < edgePoints; i++) {
      const y = this.topLeft.y + (i / (edgePoints - 1)) * this.height;
      points.push(new Point(this.topLeft.x + this.width, y));
    }
    
    // 下边
    for (let i = edgePoints - 1; i >= 0; i--) {
      const x = this.topLeft.x + (i / (edgePoints - 1)) * this.width;
      points.push(new Point(x, this.topLeft.y + this.height));
    }
    
    // 左边
    for (let i = edgePoints - 2; i >0; i--) {
      const y = this.topLeft.y + (i / (edgePoints - 1)) * this.height;
      points.push(new Point(this.topLeft.x, y));
    }

    return points;
  }

  public getBoundingBox(): Rectangle {
    return new Rectangle(this.topLeft.x, this.topLeft.y, this.width, this.height);
  }
}
```

### 2.2 变换实现

```typescript
import { Point } from './geometry';

/** 平移变换 */
export class TranslateTransformation implements Transformation {
  constructor(
    private dx: number,
    private dy: number
  ) {}

  public apply(point: Point, frame: number, totalFrames: number): Point {
    const progress = frame / totalFrames;
    return new Point(
      point.x + this.dx * progress,
      point.y + this.dy * progress
    );
  }
}

/** 旋转变换 */
export class RotateTransformation implements Transformation {
  constructor(
    private center: Point,
    private angle: number
  ) {}

  public apply(point: Point, frame: number, totalFrames: number): Point {
    const progress = frame / totalFrames;
    const currentAngle = this.angle * progress;
    
    const dx = point.x - this.center.x;
    const dy = point.y - this.center.y;
    
    const cos = Math.cos(currentAngle);
    const sin = Math.sin(currentAngle);
    
    return new Point(
      this.center.x + dx * cos - dy * sin,
      this.center.y + dx * sin + dy * cos
    );
  }
}

/** 波浪变换 */
export class WaveTransformation implements Transformation {
  constructor(
    private amplitude: number,
    private frequency: number
  ) {}

  public apply(point: Point, frame: number, totalFrames: number): Point {
    const progress = frame / totalFrames;
    const wave = Math.sin(progress * 2 * Math.PI * this.frequency) * this.amplitude;
    
    return new Point(point.x, point.y + wave);
  }
}

/** 组合变换 */
export class CompositeTransformation implements Transformation {
  constructor(private transformations: Transformation[]) {}

  public apply(point: Point, frame: number, totalFrames: number): Point {
    let result = point;
    
    for (const transformation of this.transformations) {
      result = transformation.apply(result, frame, totalFrames);
    }
    
    return result;
  }
}
```

### 2.3 动画生成器实现

```typescript
import { Point } from './geometry';
import { ShapeGenerator, Transformation } from './interfaces';

/** 帧动画生成器 */
export class FrameByFrameAnimationGenerator implements AnimationGenerator {
  constructor(
    private shapeGenerator: ShapeGenerator,
    private transformations: Transformation[]
  ) {}

  public generateFrames(totalFrames: number): Point[][] {
    const initialPoints = this.shapeGenerator.generatePoints();
    const frames: Point[][] = [];

    for (let frame = 0; frame< totalFrames; frame++) {
      const framePoints = initialPoints.map(point =>{
        let transformedPoint = point;
        
        for (const transformation of this.transformations) {
          transformedPoint = transformation.apply(transformedPoint, frame, totalFrames);
        }
        
        return transformedPoint;
      });
      
      frames.push(framePoints);
    }

    return frames;
  }
}
```

## 3. 使用示例

### 3.1 基础使用

```typescript
import { 
  Point, 
  CircleShapeGenerator, 
  RotateTransformation,
  WaveTransformation,
  CompositeTransformation,
  FrameByFrameAnimationGenerator
} from './graphic-logic';

// 创建圆形图形生成器
const center = new Point(100, 100);
const circleGenerator = new CircleShapeGenerator(center, 50, 32);

// 创建变换
const rotate = new RotateTransformation(center, Math.PI * 2);
const wave = new WaveTransformation(20, 2);
const composite = new CompositeTransformation([rotate, wave]);

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

### 3.2 扩展自定义图形

```typescript
import { Point, Rectangle, ShapeGenerator } from './graphic-logic';

/** 自定义星形图形生成器 */
export class StarShapeGenerator implements ShapeGenerator {
  constructor(
    private center: Point,
    private outerRadius: number,
    private innerRadius: number,
    private points: number
  ) {}

  public generatePoints(): Point[] {
    const result: Point[] = [];
    const angleStep = (2 * Math.PI) / (this.points * 2);

    for (let i = 0; i< this.points * 2; i++) {
      const angle = i * angleStep;
      const radius = i % 2 === 0 ? this.outerRadius : this.innerRadius;
      const x = this.center.x + radius * Math.cos(angle);
      const y = this.center.y + radius * Math.sin(angle);
      result.push(new Point(x, y));
    }

    return result;
  }

  public getBoundingBox(): Rectangle {
    return new Rectangle(
      this.center.x - this.outerRadius,
      this.center.y - this.outerRadius,
      this.outerRadius * 2,
      this.outerRadius * 2
    );
  }
}

// 使用自定义图形
const starGenerator = new StarShapeGenerator(center, 50, 25, 5);
const starAnimation = new FrameByFrameAnimationGenerator(
  starGenerator,
  [composite]
);
const starFrames = starAnimation.generateFrames(64);
```

### 3.3 扩展自定义变换

```typescript
import { Point, Transformation } from './graphic-logic';

/** 弹跳变换 */
export class BounceTransformation implements Transformation {
  constructor(
    private amplitude: number,
    private frequency: number
  ) {}

  public apply(point: Point, frame: number, totalFrames: number): Point {
    const progress = frame / totalFrames;
    const bounce = Math.abs(Math.sin(progress * 2 * Math.PI * this.frequency)) * this.amplitude;
    
    return new Point(point.x + bounce, point.y + bounce);
  }
}

// 使用自定义变换
const bounce = new BounceTransformation(30, 3);
const bounceAnimation = new FrameByFrameAnimationGenerator(
  circleGenerator,
  [bounce]
);
const bounceFrames = bounceAnimation.generateFrames(64);
```

## 4. 设计优缺点分析

### 4.1 优点

1. **高度可扩展**：
   - 接口化设计，易于添加新的图形类型和变换类型
   - 组合模式支持多个变换的叠加

2. **类型安全**：
   - 完整的TypeScript类型定义
   - 清晰的接口约束

3. **模块化设计**：
   - 职责分离，每个类只负责单一功能
   - 易于测试和维护

4. **性能优化**：
   - 变换计算只在生成帧时进行，运行时开销小
   - 支持预生成所有帧，适合动画播放

5. **灵活性**：
   - 支持任意数量的点和帧
   - 变换可以自由组合

### 4.2 缺点

1. **内存占用**：
   - 生成大量帧时会占用较多内存
   - 对于非常复杂的图形和大量帧，可能需要考虑按需生成

2. **复杂度**：
   - 对于简单需求可能显得过于复杂
   - 需要一定的学习成本

3. **扩展性限制**：
   - 当前设计主要针对静态变换，动态变换（如基于前一帧的变换）需要额外扩展

4. **缺少可视化**：
   - 设计本身不包含渲染功能，需要外部渲染器

## 5. 扩展建议

### 5.1 性能优化扩展

```typescript
/** 按需帧生成器 */
export class LazyFrameAnimationGenerator implements AnimationGenerator {
  constructor(
    private shapeGenerator: ShapeGenerator,
    private transformations: Transformation[]
  ) {}

  public generateFrame(frame: number, totalFrames: number): Point[] {
    const initialPoints = this.shapeGenerator.generatePoints();
    
    return initialPoints.map(point => {
      let transformedPoint = point;
      
      for (const transformation of this.transformations) {
        transformedPoint = transformation.apply(transformedPoint, frame, totalFrames);
      }
      
      return transformedPoint;
    });
  }
}
```

### 5.2 动态变换扩展

```typescript
/** 基于前一帧的动态变换 */
export interface DynamicTransformation {
  apply(point: Point, prevPoint: Point, frame: number, totalFrames: number): Point;
}

/** 动态动画生成器 */
export class DynamicAnimationGenerator implements AnimationGenerator {
  constructor(
    private shapeGenerator: ShapeGenerator,
    private dynamicTransformations: DynamicTransformation[]
  ) {}

  public generateFrames(totalFrames: number): Point[][] {
    const initialPoints = this.shapeGenerator.generatePoints();
    const frames: Point[][] = [initialPoints];

    for (let frame = 1; frame< totalFrames; frame++) {
      const prevFrame = frames[frame - 1];
      const currentFrame = initialPoints.map((point, index) =>{
        let transformedPoint = point;
        
        for (const transformation of this.dynamicTransformations) {
          transformedPoint = transformation.apply(
            transformedPoint, 
            prevFrame[index], 
            frame, 
            totalFrames
          );
        }
        
        return transformedPoint;
      });
      
      frames.push(currentFrame);
    }

    return frames;
  }
}
```

### 5.3 插值优化

```typescript
/** 缓动函数 */
export enum EasingFunction {
  LINEAR = 'linear',
  EASE_IN = 'easeIn',
  EASE_OUT = 'easeOut',
  EASE_IN_OUT = 'easeInOut',
  BOUNCE = 'bounce'
}

/** 带缓动的变换基类 */
export abstract class EasedTransformation implements Transformation {
  constructor(private easing: EasingFunction = EasingFunction.LINEAR) {}

  protected getProgress(frame: number, totalFrames: number): number {
    const linearProgress = frame / totalFrames;
    
    switch (this.easing) {
      case EasingFunction.EASE_IN:
        return linearProgress * linearProgress;
      case EasingFunction.EASE_OUT:
        return linearProgress * (2 - linearProgress);
      case EasingFunction.EASE_IN_OUT:
        return linearProgress< 0.5 
          ? 2 * linearProgress * linearProgress 
          : -1 + (4 - 2 * linearProgress) * linearProgress;
      case EasingFunction.BOUNCE:
        const n1 = 7.5625;
        const d1 = 2.75;
        if (linearProgress< 1 / d1) {
          return n1 * linearProgress * linearProgress;
        } else if (linearProgress < 2 / d1) {
          return n1 * (linearProgress -= 1.5 / d1) * linearProgress + 0.75;
        } else if (linearProgress< 2.5 / d1) {
          return n1 * (linearProgress -= 2.25 / d1) * linearProgress + 0.9375;
        } else {
          return n1 * (linearProgress -= 2.625 / d1) * linearProgress + 0.984375;
        }
      default:
        return linearProgress;
    }
  }

  public abstract apply(point: Point, frame: number, totalFrames: number): Point;
}
```

## 6. 总结

本设计提供了一个灵活、可扩展的TypeScript解决方案，用于生成二维点并创建动画变换。通过接口化设计和组合模式，系统具有良好的扩展性和可维护性。虽然存在一些局限性，但通过合理的扩展可以满足各种复杂的图形生成和动画需求。

该设计特别适合以下场景：
- 数据可视化动画
- 图形化逻辑演示
- 交互式图形应用
- 教育和学习工具

通过不断扩展新的图形生成器和变换类型，可以构建出更加丰富和复杂的视觉效果。