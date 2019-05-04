import config from '../../../config';

const { omceBaseURL, omceAPIRoute, recommendationAPIURL, headers } = config;

const api = 'https://api.themoviedb.org/3';

// The api key is ok to be exposed, it's free and only for self study. I know that the corretly way is to store in a .env file.
const key = '024d69b581633d457ac58359146c43f6';

const defaultContent = {
  api_key: key,
  language: 'en-US'
};

function queryString(obj) {
  return Object.entries(obj)
    .map(([index, val]) => `${index}=${val}`)
    .join('&');
}

const extractAbortControllerSignal = content => {
  const { signal } = content;
  let options;
  if (signal) {
    options = { signal };
    // eslint-disable-next-line no-param-reassign
    delete content.signal;
  }
  return options;
};

export default async function request(url, content = {}, debug = false) {
  const options = extractAbortControllerSignal(content);
  const obj = { ...defaultContent, ...content };
  const response = await fetch(`${api}/${url}?${queryString(obj)}`, options);
  const data = await (debug ? response.status : response.json());
  return data;
}

export function requestDB(body) {
  return new Promise(async (resolve, reject) => {
    try {
      const options = {
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify(body)
      };
      resolve(
        await (await fetch(
          `${omceBaseURL}/${omceAPIRoute}/databaseAccessAPI`,
          options
        )).json()
      );
    } catch (err) {
      reject(err);
    }
  });
}

export function requestRecommendationAPI(route, options) {
  return new Promise(async (resolve, reject) => {
    try {
      resolve(
        await (await fetch(`${recommendationAPIURL}/${route}`, options)).json()
      );
    } catch (err) {
      reject(err);
    }
  });
}
