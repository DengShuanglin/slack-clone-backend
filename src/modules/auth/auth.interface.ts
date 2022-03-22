/**
 * @file Auth token interface
 * @module module/auth/interface
 * @author Name6
 */

export interface TokenResult {
  access_token: string;
  refresh_token: string;
}

export type CodeResult = { codeId: string };
