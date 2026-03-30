import { Point } from '../../geometry/Point';
import { Rectangle } from '../../geometry/Rectangle';
import { ShapeGenerator as ShapeGeneratorInterface } from '../interfaces';

/** 
 * 多边形图形生成器
 * 用于生成正多边形或自定义多边形排列的点集合
 * 支持正多边形和自定义顶点多边形
 */
export class PolygonShapeGenerator implements ShapeGeneratorInterface {
  /**
   * 构造函数
   * @param center 中心点坐标
   * @param radius 外接圆半径
   * @param sides 边数（正多边形）
   * @param vertices 自定义顶点数组（如果提供则忽略radius和sides）
   * @param pointCount 点的数量
   * @param rotationAngle 旋转角度（弧度）
   */
  constructor(
    private center: Point,
    private radius: number = 100,
    private sides: number = 6,
    private vertices: Point[] = [],
    private pointCount: number = 32,
    private rotationAngle: number = 0
  ) {
    // 确保边数至少为3
    this.sides = Math.max(3, this.sides);
  }

  /**
   * 生成多边形排列的点集合
   * @returns 多边形上均匀分布的点数组
   */
  public generatePoints(): Point[] {
    const points: Point[] = [];
    
    // 确保点数至少为3
    const safePointCount = Math.max(3, this.pointCount);
    
    // 如果提供了自定义顶点，使用自定义顶点
    let polygonVertices: Point[];
    if (this.vertices.length >= 3) {
      polygonVertices = this.vertices;
    } else {
      polygonVertices = this.generateRegularPolygonVertices();
    }
    
    // 所有点都分布在多边形边上
    const pointsPerEdge = Math.max(2, Math.floor(safePointCount / polygonVertices.length));
    
    // 生成多边形边上的点（边界）
    this.generateEdgePoints(polygonVertices, pointsPerEdge, points);
    
    return points;
  }

  /**
   * 生成正多边形的顶点
   * @returns 正多边形顶点数组
   */
  private generateRegularPolygonVertices(): Point[] {
    const vertices: Point[] = [];
    const angleStep = (2 * Math.PI) / this.sides;
    
    for (let i = 0; i< this.sides; i++) {
      const angle = this.rotationAngle + i * angleStep;
      const x = this.center.x + this.radius * Math.cos(angle);
      const y = this.center.y + this.radius * Math.sin(angle);
      vertices.push(new Point(x, y));
    }
    
    return vertices;
  }

  /**
   * 生成多边形边上的点
   * @param vertices 顶点数组
   * @param edgePointsPerSide 每条边的点数
   * @param points 点集合
   */
  private generateEdgePoints(vertices: Point[], edgePointsPerSide: number, points: Point[]): void {
    for (let i = 0; i< vertices.length; i++) {
      const start = vertices[i]!;
      const end = vertices[(i + 1) % vertices.length]!;
      
      for (let j = 0; j < edgePointsPerSide; j++) {
        const t = j / (edgePointsPerSide - 1);
        const x = start.x + (end.x - start.x) * t;
        const y = start.y + (end.y - start.y) * t;
        points.push(new Point(x, y));
      }
    }
  }



  /**
   * 获取多边形的边界矩形
   * @returns 包围多边形的最小矩形
   */
  public getBoundingBox(): Rectangle {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    
    // 如果有自定义顶点，使用自定义顶点
    let vertices: Point[];
    if (this.vertices.length >= 3) {
      vertices = this.vertices;
    } else {
      vertices = this.generateRegularPolygonVertices();
    }
    
    for (const vertex of vertices) {
      minX = Math.min(minX, vertex.x);
      maxX = Math.max(maxX, vertex.x);
      minY = Math.min(minY, vertex.y);
      maxY = Math.max(maxY, vertex.y);
    }
    
    return new Rectangle(minX, minY, maxX - minX, maxY - minY);
  }

  /**
   * 设置外接圆半径
   * @param radius 外接圆半径
   */
  public setRadius(radius: number): void {
    this.radius = radius;
  }

  /**
   * 设置边数
   * @param sides 边数
   */
  public setSides(sides: number): void {
    this.sides = Math.max(3, sides);
  }

  /**
   * 设置自定义顶点
   * @param vertices 顶点数组
   */
  public setVertices(vertices: Point[]): void {
    if (vertices.length >= 3) {
      this.vertices = vertices;
    }
  }

  /**
   * 设置旋转角度
   * @param rotationAngle 旋转角度（弧度）
   */
  public setRotationAngle(rotationAngle: number): void {
    this.rotationAngle = rotationAngle;
  }



  /**
   * 设置点数
   * @param pointCount 点数
   */
  public setPointCount(pointCount: number): void {
    this.pointCount = Math.max(3, pointCount);
  }
}