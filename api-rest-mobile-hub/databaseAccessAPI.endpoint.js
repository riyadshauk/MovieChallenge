/**
 * @example: GET /mobile/platform/database/objects/{table}/{id} => GET databaseAccessAPI/{table}/{id}
 *
 * @note For security reasons, you can call this {above} operation only from custom API
 * {this Express API} implementations by using the custom code SDK. You can't make direct
 * requests from client applications. This API is included in this reference merely to
 * describe the request and response bodies for the custom code SDK calls.
 *
 * @see https://docs.oracle.com/en/cloud/paas/mobile-suite/rest-api-platform/api-database-access.html
 *
 * @see https://docs.oracle.com/en/cloud/paas/mobile-hub/develop/calling-apis-custom-code.html#GUID-8E7C28B5-316A-415B-9382-43E250F05D28
 */
const databaseAccessAPI = async (req, res) => {
  try {
    const { database } = req.oracleMobile;
    const {
      table,
      object,
      options,
      httpOptions,
      keys,
      method,
      sql,
      args
    } = req.body;
    let result;
    switch (method) {
      case 'delete':
        result = await database.delete(table, keys, options, httpOptions);
        break;
      case 'get':
        result = await database.get(table, keys, options, httpOptions);
        break;
      case 'getAll':
        result = await database.getAll(table, options, httpOptions);
        break;
      case 'insert':
        result = await database.insert(table, object, options, httpOptions);
        break;
      case 'merge':
        result = await database.merge(table, object, options, httpOptions);
        break;
      case 'sql':
        result = await database.sql(sql, args, options, httpOptions);
        break;
      default:
        result = { statusCode: 404, result: '' };
        break;
    }
    res.send(result.statusCode, result.result);
  } catch (err) {
    res.send(500, JSON.stringify(err && err.stack ? err.stack : err));
  }
};
module.exports = {
  databaseAccessAPI
};
