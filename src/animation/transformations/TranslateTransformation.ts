import { Point } from '../../geometry/Point';
import { EasedTransformation, EasingFunction } from './base';

/** 平移变换 */
export class TranslateTransformation extends EasedTransformation {
  constructor(
    private dx: number,
    private dy: number,
    easing: EasingFunction = EasingFunction.LINEAR
  ) {
    super(easing);
  }

  public apply(point: Point, frame: number, totalFrames: number, _pointIndex?: number, _totalPoints?: number): Point {
    const progress = this.getProgress(frame, totalFrames);
    return new Point(
      point.x + this.dx * progress,
      point.y + this.dy * progress
    );
  }
}