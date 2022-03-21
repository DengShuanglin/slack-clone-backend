/**
 * @file Codec transform
 * @description 编解码各种特定格式数据
 * @module transformer/codec
 * @author Name6
 */

import { Base64 } from 'js-base64';
import { createHash } from 'crypto';

// Base64
export function decodeBase64(value: string): string {
  return value ? Base64.decode(value) : value;
}

// md5
export function encodeMD5(value: string): string {
  return createHash('md5').update(value).digest('hex');
}
