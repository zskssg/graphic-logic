import { Point } from '../../geometry/Point';
import { Transformation as TransformationInterface } from '../interfaces';

/** 缓动函数枚举 */
export enum EasingFunction {
  LINEAR = 'linear',
  EASE_IN = 'easeIn',
  EASE_OUT = 'easeOut',
  EASE_IN_OUT = 'easeInOut',
  BOUNCE = 'bounce'
}

/** 带缓动的变换基类 */
export abstract class EasedTransformation implements TransformationInterface {
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
        let progress = linearProgress;
        if (progress< 1 / d1) {
          return n1 * progress * progress;
        } else if (progress < 2 / d1) {
          return n1 * (progress -= 1.5 / d1) * progress + 0.75;
        } else if (progress< 2.5 / d1) {
          return n1 * (progress -= 2.25 / d1) * progress + 0.9375;
        } else {
          return n1 * (progress -= 2.625 / d1) * progress + 0.984375;
        }
      default:
        return linearProgress;
    }
  }

  public abstract apply(point: Point, frame: number, totalFrames: number): Point;
}

/** 平移变换 */
export class TranslateTransformation extends EasedTransformation {
  constructor(
    private dx: number,
    private dy: number,
    easing: EasingFunction = EasingFunction.LINEAR
  ) {
    super(easing);
  }

  public apply(point: Point, frame: number, totalFrames: number): Point {
    const progress = this.getProgress(frame, totalFrames);
    return new Point(
      point.x + this.dx * progress,
      point.y + this.dy * progress
    );
  }
}

/** 旋转变换 */
export class RotateTransformation extends EasedTransformation {
  constructor(
    private center: Point,
    private angle: number,
    easing: EasingFunction = EasingFunction.LINEAR
  ) {
    super(easing);
  }

  public apply(point: Point, frame: number, totalFrames: number): Point {
    const progress = this.getProgress(frame, totalFrames);
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

/** 缩放变换 */
export class ScaleTransformation extends EasedTransformation {
  constructor(
    private center: Point,
    private scaleX: number,
    private scaleY: number,
    easing: EasingFunction = EasingFunction.LINEAR
  ) {
    super(easing);
  }

  public apply(point: Point, frame: number, totalFrames: number): Point {
    const progress = this.getProgress(frame, totalFrames);
    const scaleX = 1 + (this.scaleX - 1) * progress;
    const scaleY = 1 + (this.scaleY - 1) * progress;
    
    const dx = point.x - this.center.x;
    const dy = point.y - this.center.y;
    
    return new Point(
      this.center.x + dx * scaleX,
      this.center.y + dy * scaleY
    );
  }
}

/** 
 * 半径变换类
 * 用于实现圆形的动态半径变化效果
 * 通过保持角度不变，只改变半径来实现平滑的放大缩小效果
 */
export class RadiusTransformation extends EasedTransformation {
  /**
   * 构造函数
   * @param center 圆心坐标
   * @param startRadius 起始半径
   * @param endRadius 结束半径
   * @param easing 缓动函数类型
   */
  constructor(
    private center: Point,
    private startRadius: number,
    private endRadius: number,
    easing: EasingFunction = EasingFunction.LINEAR
  ) {
    super(easing);
  }

  /**
   * 应用变换到点
   * @param point 需要变换的点
   * @param frame 当前帧索引
   * @param totalFrames 总帧数
   * @returns 变换后的新点
   */
  public apply(point: Point, frame: number, totalFrames: number): Point {
    // 计算当前进度（0到1之间）
    const progress = this.getProgress(frame, totalFrames);
    
    // 根据进度计算当前半径
    const currentRadius = this.startRadius + (this.endRadius - this.startRadius) * progress;
    
    // 计算点相对于圆心的角度（保持角度不变）
    const dx = point.x - this.center.x;
    const dy = point.y - this.center.y;
    const angle = Math.atan2(dy, dx);
    
    // 根据新半径和原角度计算新位置
    return new Point(
      this.center.x + currentRadius * Math.cos(angle),
      this.center.y + currentRadius * Math.sin(angle)
    );
  }
}

/** 波浪变换 */
export class WaveTransformation extends EasedTransformation {
  constructor(
    private amplitude: number,
    private frequency: number,
    easing: EasingFunction = EasingFunction.LINEAR
  ) {
    super(easing);
  }

  public apply(point: Point, frame: number, totalFrames: number): Point {
    const progress = this.getProgress(frame, totalFrames);
    const wave = Math.sin(progress * 2 * Math.PI * this.frequency) * this.amplitude;
    
    return new Point(point.x, point.y + wave);
  }
}

/** 弹跳变换 */
export class BounceTransformation extends EasedTransformation {
  constructor(
    private amplitude: number,
    private frequency: number,
    easing: EasingFunction = EasingFunction.LINEAR
  ) {
    super(easing);
  }

  public apply(point: Point, frame: number, totalFrames: number): Point {
    const progress = this.getProgress(frame, totalFrames);
    const bounce = Math.abs(Math.sin(progress * 2 * Math.PI * this.frequency)) * this.amplitude;
    
    return new Point(point.x + bounce, point.y + bounce);
  }
}

/** 线性变换 */
export class LinearTransformation extends EasedTransformation {
  constructor(
    private startPoint: Point,
    private endPoint: Point,
    easing: EasingFunction = EasingFunction.LINEAR
  ) {
    super(easing);
  }

  public apply(point: Point, frame: number, totalFrames: number): Point {
    const progress = this.getProgress(frame, totalFrames);
    
    // 计算点相对于起始点的偏移
    const dx = point.x - this.startPoint.x;
    const dy = point.y - this.startPoint.y;
    
    // 计算目标位置的偏移
    const targetDx = this.endPoint.x - this.startPoint.x;
    const targetDy = this.endPoint.y - this.startPoint.y;
    
    // 线性插值计算新位置
    return new Point(
      this.startPoint.x + dx + targetDx * progress,
      this.startPoint.y + dy + targetDy * progress
    );
  }
}

/** 水波扩散变换 */
export class WaveSpreadTransformation extends EasedTransformation {
  constructor(
    private center: Point,
    private maxRadius: number,
    private frequency: number = 2,
    easing: EasingFunction = EasingFunction.EASE_OUT
  ) {
    super(easing);
  }

  public apply(point: Point, frame: number, totalFrames: number): Point {
    const progress = this.getProgress(frame, totalFrames);
    
    // 计算点到中心的距离
    const dx = point.x - this.center.x;
    const dy = point.y - this.center.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // 如果点在中心，保持不动
    if (distance< 0.001) {
      return point;
    }
    
    // 计算单位向量
    const unitX = dx / distance;
    const unitY = dy / distance;
    
    // 计算水波效果的偏移量
    // 使用正弦函数创建波动效果，离中心越远波动越大
    const waveIntensity = Math.sin(progress * Math.PI * this.frequency) * this.maxRadius;
    const spreadDistance = waveIntensity * (distance / this.maxRadius);
    
    // 计算新位置
    return new Point(
      point.x + unitX * spreadDistance,
      point.y + unitY * spreadDistance
    );
  }
}

/** 组合变换 */
export class CompositeTransformation implements TransformationInterface {
  constructor(private transformations: TransformationInterface[]) {}

  public apply(point: Point, frame: number, totalFrames: number): Point {
    let result = point;
    
    for (const transformation of this.transformations) {
      result = transformation.apply(result, frame, totalFrames);
    }
    
    return result;
  }
}