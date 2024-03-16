/* eslint-disable max-len */
/* eslint-disable no-console */
'use strict';

const pg = require('pg');

const conString = 'postgres://tardiemz:9unqUYttcFk-RPMa-dVWFfvqvEWL2N6M@cornelius.db.elephantsql.com/tardiemz';

const client = new pg.Client(conString);

client.connect(function(err) {
  if (err) {
    return console.error('could not connect to postgres', err);
  }

  client.query('SELECT NOW() AS "theTime"', function(err2, result) {
    if (err2) {
      return console.error('error running query', err2);
    }
    console.log(result.rows[0].theTime);
    client.end();
  });
});
