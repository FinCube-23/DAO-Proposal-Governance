import { IWeb3StatusCode } from './interfaces';

export enum WEB3STATUS {
  'PENDING' = 'pending',
  'SUCCESS' = 'success',
  'FAILED' = 'failed',
  'UNKNOWN' = 'unknown',
}

export const web3StatusCode: IWeb3StatusCode = {
  [WEB3STATUS.PENDING]: 102,
  [WEB3STATUS.SUCCESS]: 200,
  [WEB3STATUS.FAILED]: 400,
  [WEB3STATUS.UNKNOWN]: 500,
};