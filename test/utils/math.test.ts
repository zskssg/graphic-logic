import { describe, it, expect } from 'vitest';
import {
  clamp,
  lerp,
  map,
  degreesToRadians,
  radiansToDegrees,
  distance,
  distanceSquared,
  angleBetween,
  normalizeAngle,
  random,
  randomInt,
  roundToPrecision,
  isPointInCircle,
  isPointInRectangle
} from '../../src/utils/math';

describe('math utilities', () => {
  describe('clamp', () => {
    it('should return value within range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });
  });

  describe('lerp', () => {
    it('should interpolate between values', () => {
      expect(lerp(0, 10, 0)).toBe(0);
      expect(lerp(0, 10, 1)).toBe(10);
      expect(lerp(0, 10, 0.5)).toBe(5);
      expect(lerp(10, 20, 0.5)).toBe(15);
    });

    it('should clamp t value', () => {
      expect(lerp(0, 10, -0.5)).toBe(0);
      expect(lerp(0, 10, 1.5)).toBe(10);
    });
  });

  describe('map', () => {
    it('should map value from one range to another', () => {
      expect(map(5, 0, 10, 0, 100)).toBe(50);
      expect(map(0, 0, 10, 0, 100)).toBe(0);
      expect(map(10, 0, 10, 0, 100)).toBe(100);
      expect(map(5, 0, 10, 100, 200)).toBe(150);
    });
  });

  describe('degreesToRadians', () => {
    it('should convert degrees to radians', () => {
      expect(degreesToRadians(0)).toBe(0);
      expect(degreesToRadians(90)).toBeCloseTo(Math.PI / 2, 10);
      expect(degreesToRadians(180)).toBeCloseTo(Math.PI, 10);
      expect(degreesToRadians(360)).toBeCloseTo(2 * Math.PI, 10);
    });
  });

  describe('radiansToDegrees', () => {
    it('should convert radians to degrees', () => {
      expect(radiansToDegrees(0)).toBe(0);
      expect(radiansToDegrees(Math.PI / 2)).toBeCloseTo(90, 10);
      expect(radiansToDegrees(Math.PI)).toBeCloseTo(180, 10);
      expect(radiansToDegrees(2 * Math.PI)).toBeCloseTo(360, 10);
    });
  });

  describe('distance', () => {
    it('should calculate distance between points', () => {
      expect(distance(0, 0, 3, 4)).toBe(5);
      expect(distance(0, 0, 0, 0)).toBe(0);
      expect(distance(1, 1, 4, 5)).toBe(5);
    });
  });

  describe('distanceSquared', () => {
    it('should calculate squared distance between points', () => {
      expect(distanceSquared(0, 0, 3, 4)).toBe(25);
      expect(distanceSquared(0, 0, 0, 0)).toBe(0);
      expect(distanceSquared(1, 1, 4, 5)).toBe(25);
    });
  });

  describe('angleBetween', () => {
    it('should calculate angle between points', () => {
      expect(angleBetween(0, 0, 1, 0)).toBe(0);
      expect(angleBetween(0, 0, 0, 1)).toBeCloseTo(Math.PI / 2, 10);
      expect(angleBetween(0, 0, -1, 0)).toBeCloseTo(Math.PI, 10);
      expect(angleBetween(0, 0, 0, -1)).toBeCloseTo(-Math.PI / 2, 10);
    });
  });

  describe('normalizeAngle', () => {
    it('should normalize angle to [0, 2π)', () => {
      expect(normalizeAngle(0)).toBe(0);
      expect(normalizeAngle(Math.PI)).toBeCloseTo(Math.PI, 10);
      expect(normalizeAngle(2 * Math.PI)).toBe(0);
      expect(normalizeAngle(-Math.PI)).toBeCloseTo(Math.PI, 10);
      expect(normalizeAngle(3 * Math.PI)).toBeCloseTo(Math.PI, 10);
    });
  });

  describe('random', () => {
    it('should generate random number within range', () => {
      const result = random(0, 10);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThan(10);
    });
  });

  describe('randomInt', () => {
    it('should generate random integer within range', () => {
      const result = randomInt(0, 10);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(10);
      expect(Number.isInteger(result)).toBe(true);
    });
  });

  describe('roundToPrecision', () => {
    it('should round to specified precision', () => {
      expect(roundToPrecision(1.2345, 2)).toBe(1.23);
      expect(roundToPrecision(1.235, 2)).toBe(1.24);
      expect(roundToPrecision(1.2345, 3)).toBe(1.235);
      expect(roundToPrecision(1.2, 0)).toBe(1);
    });
  });

  describe('isPointInCircle', () => {
    it('should check if point is in circle', () => {
      expect(isPointInCircle(0, 0, 0, 0, 5)).toBe(true);
      expect(isPointInCircle(3, 4, 0, 0, 5)).toBe(true);
      expect(isPointInCircle(6, 0, 0, 0, 5)).toBe(false);
    });
  });

  describe('isPointInRectangle', () => {
    it('should check if point is in rectangle', () => {
      expect(isPointInRectangle(5, 5, 0, 0, 10, 10)).toBe(true);
      expect(isPointInRectangle(0, 0, 0, 0, 10, 10)).toBe(true);
      expect(isPointInRectangle(10, 10, 0, 0, 10, 10)).toBe(true);
      expect(isPointInRectangle(-1, 5, 0, 0, 10, 10)).toBe(false);
      expect(isPointInRectangle(5, 11, 0, 0, 10, 10)).toBe(false);
    });
  });
});
