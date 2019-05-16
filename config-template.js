/**
 * @note NOTE: This file (config-template.js) should be copied and renamed as config.js,
 * then modified accordingly.
 */
import { Buffer } from 'buffer';

const authorization = `Basic ${Buffer.from(
  'some-username:some-password'
).toString('base64')}`;

const backendID = 'get this from OMCe webpage';

export default {
  authorization,
  backendID,
  omceBaseURL: 'get this from OMCe webpage',
  headers: {
    // 'cache-control': 'no-cache',
    Authorization: authorization,
    'Oracle-Mobile-Backend-ID': backendID
  },
  omceAPIRoute: 'mobile/custom/movie_challenge',
  recommendationAPIURL: 'http://some_ip_address:1234',
  /**
   * @note
   * Make sure to specify 'ws' protocol, and just open your port (ie, 3000) in
   * your VCN/subnet Security List associated with your OCI Compute instance.
   * The default Internet Gateway works fine, with whatever public IP adress it provides.
   * That's all there is to getting websockets to work on Oracle Cloud Infrastructure.
   */
  chatSocketURL: 'ws://128.0.0.0:3000',
  // chatSocketURL: 'http://localhost:3000', // if you use 'http' with localhost, it may auto-upgrade to 'ws'
  chatSocketPath: '' // leave as empty string if your server just serves the websocket at the root path.
};
