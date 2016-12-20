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

const api = require('../api');
const seq = require('../sequence');

const token = process.env.BOOST_TOKEN;
if (!token) {
  throw Error('no token defined');
}

module.exports = function verifyRandomSequences() {
  const sequences = [400, 1000, 4000].map(seq.randomSequence);

  return api.verifySequences(token, ...sequences)
    .then(response => {
      console.log(JSON.stringify(response, null, 2));
    });
};
