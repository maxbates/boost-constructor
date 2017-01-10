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

const express = require('express');
const bodyParser = require('body-parser');
const core = require('./lib/api');
const api = require('./lib/index');

const router = express.Router();
router.use(bodyParser.json());

// body-parser ?

// credentials
// can pass credentials as env vars, or as headers boost-username boost-password
router.use((req, res, next) => {
  const username = process.env.BOOST_USERNAME || req.get('boost-username');
  const password = process.env.BOOST_PASSWORD || req.get('boost-password');

  if (!username || !password) {
    res.status(403).send('credentials not set. use env vars or headers: boost-username boost-password');
    return;
  }

  core.getToken(username, password)
  .then((token) => {
    Object.assign(req, { BOOST_TOKEN: token });
    next();
  })
  .catch(err => {
    res.status(500).send(`error fetching boost token: ${err}`);
  });
});

// sequence parsing
// sequences can be passed as a string, either of FASTA or CSV, or array of IUPAC-compliant sequences
// todo - allow files
router.use((req, res, next) => {
  if (!req.body) {
    res.status(422).send('Sequences must be defined on the post body. Pass JSON in form { sequences: <string|array> }');
    return;
  }

  const { sequences } = req.body;

  // todo - verify string format
  if (!(Array.isArray(sequences) || typeof sequences === 'string')) {
    res.status(422).send('sequenes in improper format');
    return;
  }


  Object.assign(req, {
    sequences,
  });

  next();
});

router.post('/verify', (req, res) => {
  const { BOOST_TOKEN, sequences } = req;

  api.verifySequences(BOOST_TOKEN, sequences)
  .then(result => res.send(result))
  .catch(err => res.status(500).send(err));
});

router.post('/reverseTranslate', (req, res) => {
  const { BOOST_TOKEN, sequences } = req;
  const opts = req.query;

  api.reverseTranslate(BOOST_TOKEN, sequences, opts)
  .then(result => res.send(result))
  .catch(resp => resp.text()
    .then(err => res.status(422).json(err))
    .catch(err => res.status(500).send(resp))
  );
});

router.post('/codonJuggle', (req, res) => {
  const { BOOST_TOKEN, sequences } = req;
  const opts = req.query;

  api.codonJuggle(BOOST_TOKEN, sequences, opts)
  .then(result => res.send(result))
  .catch(resp => resp.text()
    .then(err => res.status(422).json(err))
    .catch(err => res.status(500).send(resp))
  );
});

module.exports = router;