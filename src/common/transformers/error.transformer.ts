/**
 * @file Error transform
 * @description 转换各种特定格式的错误数据
 * @module transformer/error
 * @author Name6
 */

export function getMessageFromNormalError(error: any): any {
  return error?.message || error;
}

export function getMessageFromAxiosError(error: any): any {
  return error?.response?.data || getMessageFromNormalError(error);
}
