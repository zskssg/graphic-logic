import { Point } from '../../geometry/Point';
import { Rectangle } from '../../geometry/Rectangle';
import { ShapeGenerator as ShapeGeneratorInterface } from '../interfaces';

/** 矩形图形生成器 */
export class RectangleShapeGenerator implements ShapeGeneratorInterface {
  constructor(
    private topLeft: Point,
    private width: number,
    private height: number,
    private pointCount: number
  ) {}

  public generatePoints(): Point[] {
    const points: Point[] = [];
    const edgePoints = Math.floor(this.pointCount / 4);
    
    if (edgePoints < 2) {
      return points;
    }
    
    // 上边
    for (let i = 0; i < edgePoints; i++) {
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