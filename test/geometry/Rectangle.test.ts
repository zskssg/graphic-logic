import { describe, it, expect } from 'vitest';
import { Rectangle } from '../../src/geometry/Rectangle';
import { Point } from '../../src/geometry/Point';

describe('Rectangle', () => {
  it('should create a rectangle with correct properties', () => {
    const rect = new Rectangle(10, 20, 30, 40);
    
    expect(rect.x).toBe(10);
    expect(rect.y).toBe(20);
    expect(rect.width).toBe(30);
    expect(rect.height).toBe(40);
  });

  it('should calculate boundaries correctly', () => {
    const rect = new Rectangle(10, 20, 30, 40);
    
    expect(rect.left).toBe(10);
    expect(rect.top).toBe(20);
    expect(rect.right).toBe(40);
    expect(rect.bottom).toBe(60);
  });

  it('should calculate center correctly', () => {
    const rect = new Rectangle(10, 20, 30, 40);
    const center = rect.center;
    
    expect(center.x).toBe(25);
    expect(center.y).toBe(40);
  });

  it('should calculate area correctly', () => {
    const rect = new Rectangle(0, 0, 5, 10);
    
    expect(rect.area).toBe(50);
  });

  it('should check if point is inside rectangle', () => {
    const rect = new Rectangle(10, 20, 30, 40);
    
    expect(rect.contains(new Point(25, 40))).toBe(true); // 中心点
    expect(rect.contains(new Point(10, 20))).toBe(true); // 左上角
    expect(rect.contains(new Point(40, 60))).toBe(true); // 右下角
    expect(rect.contains(new Point(15, 25))).toBe(true); // 内部点
    expect(rect.contains(new Point(5, 25))).toBe(false); // 外部点
    expect(rect.contains(new Point(25, 15))).toBe(false); // 外部点
  });

  it('should check if rectangles intersect', () => {
    const rect1 = new Rectangle(0, 0, 10, 10);
    
    // 相交的矩形
    const rect2 = new Rectangle(5, 5, 10, 10);
    expect(rect1.intersects(rect2)).toBe(true);
    
    // 不相交的矩形
    const rect3 = new Rectangle(15, 15, 10, 10);
    expect(rect1.intersects(rect3)).toBe(false);
    
    // 包含的矩形
    const rect4 = new Rectangle(2, 2, 6, 6);
    expect(rect1.intersects(rect4)).toBe(true);
    
    // 边接触的矩形
    const rect5 = new Rectangle(10, 0, 10, 10);
    expect(rect1.intersects(rect5)).toBe(true);
  });

  it('should check if rectangle intersects circle', () => {
    const rect = new Rectangle(0, 0, 10, 10);
    
    // 圆在矩形内
    expect(rect.intersectsCircle(new Point(5, 5), 2)).toBe(true);
    
    // 圆与矩形相交
    expect(rect.intersectsCircle(new Point(12, 5), 3)).toBe(true);
    
    // 圆与矩形相切
    expect(rect.intersectsCircle(new Point(10, 5), 0)).toBe(true);
    
    // 圆在矩形外
    expect(rect.intersectsCircle(new Point(20, 20), 5)).toBe(false);
  });

  it('should calculate union rectangle', () => {
    const rect1 = new Rectangle(0, 0, 10, 10);
    const rect2 = new Rectangle(5, 5, 10, 10);
    
    const union = rect1.union(rect2);
    
    expect(union.x).toBe(0);
    expect(union.y).toBe(0);
    expect(union.width).toBe(15);
    expect(union.height).toBe(15);
  });

  it('should clone rectangle correctly', () => {
    const rect1 = new Rectangle(10, 20, 30, 40);
    const rect2 = rect1.clone();
    
    expect(rect2).not.toBe(rect1);
    expect(rect2.x).toBe(10);
    expect(rect2.y).toBe(20);
    expect(rect2.width).toBe(30);
    expect(rect2.height).toBe(40);
  });

  it('should convert to string correctly', () => {
    const rect = new Rectangle(10, 20, 30, 40);
    
    expect(rect.toString()).toBe('Rectangle(10, 20, 30, 40)');
  });
});
