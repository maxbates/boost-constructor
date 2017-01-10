/*
 Copyright 2016 Autodesk,Inc.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
const fetch = require('isomorphic-fetch');
const merge = require('lodash.merge');

const debug = require('debug')('boost:api');
const details = require('debug')('boost:details');

const base = 'https://boost.jgi.doe.gov/rest';

if (!debug.enabled) {
  console.log('set ENV VAR DEBUG=boost:api to debug');
}

/* HELPERS */

/*
 function textFetch(...args) {
 return fetch(...args)
 .then((resp) => {
 const clone = resp.clone();

 return resp.text()
 .catch((err) => {
 details('[fetch error]');
 details(err);

 throw clone;
 });
 });
 }
 */

function jsonFetch(...args) {
  return fetch(...args)
  .then((resp) => {
    const clone = resp.clone();
    const textClone = resp.clone();

    return clone.json()
    .catch((err) => {
      details('[fetch error]');
      details(err);

      return textClone.text()
      .then((text) => {
        debug('Original error:');
        debug(text);
        throw resp;
      });
    });
  });
}

/* API */

function getToken(username, password) {
  return jsonFetch(`${base}/auth/login`, {
    method: 'POST',
    mode: 'no-cors',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      password,
    }),
  })
  .then((resp) => {
    const token = resp['boost-jwt'];

    debug(`Got Token for ${username}:
${token}`);

    return token;
  });
}
module.exports.getToken = getToken;

function postJob(token, body = {}) {
  const url = `${base}/jobs/submit`;
  const fetchBody = {
    method: 'POST',
    headers: {
      cookie: `boost-jwt=${token}`,
    },
    body: JSON.stringify(body, null, 2),
  };

  return jsonFetch(url, fetchBody);
}
module.exports.postJob = postJob;

function listJobs(token) {
  const url = `${base}/jobs`;
  const fetchBody = {
    method: 'GET',
    headers: {
      cookie: `boost-jwt=${token}`,
    },
  };

  return jsonFetch(url, fetchBody);
}
module.exports.listJobs = listJobs;

function getJob(token, jobId) {
  const url = `${base}/jobs/${jobId}`;
  const fetchBody = {
    method: 'GET',
    headers: {
      cookie: `boost-jwt=${token}`,
    },
  };

  return jsonFetch(url, fetchBody);
}
module.exports.getJob = getJob;

/* API CALLS */

function pollJob(token, jobId, time = 250) {
  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      details(`polling [${jobId}]`);

      getJob(token, jobId)
      .then((result) => {
        details(result);

        if (result.status !== 'ok') {
          details(`[pollJob] job failed! [${jobId}]`);
          clearInterval(interval);
          reject(result);
          return;
        }

        const status = result.job['job-status'];

        if (status === 'RUNNING') {
          details(`[pollJob] still running... [${jobId}]`);
          return;
        }

        if (status === 'FINISHED') {
          details(`[pollJob] job completed [${jobId}]`);
          clearInterval(interval);
          resolve(result.job['job-report']);
        }
      })
      .catch((err) => {
        console.log(err);
      });
    }, time);
  });
}

function awaitJob(token, job) {
  let jobUuid;
  return postJob(token, job)
  .then((resp) => {
    // lets keep pinging and wait for the job to resolve...
    jobUuid = resp['job-uuid'];
    debug(`[awaitJob] job posted [${jobUuid}]`);

    return pollJob(token, jobUuid);
  })
  .then((result) => {
    debug(`[awaitJob] job response [${jobUuid}]`);
    debug(JSON.stringify(result, null, 2));
    return result;
  })
  .catch((err) => {
    debug(`[awaitJob] job failed [${jobUuid}]`);
    debug(err);
    debug(err.stack);
    throw err;
  });
}
module.exports.awaitJob = awaitJob;

function runService(token, url, job, fetchBody) {
  const body = merge({
    method: 'POST',
    headers: {
      cookie: `boost-jwt=${token}`,
    },
    body: JSON.stringify(job),
  }, fetchBody);

  debug(body);

  return jsonFetch(url, body)
  .then((result) => {
    debug('[runService] response');
    debug(JSON.stringify(result, null, 2));
    return result;
  })
  .catch((err) => {
    debug('[runService] failed');
    debug(err);
    debug(err.stack);
    throw err;
  });
}
module.exports.runService = runService;
