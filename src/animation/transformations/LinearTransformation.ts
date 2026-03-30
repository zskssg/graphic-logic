import { Point } from '../../geometry/Point';
import { EasedTransformation, EasingFunction } from './base';

/** 线性变换 */
export class LinearTransformation extends EasedTransformation {
  constructor(
    private startPoint: Point,
    private endPoint: Point,
    easing: EasingFunction = EasingFunction.LINEAR
  ) {
    super(easing);
  }

  public apply(point: Point, frame: number, totalFrames: number, _pointIndex?: number, _totalPoints?: number): Point {
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