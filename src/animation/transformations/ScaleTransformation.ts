import { Point } from '../../geometry/Point';
import { EasedTransformation, EasingFunction } from './base';

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

  public apply(point: Point, frame: number, totalFrames: number, _pointIndex?: number, _totalPoints?: number): Point {
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