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
const uuid = require('uuid');
const api = require('./api');

// currently just returns CSV but could easily do fasta, etc.
function handleSequences(...sequences) {
  const csv = `Name,Sequence\n${sequences.map((sequence, index) => `example_${index},${sequence}`).join('\n')}`;
  const fasta = sequences.map((sequence, index) => `>example_${index}\n${sequence}`).join('\n');

  return fasta;
}

// ///////////////////
// JOBS

function makeJobBody(jobType, jobId, body = {}) {
  return Object.assign({}, body, {
    job: {
      'job-userdefined-id': jobId,
      'job-BOOST-function': jobType,
    },
  });
}

function verifySequences(token, sequences) {
  const body = makeJobBody(
    'VERIFY',
    uuid.v4(),
    {
      constraints: {
        vendor: 'GEN9',
      },
      sequences: {
        'auto-annotate': 'true',
        type: ['DNA'],
        text: handleSequences(...sequences),
      },
    });

  return api.awaitJob(token, body);
}
module.exports.verifySequences = verifySequences;

// ////////////////////
// DIRECT RESPONSES

function codonJuggle(token, sequences, format = 'GENBANK') {
  const url = 'https://boost.jgi.doe.gov/rest/juggler/juggle';

  const body = {
    output: {
      format,
    },
    sequences: {
      'auto-annotate': 'true',
      type: ['DNA'],
      text: handleSequences(...sequences),
    },
    modifications: {
      'genetic-code': 'STANDARD',
      'host-name': 'Arabidopsis thaliana',
      strategy: 'Balanced',
    },
  };

  return api.runService(token, url, body)
    .then(resp => resp.text);
}
module.exports.codonJuggle = codonJuggle;

function reverseTranslate(token, sequences, format = 'GENBANK') {
  const url = 'https://boost.jgi.doe.gov/rest/juggler/juggle';

  const body = {
    output: {
      format,
    },
    sequences: {
      type: ['PROTEIN'],
      text: handleSequences(...sequences),
    },
    modifications: {
      'genetic-code': 'STANDARD',
      'host-name': 'Arabidopsis thaliana',
      strategy: 'Balanced',
    },
  };

  return api.runService(token, url, body)
    .then(resp => resp.text);
}
module.exports.reverseTranslate = reverseTranslate;
