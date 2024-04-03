'use strict';

const corsOptions = {
  // origin: 'http://localhost:3000',
  origin: 'https://soi4an.github.io',

  methods: 'GET,POST,PATCH',
  credentials: true,
};

module.exports = { corsOptions };
