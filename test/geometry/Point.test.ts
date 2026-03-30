import { describe, it, expect } from 'vitest';
import { Point } from '../../src/geometry/Point';

describe('Point', () => {
  it('should create a point with correct coordinates', () => {
    const point = new Point(10, 20);
    expect(point.x).toBe(10);
    expect(point.y).toBe(20);
  });

  it('should create a point from object', () => {
    const point = Point.fromObject({ x: 5, y: 15 });
    expect(point.x).toBe(5);
    expect(point.y).toBe(15);
  });

  it('should calculate distance between points', () => {
    const point1 = new Point(0, 0);
    const point2 = new Point(3, 4);
    expect(point1.distanceTo(point2)).toBe(5);
  });

  it('should calculate squared distance between points', () => {
    const point1 = new Point(0, 0);
    const point2 = new Point(3, 4);
    expect(point1.distanceToSquared(point2)).toBe(25);
  });

  it('should add vectors correctly', () => {
    const point = new Point(1, 2);
    const result = point.add({ x: 3, y: 4 });
    expect(result.x).toBe(4);
    expect(result.y).toBe(6);
  });

  it('should subtract vectors correctly', () => {
    const point = new Point(5, 10);
    const result = point.subtract({ x: 3, y: 4 });
    expect(result.x).toBe(2);
    expect(result.y).toBe(6);
  });

  it('should multiply by scalar correctly', () => {
    const point = new Point(2, 3);
    const result = point.multiply(2);
    expect(result.x).toBe(4);
    expect(result.y).toBe(6);
  });

  it('should divide by scalar correctly', () => {
    const point = new Point(4, 6);
    const result = point.divide(2);
    expect(result.x).toBe(2);
    expect(result.y).toBe(3);
  });

  it('should throw error when dividing by zero', () => {
    const point = new Point(4, 6);
    expect(() => point.divide(0)).toThrow('Division by zero');
  });

  it('should check equality correctly', () => {
    const point1 = new Point(10, 20);
    const point2 = new Point(10, 20);
    const point3 = new Point(20, 30);
    expect(point1.equals(point2)).toBe(true);
    expect(point1.equals(point3)).toBe(false);
  });

  it('should clone point correctly', () => {
    const point1 = new Point(10, 20);
    const point2 = point1.clone();
    expect(point2).not.toBe(point1);
    expect(point2.x).toBe(10);
    expect(point2.y).toBe(20);
  });

  it('should convert to object correctly', () => {
    const point = new Point(10, 20);
    const obj = point.toObject();
    expect(obj).toEqual({ x: 10, y: 20 });
  });

  it('should convert to string correctly', () => {
    const point = new Point(10, 20);
    expect(point.toString()).toBe('Point(10, 20)');
  });
});