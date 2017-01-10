# boost-constructor

you will need node and npm

`npm install`

### Usage

##### Server (e.g. with Genetic Constructor)

`router.js` is an express router which can be trivially mounted into an express app.

Pass credentials either as environment variables to the node app, or as headers with each request:

```js
fetch('http://localhost:3001/verify', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'boost-username': ___,
    'boost-password': ___
  },
  body: {
    sequences: ['ACGTACGATCGACTGACTGACTACGTAGCTCGTACGGATCGATCGATCGATCGATGCCGTACGATC']
  }
});
```

##### Standalone CLI

There are some examples you can run:

`BOOST_USERNAME=__ BOOST_PASSWORD=___ node run example/reverseTranslate`

`BOOST_USERNAME=__ BOOST_PASSWORD=___ node run example/codonJuggle`

`BOOST_USERNAME=__ BOOST_PASSWORD=___ node run example/verify`

and pass lengths of random sequences into it as numbers

`BOOST_USERNAME=__ BOOST_PASSWORD=___ node run example/verify 300 809`


### Parameters

##### Organism

Possible organisms ([up to date version here](https://boost.jgi.doe.gov/rest/files/predefined_hosts)):

Arabidopsis thaliana
Bacillus subtilis
Escherichia coli
Saccharomyces cerevisiae
