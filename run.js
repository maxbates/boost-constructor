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

const api = require('./api');
const seq = require('./sequence');

//config
const username = process.env.BOOST_USERNAME;
const password = process.env.BOOST_PASSWORD;

if (!username || !password) {
  throw Error('set your username and password with env vars BOOST_USERNAME and BOOST_PASSWORD');
}

api.getToken(username, password)
  .then(token => {
    Object.assign(process.env, { BOOST_TOKEN: token });

    //example:
    //node run.js example/verifySequence
    const scriptName = process.argv[2];
    const script = require(`./${process.argv[2]}.js`);

    run(script)
      .catch(err => {
        console.error(err);
        console.error(err.stack);
        process.exit(1);
      });
  });

//execution helper
function run(fn) {
  const task = typeof fn.default === 'undefined' ? fn : fn.default;
  const start = new Date();

  magentaLog(`Starting '${task.name}'...`);

  return task().then(result => {
    const end = new Date();
    const time = end.getTime() - start.getTime();

    magentaLog(`Finished '${task.name}' after ${time} ms`);

    return result;
  })
    .catch(err => {
      redLog(`Error running task: ${task.name}`);
      redLog(err.stack);
      throw err;
    });
}

// log helpers

function magentaLog(msg) {
  console.log(`\x1b[35m${msg}\x1b[0m`);
}

function redLog(msg) {
  console.log(`\x1b[31m${msg}\x1b[0m`);
}
