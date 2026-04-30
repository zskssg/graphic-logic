import type { LogicGateType, LogicGateInput, LogicGateOutput } from '../types';

/** 逻辑门类 */
export class LogicGate {
  private _type: LogicGateType; // 逻辑门类型
  private _inputs: LogicGateInput[]; // 输入数组
  private _outputs: LogicGateOutput[]; // 输出数组

  /**
   * 创建一个逻辑门
   * @param type 逻辑门类型
   * @param inputCount 输入数量（默认为2）
   */
  constructor(type: LogicGateType, inputCount: number = 2) {
    this._type = type;
    this._inputs = Array.from({ length: inputCount }, (_, index) => ({
      value: false,
      name: `input${index + 1}`
    }));
    this._outputs = [{ value: false, name: 'output' }];
  }

  /** 获取逻辑门类型 */
  public get type(): LogicGateType {
    return this._type;
  }

  /** 获取输入列表（只读） */
  public get inputs(): readonly LogicGateInput[] {
    return [...this._inputs];
  }

  /** 获取输出列表（只读） */
  public get outputs(): readonly LogicGateOutput[] {
    return [...this._outputs];
  }

  /**
   * 设置输入值
   * @param index 输入索引
   * @param value 输入值
   * @throws 当索引超出范围时抛出错误
   */
  public setInput(index: number, value: boolean): void {
    if (index < 0 || index >= this._inputs.length) {
      throw new Error(`Input index ${index} out of bounds`);
    }
    const input = this._inputs[index];
    if (input) {
      input.value = value;
      this.updateOutput();
    }
  }

  /**
   * 通过名称设置输入值
   * @param name 输入名称
   * @param value 输入值
   * @throws 当找不到指定名称的输入时抛出错误
   */
  public setInputByName(name: string, value: boolean): void {
    const index = this._inputs.findIndex(input => input.name === name);
    if (index === -1) {
      throw new Error(`Input with name "${name}" not found`);
    }
    this.setInput(index, value);
  }

  /**
   * 获取输出值
   * @param index 输出索引（默认为0）
   * @returns 输出值
   * @throws 当索引超出范围时抛出错误
   */
  public getOutput(index: number = 0): boolean {
    if (index < 0 || index >= this._outputs.length) {
      throw new Error(`Output index ${index} out of bounds`);
    }
    const output = this._outputs[index];
    if (output) {
      return output.value;
    }
    return false;
  }

  /**
   * 通过名称获取输出值
   * @param name 输出名称
   * @returns 输出值
   * @throws 当找不到指定名称的输出时抛出错误
   */
  public getOutputByName(name: string): boolean {
    const output = this._outputs.find(output => output.name === name);
    if (!output) {
      throw new Error(`Output with name "${name}" not found`);
    }
    return output.value;
  }

  /** 更新输出值（内部方法） */
  private updateOutput(): void {
    const inputValues = this._inputs.map(input => input.value);
    let result: boolean;

    switch (this._type) {
      case 'AND':
        result = inputValues.every(value => value);
        break;
      case 'OR':
        result = inputValues.some(value => value);
        break;
      case 'NOT':
        if (inputValues.length !== 1) {
          throw new Error('NOT gate requires exactly 1 input');
        }
        result = !inputValues[0];
        break;
      case 'NAND':
        result = !inputValues.every(value => value);
        break;
      case 'NOR':
        result = !inputValues.some(value => value);
        break;
      case 'XOR':
        if (inputValues.length !== 2) {
          throw new Error('XOR gate requires exactly 2 inputs');
        }
        result = inputValues[0] !== inputValues[1];
        break;
      case 'XNOR':
        if (inputValues.length !== 2) {
          throw new Error('XNOR gate requires exactly 2 inputs');
        }
        result = inputValues[0] === inputValues[1];
        break;
      default:
        throw new Error(`Unknown gate type: ${this._type}`);
    }

    const output = this._outputs[0];
    if (output) {
      output.value = result;
    }
  }

  /**
   * 将当前逻辑门的输出连接到另一个逻辑门的输入
   * @param other 目标逻辑门
   * @param outputIndex 当前逻辑门的输出索引（默认为0）
   * @param inputIndex 目标逻辑门的输入索引（默认为0）
   */
  public connectTo(other: LogicGate, outputIndex: number = 0, inputIndex: number = 0): void {
    const outputValue = this.getOutput(outputIndex);
    other.setInput(inputIndex, outputValue);
  }

  /**
   * 克隆逻辑门
   * @returns 新的LogicGate实例
   */
  public clone(): LogicGate {
    const gate = new LogicGate(this._type, this._inputs.length);
    this._inputs.forEach((input, index) => {
      gate.setInput(index, input.value);
    });
    return gate;
  }

  /**
   * 转换为字符串
   * @returns 字符串表示
   */
  public toString(): string {
    const inputValues = this._inputs.map(input => input.value ? '1' : '0').join(',');
    const output = this._outputs[0];
    const outputValue = output ? (output.value ? '1' : '0') : '0';
    return `${this._type}(${inputValues}) -> ${outputValue}`;
  }
}