import { SetMetadata } from '@nestjs/common';
import { PERMISSION_OPTIONAL_KEY_METADATA } from '@/constants/meta.constant';

/**
 * 使用该注解可开放当前Api权限，无需权限访问
 */
export const PermissionOptional = () =>
  SetMetadata(PERMISSION_OPTIONAL_KEY_METADATA, true);
