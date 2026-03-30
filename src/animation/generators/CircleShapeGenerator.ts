import { Point } from '../../geometry/Point';
import { Rectangle } from '../../geometry/Rectangle';
import { ShapeGenerator as ShapeGeneratorInterface } from '../interfaces';

/** 圆形图形生成器 */
export class CircleShapeGenerator implements ShapeGeneratorInterface {
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