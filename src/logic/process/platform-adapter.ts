/**
 * 平台适配层
 * 提供环境检测和平台兼容性支持
 */

/**
 * 全局对象类型定义
 */
declare global {
  interface Window {
    cc?: any;
    Unity?: any;
    __VITEST__?: boolean;
  }
}

/**
 * 检测是否为测试环境
 * @returns 是否为测试环境
 */
export const isTestEnvironment = (): boolean => {
  try {
    // 在浏览器环境中检查Vitest
    if (typeof window !== 'undefined') {
      return (window as any).__VITEST__ !== undefined;
    }
    
    // 检查是否存在测试环境标记
    return (globalThis as any).VITEST !== undefined || 
           (globalThis as any).__VITEST__ !== undefined;
  } catch (error) {
    // 捕获任何错误，在非测试环境中返回false
    return false;
  }
};

/**
 * 环境信息接口
 */
export interface EnvironmentInfo {
  isNode: boolean;
  isBrowser: boolean;
  isWorker: boolean;
  isTest: boolean;
  isCocos?: boolean;
  isUnity?: boolean;
}

/**
 * 检测当前运行环境
 * @returns 当前环境信息
 */
export const getEnvironment = (): EnvironmentInfo => {
  const env: EnvironmentInfo = {
    isNode: typeof (globalThis as any).process !== 'undefined' && (globalThis as any).process.versions && (globalThis as any).process.versions.node !== undefined,
    isBrowser: typeof window !== 'undefined' && typeof window.document !== 'undefined',
    isWorker: typeof self === 'object' && self.constructor && self.constructor.name === 'DedicatedWorkerGlobalScope',
    isTest: isTestEnvironment()
  };
  
  // 检测特定游戏引擎环境
  if (typeof window !== 'undefined') {
    env.isCocos = window.cc !== undefined;
    env.isUnity = window.Unity !== undefined;
  }
  
  return env;
};