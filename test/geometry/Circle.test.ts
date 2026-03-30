import { describe, it, expect } from 'vitest';
import { Circle } from '../../src/geometry/Circle';
import { Point } from '../../src/geometry/Point';

describe('Circle', () => {
  it('should create a circle with correct properties', () => {
    const center = new Point(10, 20);
    const circle = new Circle(center, 5);
    
    expect(circle.center).toBe(center);
    expect(circle.radius).toBe(5);
  });

  it('should throw error when radius is not positive', () => {
    const center = new Point(10, 20);
    
    expect(() => new Circle(center, 0)).toThrow('Radius must be positive');
    expect(() => new Circle(center, -5)).toThrow('Radius must be positive');
  });

  it('should calculate circumference correctly', () => {
    const center = new Point(0, 0);
    const circle = new Circle(center, 5);
    
    expect(circle.circumference).toBeCloseTo(31.4159, 4);
  });

  it('should calculate area correctly', () => {
    const center = new Point(0, 0);
    const circle = new Circle(center, 5);
    
    expect(circle.area).toBeCloseTo(78.5398, 4);
  });

  it('should check if point is inside circle', () => {
    const center = new Point(10, 10);
    const circle = new Circle(center, 5);
    
    expect(circle.contains(new Point(10, 10))).toBe(true); // 圆心
    expect(circle.contains(new Point(13, 10))).toBe(true); // 圆内
    expect(circle.contains(new Point(15, 10))).toBe(true); // 圆上
    expect(circle.contains(new Point(16, 10))).toBe(false); // 圆外
  });

  it('should check if two circles intersect', () => {
    const circle1 = new Circle(new Point(0, 0), 5);
    
    // 相交
    const circle2 = new Circle(new Point(8, 0), 5);
    expect(circle1.intersects(circle2)).toBe(true);
    
    // 相切
    const circle3 = new Circle(new Point(10, 0), 5);
    expect(circle1.intersects(circle3)).toBe(true);
    
    // 不相交
    const circle4 = new Circle(new Point(12, 0), 5);
    expect(circle1.intersects(circle4)).toBe(false);
    
    // 包含（边界不相交）
    const circle5 = new Circle(new Point(0, 0), 2);
    expect(circle1.intersects(circle5)).toBe(false);
  });

  it('should check if circle intersects line', () => {
    const circle = new Circle(new Point(5, 5), 3);
    
    // 相交的线
    const line1 = { start: new Point(0, 5), end: new Point(10, 5) };
    expect(circle.intersectsLine(line1)).toBe(true);
    
    // 相切的线
    const line2 = { start: new Point(0, 8), end: new Point(10, 8) };
    expect(circle.intersectsLine(line2)).toBe(true);
    
    // 不相交的线
    const line3 = { start: new Point(0, 10), end: new Point(10, 10) };
    expect(circle.intersectsLine(line3)).toBe(false);
    
    // 端点在圆上的线
    const line4 = { start: new Point(5, 8), end: new Point(10, 10) };
    expect(circle.intersectsLine(line4)).toBe(true);
  });

  it('should get tangent points from external point', () => {
    const circle = new Circle(new Point(0, 0), 5);
    
    // 外部点
    const externalPoint = new Point(10, 0);
    const tangentPoints = circle.getTangentPoints(externalPoint);
    
    expect(tangentPoints).not.toBeNull();
    if (tangentPoints) {
      expect(tangentPoints.length).toBe(2);
      // 检查切点到圆心的距离是否等于半径
      expect(tangentPoints[0].distanceTo(circle.center)).toBeCloseTo(5, 4);
      expect(tangentPoints[1].distanceTo(circle.center)).toBeCloseTo(5, 4);
    }
    
    // 圆上的点
    const onCirclePoint = new Point(5, 0);
    expect(circle.getTangentPoints(onCirclePoint)).toBeNull();
    
    // 圆内的点
    const insidePoint = new Point(2, 0);
    expect(circle.getTangentPoints(insidePoint)).toBeNull();
  });

  it('should clone circle correctly', () => {
    const center = new Point(10, 20);
    const circle1 = new Circle(center, 5);
    const circle2 = circle1.clone();
    
    expect(circle2).not.toBe(circle1);
    expect(circle2.center).not.toBe(circle1.center);
    expect(circle2.center.x).toBe(10);
    expect(circle2.center.y).toBe(20);
    expect(circle2.radius).toBe(5);
  });

  it('should convert to string correctly', () => {
    const center = new Point(10, 20);
    const circle = new Circle(center, 5);
    
    expect(circle.toString()).toBe('Circle(Point(10, 20), 5)');
  });
});
