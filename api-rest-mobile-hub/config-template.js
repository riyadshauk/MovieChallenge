/**
 * @note NOTE: This file (config-template.js) should be copied and renamed as config.js,
 * then modified accordingly.
 */
const { Buffer } = require('buffer');

const authorization = `Basic ${Buffer.from(
  'some-username:some-password'
).toString('base64')}`;

const backendID = 'get this from OMCe webpage';

const config = {
  authorization,
  backendID,
  omceBaseURL: 'get this from OMCe webpage',
  headers: {
    'cache-control': 'no-cache',
    Authorization: authorization,
    'Oracle-Mobile-Backend-ID': backendID
  },
  omceAPIRoute: 'mobile/custom/movie_challenge',
  recommendationAPIURL: 'http://some_ip_address:1234'
};

module.exports = config;
