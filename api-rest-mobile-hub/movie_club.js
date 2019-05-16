/**
 * @note Only a few external libraries can be required for use with the custom-code SDK
 * @see https://docs.oracle.com/en/cloud/paas/mobile-suite/develop/implementing-custom-apis.html#GUID-46CDF146-58A6-4673-B81D-70BFB9A669ED
 */
const bodyParser = require('body-parser');
const { databaseAccessAPI } = require('./databaseAccessAPI.endpoint');

const apiRoute = '/mobile/custom/movie_club';

/**
 * The ExpressJS namespace.
 * @external ExpressApplicationObject
 * @see {@link http://expressjs.com/en/4x/api.html#app}
 * Mobile Cloud custom code service entry point.
 * @param app ExpressApplicationObject
 */
const expressAPI = app => {
  app.use(bodyParser.json()); // for parsing application/json
  app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
  app.post(`${apiRoute}/databaseAccessAPI`, databaseAccessAPI);
};

module.exports = expressAPI;
