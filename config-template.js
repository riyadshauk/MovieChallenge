/**
 * @note NOTE: This file (config-template.js) should be copied and renamed as config.js,
 * then modified accordingly.
 */
import { Buffer } from 'buffer';

const authorization = `Basic ${Buffer.from('some-username:some-password').toString('base64')}`;

const backendID = 'get this from OMCe webpage';

export default {
  authorization,
  backendID,
  baseURL: 'get this from OMCe webpage',
  headers: {
    'cache-control': 'no-cache',
    Authorization: authorization,
    'Oracle-Mobile-Backend-ID': backendID
  }
};