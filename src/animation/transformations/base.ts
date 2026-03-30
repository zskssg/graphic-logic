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
        if (progress < 1 / d1) {
          return n1 * progress * progress;
        } else if (progress< 2 / d1) {
          return n1 * (progress -= 1.5 / d1) * progress + 0.75;
        } else if (progress < 2.5 / d1) {
          return n1 * (progress -= 2.25 / d1) * progress + 0.9375;
        } else {
          return n1 * (progress -= 2.625 / d1) * progress + 0.984375;
        }
      default:
        return linearProgress;
    }
  }

  public abstract apply(point: Point, frame: number, totalFrames: number, _pointIndex?: number, _totalPoints?: number): Point;
}