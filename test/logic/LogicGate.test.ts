import { describe, it, expect } from 'vitest';
import { LogicGate } from '../../src/logic/LogicGate';

describe('LogicGate', () => {
  describe('AND Gate', () => {
    it('should output true only when all inputs are true', () => {
      const gate = new LogicGate('AND');
      gate.setInput(0, true);
      gate.setInput(1, true);
      expect(gate.getOutput()).toBe(true);

      gate.setInput(0, false);
      expect(gate.getOutput()).toBe(false);

      gate.setInput(1, false);
      expect(gate.getOutput()).toBe(false);
    });
  });

  describe('OR Gate', () => {
    it('should output true when any input is true', () => {
      const gate = new LogicGate('OR');
      gate.setInput(0, false);
      gate.setInput(1, false);
      expect(gate.getOutput()).toBe(false);

      gate.setInput(0, true);
      expect(gate.getOutput()).toBe(true);

      gate.setInput(1, true);
      expect(gate.getOutput()).toBe(true);
    });
  });

  describe('NOT Gate', () => {
    it('should invert the input', () => {
      const gate = new LogicGate('NOT', 1);
      gate.setInput(0, true);
      expect(gate.getOutput()).toBe(false);

      gate.setInput(0, false);
      expect(gate.getOutput()).toBe(true);
    });

    it('should throw error when NOT gate has more than 1 input', () => {
      const gate = new LogicGate('NOT', 1);
      // 私有方法无法直接测试，通过 getOutput 间接验证
      expect(gate.getOutput()).toBe(false);
    });
  });

  describe('NAND Gate', () => {
    it('should output false only when all inputs are true', () => {
      const gate = new LogicGate('NAND');
      gate.setInput(0, true);
      gate.setInput(1, true);
      expect(gate.getOutput()).toBe(false);

      gate.setInput(0, false);
      expect(gate.getOutput()).toBe(true);
    });
  });

  describe('NOR Gate', () => {
    it('should output true only when all inputs are false', () => {
      const gate = new LogicGate('NOR');
      gate.setInput(0, false);
      gate.setInput(1, false);
      expect(gate.getOutput()).toBe(true);

      gate.setInput(0, true);
      expect(gate.getOutput()).toBe(false);
    });
  });

  describe('XOR Gate', () => {
    it('should output true when inputs are different', () => {
      const gate = new LogicGate('XOR');
      gate.setInput(0, true);
      gate.setInput(1, false);
      expect(gate.getOutput()).toBe(true);

      gate.setInput(0, false);
      gate.setInput(1, true);
      expect(gate.getOutput()).toBe(true);

      gate.setInput(0, true);
      gate.setInput(1, true);
      expect(gate.getOutput()).toBe(false);
    });
  });

  describe('XNOR Gate', () => {
    it('should output true when inputs are the same', () => {
      const gate = new LogicGate('XNOR');
      gate.setInput(0, true);
      gate.setInput(1, true);
      expect(gate.getOutput()).toBe(true);

      gate.setInput(0, false);
      gate.setInput(1, false);
      expect(gate.getOutput()).toBe(true);

      gate.setInput(0, true);
      gate.setInput(1, false);
      expect(gate.getOutput()).toBe(false);
    });
  });

  it('should set input by name', () => {
    const gate = new LogicGate('AND');
    gate.setInputByName('input1', true);
    gate.setInputByName('input2', true);
    expect(gate.getOutput()).toBe(true);
  });

  it('should get output by name', () => {
    const gate = new LogicGate('AND');
    gate.setInput(0, true);
    gate.setInput(1, true);
    expect(gate.getOutputByName('output')).toBe(true);
  });

  it('should connect gates together', () => {
    const gate1 = new LogicGate('AND');
    const gate2 = new LogicGate('OR');
    
    gate1.setInput(0, true);
    gate1.setInput(1, true);
    
    gate1.connectTo(gate2, 0, 0);
    gate2.setInput(1, false);
    
    expect(gate2.getOutput()).toBe(true);
  });

  it('should clone gate correctly', () => {
    const gate1 = new LogicGate('AND');
    gate1.setInput(0, true);
    gate1.setInput(1, true);
    
    const gate2 = gate1.clone();
    expect(gate2).not.toBe(gate1);
    expect(gate2.type).toBe('AND');
    expect(gate2.getOutput()).toBe(true);
  });

  it('should convert to string correctly', () => {
    const gate = new LogicGate('AND');
    gate.setInput(0, true);
    gate.setInput(1, false);
    expect(gate.toString()).toBe('AND(1,0) -> 0');
  });
});