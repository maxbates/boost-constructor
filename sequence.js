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

function makeRando(bases = 'ACGT', len) {
  let seq = '';
  for (let i = 0; i < len; i++, seq += bases[Math.floor(Math.random() * bases.length)]);
  return seq;
}

module.exports.randomSequence = makeRando.bind(null, 'ACGT');

module.exports.randomProtein = makeRando.bind(null, 'ACDEFGHIKLMNPQRSTVWY');
