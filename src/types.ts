/** 二维点坐标接口 */
export interface Point2D {
  x: number; // x坐标
  y: number; // y坐标
}

/** 二维向量接口 */
export interface Vector2D {
  x: number; // x分量
  y: number; // y分量
}

/** 逻辑门类型 */
export type LogicGateType = 'AND' | 'OR' | 'NOT' | 'NAND' | 'NOR' | 'XOR' | 'XNOR';

/** 逻辑门输入接口 */
export interface LogicGateInput {
  value: boolean; // 输入值
  name?: string; // 输入名称（可选）
}

/** 逻辑门输出接口 */
export interface LogicGateOutput {
  value: boolean; // 输出值
  name?: string; // 输出名称（可选）
}