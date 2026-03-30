import { describe, it, expect } from 'vitest';
import { Line } from '../../src/geometry/Line';
import { Point } from '../../src/geometry/Point';

describe('Line', () => {
  it('should create a line with correct properties', () => {
    const start = new Point(10, 20);
    const end = new Point(30, 40);
    const line = new Line(start, end);
    
    expect(line.start).toBe(start);
    expect(line.end).toBe(end);
  });

  it('should calculate length correctly', () => {
    const line = new Line(new Point(0, 0), new Point(3, 4));
    
    expect(line.length).toBe(5);
  });

  it('should calculate midpoint correctly', () => {
    const line = new Line(new Point(0, 0), new Point(2, 4));
    const midpoint = line.midpoint;
    
    expect(midpoint.x).toBe(1);
    expect(midpoint.y).toBe(2);
  });

  it('should calculate slope correctly', () => {
    const line1 = new Line(new Point(0, 0), new Point(2, 4));
    expect(line1.slope).toBe(2);
    
    const line2 = new Line(new Point(0, 0), new Point(4, 2));
    expect(line2.slope).toBe(0.5);
    
    const line3 = new Line(new Point(0, 0), new Point(0, 5));
    expect(line3.slope).toBeUndefined();
  });

  it('should check if lines intersect', () => {
    const line1 = new Line(new Point(0, 0), new Point(2, 2));
    const line2 = new Line(new Point(0, 2), new Point(2, 0));
    
    const intersection = line1.intersects(line2);
    
    expect(intersection).not.toBeNull();
    if (intersection) {
      expect(intersection.x).toBe(1);
      expect(intersection.y).toBe(1);
    }
    
    // 不相交的线
    const line3 = new Line(new Point(0, 0), new Point(1, 1));
    const line4 = new Line(new Point(2, 2), new Point(3, 3));
    expect(line3.intersects(line4)).toBeNull();
    
    // 平行的线
    const line5 = new Line(new Point(0, 0), new Point(2, 0));
    const line6 = new Line(new Point(0, 1), new Point(2, 1));
    expect(line5.intersects(line6)).toBeNull();
  });

  it('should check if point is on line', () => {
    const line = new Line(new Point(0, 0), new Point(4, 4));
    
    expect(line.contains(new Point(2, 2))).toBe(true); // 线段中点
    expect(line.contains(new Point(0, 0))).toBe(true); // 起点
    expect(line.contains(new Point(4, 4))).toBe(true); // 终点
    expect(line.contains(new Point(1, 1))).toBe(true); // 线段上的点
    expect(line.contains(new Point(5, 5))).toBe(false); // 线段外的点
    expect(line.contains(new Point(1, 2))).toBe(false); // 不在线段上的点
  });

  it('should handle floating point precision correctly', () => {
    const line = new Line(new Point(0, 0), new Point(1, 1));
    const point = new Point(0.5, 0.5);
    
    expect(line.contains(point)).toBe(true);
  });

  it('should clone line correctly', () => {
    const start = new Point(10, 20);
    const end = new Point(30, 40);
    const line1 = new Line(start, end);
    const line2 = line1.clone();
    
    expect(line2).not.toBe(line1);
    expect(line2.start).not.toBe(line1.start);
    expect(line2.end).not.toBe(line1.end);
    expect(line2.start.x).toBe(10);
    expect(line2.start.y).toBe(20);
    expect(line2.end.x).toBe(30);
    expect(line2.end.y).toBe(40);
  });

  it('should convert to string correctly', () => {
    const line = new Line(new Point(10, 20), new Point(30, 40));
    
    expect(line.toString()).toBe('Line(Point(10, 20), Point(30, 40))');
  });
});
