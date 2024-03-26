'use strict';

const corsOptions = {
  origin: 'http://localhost:3000',
  methods: 'GET,POST,PATCH',
  credentials: true,
};

module.exports = { corsOptions };
