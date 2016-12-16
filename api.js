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
const uuid = require('uuid');
const debug = require('debug')('boost');

const base = 'https://boost.jgi.doe.gov/rest';

if (!debug.enabled) {
  console.log('set ENV VAR DEBUG=boost to debug');
}

/* HELPERS */

function jsonFetch(...args) {
  return fetch(...args)
    .then(resp => {
      const clone = resp.clone();

      return resp.json()
        .catch(err => {
          debug(err);

          return clone.text()
            .then(text => {
              debug('Original error:');
              debug(text);
              throw Error('error fetching');
            })
        })
    });
}

function makeJobBody(jobType, jobId, body = {}) {
  return Object.assign({}, body, {
    job: {
      'job-userdefined-id': jobId,
      'job-BOOST-function': jobType
    }
  });
}

/* API */

function getToken(username, password) {
  return jsonFetch(base + '/auth/login', {
    method: 'POST',
    mode: 'no-cors',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      "username": "maxbates@gmail.com",
      "password": "smartgenes!"
    })
  })
    .then(resp => {
      const token = resp['boost-jwt'];

      debug(`Got Token:
${token}`);

      return token;
    });
}
module.exports.getToken = getToken;

function postJob(token, body = {}) {
  const url = base + '/jobs/submit';
  const fetchBody = {
    method: 'POST',
    headers: {
      'cookie': `boost-jwt=${token}`
    },
    body: JSON.stringify(body, null, 2)
  };

  return jsonFetch(url, fetchBody)
}

module.exports.postJob = postJob;

function listJobs(token) {
  const url = base + '/jobs';
  const fetchBody = {
    method: 'GET',
    headers: {
      'cookie': `boost-jwt=${token}`
    },
  };

  return jsonFetch(url, fetchBody);
}
module.exports.listJobs = listJobs;

function getJob(token, jobId) {
  const url = base + '/jobs/' + jobId;
  const fetchBody = {
    method: 'GET',
    headers: {
      'cookie': `boost-jwt=${token}`
    }
  };

  return jsonFetch(url, fetchBody);
}
module.exports.getJob = getJob;

/* API CALLS */

function pollJob(token, jobId, time = 500) {
  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      getJob(token, jobId)
        .then(result => {
          debug(result);

          if (result.status !== 'ok') {
            debug(jobId + ' job failed...');
            clearInterval(interval);
            return reject(result)
          }

          const status = result.job['job-status'];

          if (status === 'RUNNING') {
            debug(jobId + ' still running...');
            return;
          }

          if (status === 'FINISHED') {
            debug(jobId + ' completed');
            clearInterval(interval);
            return resolve(result.job['job-report']);
          }
        })
        .catch(err => {
          console.log(err);
        })
    }, time);
  });
}

function verifySequences(token, ...sequences) {
  const csv = 'Name,Sequence\n' + sequences.map((sequence, index) => `example_${index},${sequence}`).join('\n');
  const body = makeJobBody('VERIFY', uuid.v4(), {
    constraints: { vendor: 'GEN9' },
    sequences: {
      'auto-annotate': 'true',
      type: ['DNA'],
      text: csv
    }
  });

  return postJob(token, body)
    .then(resp => {
      //lets keep pinging and wait for the job to resolve...
      const jobUuid = resp['job-uuid'];
      debug('[VerifySequences] job ID: ' + jobUuid);

      return pollJob(token, jobUuid);
    })
    .then(result => {
      debug('[VerifySequences] response:');
      debug(JSON.stringify(result, null, 2));
      return result;
    })
    .catch(err => {
      console.log(err);
    })
}
module.exports.verifySequences = verifySequences;