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

const api = require('../lib/index');
const seq = require('../sequence');

const token = process.env.BOOST_TOKEN;
if (!token) {
  throw Error('no token defined');
}

module.exports = function codonJuggle(...lengths) {
  const seqLengths = lengths.length > 0 ? lengths : [900];
  const sequences = seqLengths.map(len => `ATG${seq.randomSequence(len)}TTG`);

  console.log('converting:');
  sequences.forEach(seq => console.log(`${seq.length}bp - ${seq}`));

  return api.codonJuggle(token, sequences, 'GENBANK')
    .then((response) => {
      console.log(response);
    });
};
