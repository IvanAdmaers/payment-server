import crypto from 'crypto';

/**
 * This function creates a md5 hash
 */
export const md5 = (data: string) =>
  crypto.createHash('md5').update(data).digest('hex');
