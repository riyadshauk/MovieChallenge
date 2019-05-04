/**
 * @see https://docs.oracle.com/en/cloud/paas/mobile-cloud/mcsra/
 * @see https://docs.oracle.com/en/cloud/paas/mobile-cloud/mcsra/api-database-management.html
 * @see https://docs.oracle.com/en/cloud/paas/mobile-cloud/mcsra/api-database-access.html
 */
import https from 'https';
/**
 * @see '../config-template.js' for a template '../config.js' file.
 */
import config from '../config';

const { omceBaseURL, headers, omceAPIRoute } = config;

const baseOptions = {
  hostname: omceBaseURL.replace(':443', '').replace('https://', ''),
  port: 443,
  headers: {
    ...headers,
    'Content-Type': 'application/json',
    'Oracle-Mobile-Extra-Fields': 'id'
  }
};

class WhenAllComplete {
  constructor(collectionLength, resolve, reject) {
    this.resolve = resolve;
    this.reject = reject;
    this.collectionLength = collectionLength;
    this.responseCount = 0;
  }

  increment(msg) {
    if (msg) {
      // eslint-disable-next-line no-console
      console.log(msg);
    }
    this.responseCount += 1;
    if (this.responseCount === this.collectionLength) {
      this.resolve();
    }
  }

  reject(msg) {
    this.reject(msg);
  }
}

const handleResponse = (name, completionHandler) => res => {
  if (!(completionHandler instanceof WhenAllComplete)) {
    return;
  }
  if (res.statusCode === 400) {
    completionHandler.reject(
      new Error(
        `${name}: ${res.statusCode} ${
          res.statusMessage
        } (not created – it may be a duplicate')`
      )
    );
  } else if (res.statusCode === 200 || res.statusCode === 201) {
    completionHandler.increment(
      `${name}: ${
        res.statusCode
      } created (if "${name}" existed, it was first deleted)`
    );
  } else {
    completionHandler.reject(
      new Error(`${name}: ${res.statusCode} ${res.statusMessage}`)
    );
  }
};

/**
 * @description This script should create (or overwrite) the tables specified in `tables`
 * on the database platform on Mobile Hub.
 *
 * @param {(msg: string) => undefined} customReject
 */
export const putTablesOnMobileHub = (tables, customReject = undefined) => {
  const databaseManagementAPIRoute = '/mobile/system/databaseManagement';
  const tablesRoute = `${databaseManagementAPIRoute}/tables`;
  return new Promise((resolve, reject) => {
    const tableList = Object.values(tables);
    const completionHandler = new WhenAllComplete(
      tableList.length,
      resolve,
      customReject || reject
    );
    tableList.forEach(table => {
      const options = {
        ...baseOptions,
        method: 'PUT',
        path: `${tablesRoute}/${table.name}`
      };
      const req = https.request(
        options,
        handleResponse(table.name, completionHandler)
      );
      req.write(JSON.stringify(table));
      req.end();
    });
  });
};

const databaseAccessService = ({
  table = undefined,
  object = undefined,
  options = undefined,
  httpOptions = undefined,
  keys = undefined,
  method = undefined,
  sql = undefined,
  args = undefined
}) => {
  return new Promise(resolve => {
    const body = {
      table,
      object,
      options,
      httpOptions,
      keys,
      method,
      sql,
      args
    };
    const httpRequestOptions = {
      ...baseOptions,
      method: 'POST',
      path: `/${omceAPIRoute}/databaseAccessAPI`,
      headers: {
        ...baseOptions.headers
        // 'Content-Length': JSON.stringify(body).length
      }
    };
    // const resolver = new WhenAllComplete(1, resolve, msg => console.error(msg));
    const req = https.request(httpRequestOptions, () => {
      // eslint-disable-next-line no-console
      console.log(
        `${table}: Request complete for "${
          body.method
        }" with "object" of ${JSON.stringify(body.object)}\n`
      );
      resolve();
    });
    req.on('error', e => {
      // eslint-disable-next-line no-console
      console.error(`problem with request: ${e.message}`);
    });
    req.write(JSON.stringify(body));
    req.end();
  });
};

export const deleteMethod = (
  tableName,
  keys = undefined,
  options = undefined,
  httpOptions = undefined
) =>
  databaseAccessService({
    method: 'delete',
    table: tableName,
    keys,
    options,
    httpOptions
  });

export const get = (
  tableName,
  keys = undefined,
  options = undefined,
  httpOptions = undefined
) =>
  databaseAccessService({
    method: 'get',
    table: tableName,
    keys,
    options,
    httpOptions
  });

export const getAll = (
  tableName,
  options = undefined,
  httpOptions = undefined
) =>
  databaseAccessService({
    method: 'getAll',
    table: tableName,
    options,
    httpOptions
  });

export const insert = (
  tableName,
  object,
  options = undefined,
  httpOptions = undefined
) =>
  databaseAccessService({
    method: 'insert',
    table: tableName,
    object,
    options,
    httpOptions
  });

export const merge = (
  tableName,
  object,
  options = undefined,
  httpOptions = undefined
) =>
  databaseAccessService({
    method: 'merge',
    table: tableName,
    object,
    options,
    httpOptions
  });

// eslint-disable-next-line no-shadow
export const sql = (sql, args, options, httpOptions) =>
  databaseAccessService({ sql, args, options, httpOptions });
