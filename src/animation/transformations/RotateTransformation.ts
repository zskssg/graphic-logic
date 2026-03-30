import { Point } from '../../geometry/Point';
import { EasedTransformation, EasingFunction } from './base';

/** 旋转变换 */
export class RotateTransformation extends EasedTransformation {
  constructor(
    private center: Point,
    private angle: number,
    easing: EasingFunction = EasingFunction.LINEAR
  ) {
    super(easing);
  }

  public apply(point: Point, frame: number, totalFrames: number, _pointIndex?: number, _totalPoints?: number): Point {
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