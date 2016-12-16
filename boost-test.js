const api = require('./api');
const seq = require('./sequence');

//config
const username = process.env.BOOST_USERNAME;
const password = process.env.BOOST_PASSWORD;

if (!username || !password) {
  throw Error('set your username and password with env vars BOOST_USERNAME and BOOST_PASSWORD');
}

//you can add your own credentials here
api.getToken(username, password)
  .then(token => {
    const sequences = [400, 1000, 4000].map(seq.randomSequence);

    api.verifySequences(token, ...sequences)
      .then(response => {
        console.log(JSON.stringify(response, null, 2));
      });
  });
