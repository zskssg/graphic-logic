import { TransitionConditionInterface } from './interfaces';

/**
 * 总是为true的条件
 */
export class AlwaysTrueCondition implements TransitionConditionInterface {
  /**
   * 检查是否可以转换到目标状态
   * @param _context 状态机上下文（未使用）
   * @returns 总是返回true
   */
  public canTransition(_context: any): boolean {
    return true;
  }
}

/**
 * 总是为false的条件
 */
export class AlwaysFalseCondition implements TransitionConditionInterface {
  /**
   * 检查是否可以转换到目标状态
   * @param _context 状态机上下文（未使用）
   * @returns 总是返回false
   */
  public canTransition(_context: any): boolean {
    return false;
  }
}

/**
 * 基于时间的条件
 */
export class TimeCondition implements TransitionConditionInterface {
  private elapsedTime: number = 0;
  private duration: number;

  /**
   * 构造函数
   * @param duration 持续时间（毫秒）
   */
  constructor(duration: number) {
    this.duration = duration;
  }

  /**
   * 检查是否可以转换到目标状态
   * @param context 状态机上下文
   * @returns 是否达到指定时间
   */
  public canTransition(context: any): boolean {
    if (!context.deltaTime) {
      return false;
    }

    // 假设deltaTime是秒，转换为毫秒
    this.elapsedTime += context.deltaTime * 1000;
    return this.elapsedTime >= this.duration;
  }

  /**
   * 重置时间计数器
   */
  public reset(): void {
    this.elapsedTime = 0;
  }
}

/**
 * 基于属性值的条件
 */
export class PropertyCondition implements TransitionConditionInterface {
  private propertyName: string;
  private expectedValue: any;
  private comparator: (actual: any, expected: any) => boolean;

  /**
   * 构造函数
   * @param propertyName 属性名称
   * @param expectedValue 期望的属性值
   * @param comparator 比较函数（默认为相等比较）
   */
  constructor(
    propertyName: string,
    expectedValue: any,
    comparator: (actual: any, expected: any) => boolean = (a, b) => a === b
  ) {
    this.propertyName = propertyName;
    this.expectedValue = expectedValue;
    this.comparator = comparator;
  }

  /**
   * 检查是否可以转换到目标状态
   * @param context 状态机上下文
   * @returns 属性值是否满足条件
   */
  public canTransition(context: any): boolean {
    const actualValue = context[this.propertyName];
    return this.comparator(actualValue, this.expectedValue);
  }
}

/**
 * 复合条件（逻辑AND）
 */
export class AndCondition implements TransitionConditionInterface {
  private conditions: TransitionConditionInterface[];

  /**
   * 构造函数
   * @param conditions 条件数组
   */
  constructor(...conditions: TransitionConditionInterface[]) {
    this.conditions = conditions;
  }

  /**
   * 检查是否可以转换到目标状态
   * @param context 状态机上下文
   * @returns 所有条件是否都满足
   */
  public canTransition(context: any): boolean {
    return this.conditions.every(condition => condition.canTransition(context));
  }
}

/**
 * 复合条件（逻辑OR）
 */
export class OrCondition implements TransitionConditionInterface {
  private conditions: TransitionConditionInterface[];

  /**
   * 构造函数
   * @param conditions 条件数组
   */
  constructor(...conditions: TransitionConditionInterface[]) {
    this.conditions = conditions;
  }

  /**
   * 检查是否可以转换到目标状态
   * @param context 状态机上下文
   * @returns 任意条件是否满足
   */
  public canTransition(context: any): boolean {
    return this.conditions.some(condition => condition.canTransition(context));
  }
}

/**
 * 否定条件
 */
export class NotCondition implements TransitionConditionInterface {
  private condition: TransitionConditionInterface;

  /**
   * 构造函数
   * @param condition 要否定的条件
   */
  constructor(condition: TransitionConditionInterface) {
    this.condition = condition;
  }

  /**
   * 检查是否可以转换到目标状态
   * @param context 状态机上下文
   * @returns 条件的否定结果
   */
  public canTransition(context: any): boolean {
    return !this.condition.canTransition(context);
  }
}