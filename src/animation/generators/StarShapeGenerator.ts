import { Point } from '../../geometry/Point';
import { Rectangle } from '../../geometry/Rectangle';
import { ShapeGenerator as ShapeGeneratorInterface } from '../interfaces';

/** 星形图形生成器 */
export class StarShapeGenerator implements ShapeGeneratorInterface {
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